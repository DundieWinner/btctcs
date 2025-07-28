#!/usr/bin/env python3
"""
Shared Bitcoin Treasury Analysis Module
=====================================
Provides reusable analysis functions for bitcoin treasury companies
"""

# Import required libraries
import json
import os
from datetime import timedelta

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


def load_strategy_tracker_stats(fallback_file_path=None, prefix=None):
    """
    Load bitcoin treasury data from prefixed DATA_URL environment variable or fallback to local file
    
    Args:
        fallback_file_path (str): Path to fallback JSON file if DATA_URL is not set
                                 Defaults to 'h100/fallback_data.json' relative to project root
        prefix (str): Prefix for environment variable (e.g., 'H100' for 'H100_DATA_URL')
                     If None, uses 'DATA_URL'
    
    Returns:
        pd.DataFrame: Processed dataframe with bitcoin treasury data
    """
    # Determine environment variable name
    if prefix:
        env_var_name = f"{prefix}_DATA_URL"
    else:
        env_var_name = "DATA_URL"
    
    # Check for prefixed DATA_URL environment variable
    data_url = os.getenv(env_var_name)
    
    if data_url:
        print(f"Loading data from URL ({env_var_name}): {data_url}")
        try:
            response = requests.get(data_url, timeout=30)
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()
            print("Successfully loaded data from URL")
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from URL: {e}")
            print("Falling back to local file...")
            data = None
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from URL: {e}")
            print("Falling back to local file...")
            data = None
    else:
        data = None
    
    # Fallback to local file if URL failed or not provided
    if data is None:
        if fallback_file_path is None:
            # Default fallback to h100/fallback_data.json relative to project root
            current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            fallback_file_path = os.path.join(current_dir, 'h100', 'fallback_data.json')
        
        print(f"Loading data from local file: {fallback_file_path}")
        try:
            with open(fallback_file_path, 'r') as f:
                data = json.load(f)
            print("Successfully loaded data from local file")
        except FileNotFoundError:
            raise FileNotFoundError(f"Could not find fallback data file: {fallback_file_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Error parsing JSON from local file: {e}")
    
    # Process the data into DataFrame
    hist_data = data['historicalData']
    df = pd.DataFrame({
        'date': hist_data['dates'],
        'btc_balance': hist_data['btc_balance'],
        'stock_prices': hist_data['stock_prices'],
        'btc_prices': hist_data['btc_prices'],
        'diluted_shares_outstanding': hist_data['diluted_shares_outstanding'],
        'market_cap_basic': hist_data['market_cap_basic']
    })
    
    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Calculate btc_per_diluted_share for analysis
    df['btc_per_diluted_share'] = df['btc_balance'] / df['diluted_shares_outstanding']
    
    return df


def setup_plotting():
    """Configure matplotlib plotting settings"""
    plt.style.use('default')
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['font.size'] = 12


def run_company_analysis(df, company_name="Company", chart_config=None, output_dir=None):
    """Run complete analysis pipeline for a given company with customizable chart options"""
    print(f"\n{'='*60}")
    print(f"RUNNING ANALYSIS FOR {company_name}")
    print(f"{'='*60}")

    default_config = {
        'nav_reference_levels': [3, 5, 7],
        'nav_reference_colors': ['#0000ff', '#008000', '#ff0000'],
        'projection_months': 2,
    }
    
    # Merge user config with defaults
    if chart_config is None:
        chart_config = {}
    config = {**default_config, **chart_config}
    
    # Step 1: Filter and deduplicate
    valid_data, unique_data, duplicates = filter_and_deduplicate_data(df)
    
    # Step 2: Log transformation
    log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique, log_btc_per_diluted_share_unique = perform_log_transformation(valid_data, unique_data)
    
    # Step 3: Regression analysis
    reg, y_pred_plot, r2 = fit_power_law_regression(log_btc_balance, log_btc_balance_unique, log_btc_per_diluted_share_unique, unique_data)
    
    # Step 4: Calculate statistics
    correlation, slope, intercept, a_coeff = calculate_statistics(log_btc_balance_unique, log_btc_per_diluted_share_unique, reg)
    
    # Step 5: Create visualizations
    create_chart(log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique, 
                log_btc_per_diluted_share_unique, y_pred_plot, unique_data, 
                correlation, slope, a_coeff, r2, company_name, output_dir)
    
    create_stock_nav_chart(df, company_name, config, output_dir)
    
    create_mnav_chart(df, company_name, config, output_dir)
    
    create_stacked_area_chart(df, company_name, output_dir)
    
    # Step 6: Print analysis results
    print_detailed_summary(df, valid_data, unique_data, duplicates, correlation, slope, a_coeff, r2, company_name)


def filter_and_deduplicate_data(df):
    """Filter valid data and remove duplicates for analysis"""
    print("Filtering and deduplicating data...")
    
    # Filter out rows with missing or zero values
    valid_data = df[(df['btc_balance'] > 0) & 
                   (df['btc_per_diluted_share'] > 0) & 
                   (df['btc_balance'].notna()) & 
                   (df['btc_per_diluted_share'].notna())].copy()
    
    # Remove duplicates based on btc_balance (keeping first occurrence)
    unique_data = valid_data.drop_duplicates(subset=['btc_balance'], keep='first')
    duplicates = len(valid_data) - len(unique_data)
    
    print(f"Valid data points for log transformation: {len(valid_data)}")
    print(f"Duplicate datapoints found: {duplicates}")
    print(f"Unique data points for regression: {len(unique_data)}")
    
    return valid_data, unique_data, duplicates


def perform_log_transformation(valid_data, unique_data):
    """Apply log10 transformation to the data"""
    print("\nUnique Bitcoin holding levels:")
    print(list(unique_data['btc_balance'].values))
    
    # Log transformation for all valid data
    log_btc_balance = np.log10(valid_data['btc_balance'])
    log_btc_per_diluted_share = np.log10(valid_data['btc_per_diluted_share'])
    
    # Log transformation for unique data only
    log_btc_balance_unique = np.log10(unique_data['btc_balance'])
    log_btc_per_diluted_share_unique = np.log10(unique_data['btc_per_diluted_share'])
    
    print("Log transformation completed for both all data and unique data")
    
    return log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique, log_btc_per_diluted_share_unique


def fit_power_law_regression(log_btc_balance, log_btc_balance_unique, log_btc_per_diluted_share_unique, unique_data):
    """Fit linear regression on log-log data to find power law relationship"""
    print(f"\nFitting regression on unique datapoints only...")
    
    # Fit linear regression on log-log data (unique points only)
    X_unique = log_btc_balance_unique.values.reshape(-1, 1)
    y_unique = log_btc_per_diluted_share_unique.values
    
    reg = LinearRegression()
    reg.fit(X_unique, y_unique)
    
    # Generate prediction line for plotting (using full range)
    X_plot = np.linspace(log_btc_balance.min(), log_btc_balance.max(), 100).reshape(-1, 1)
    y_pred_plot = reg.predict(X_plot)
    
    # Calculate R² for unique data
    y_pred_unique = reg.predict(X_unique)
    r2 = r2_score(y_unique, y_pred_unique)
    
    print(f"Regression fitted on {len(unique_data)} unique points")
    print(f"R² (unique data): {r2:.6f}")
    
    return reg, y_pred_plot, r2


def calculate_statistics(log_btc_balance_unique, log_btc_per_diluted_share_unique, reg):
    """Calculate correlation and power law equation parameters"""
    correlation = np.corrcoef(log_btc_balance_unique, log_btc_per_diluted_share_unique)[0, 1]
    slope = reg.coef_[0]
    intercept = reg.intercept_
    a_coeff = 10**intercept
    
    return correlation, slope, intercept, a_coeff


def create_chart(log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique,
                 log_btc_per_diluted_share_unique, y_pred_plot, unique_data,
                 correlation, slope, a_coeff, r2, company_name, output_dir=None):
    """Create and save the log-log chart with power law fit"""
    print("\nCreating Log-Log Chart with Fitted Power Law Function")
    print("=" * 70)

    plt.figure(figsize=(12, 8))

    # Highlight unique points used for regression
    plt.scatter(log_btc_balance_unique, log_btc_per_diluted_share_unique,
                alpha=0.9, s=80, c='#ff0000', edgecolors='#8b0a1a', linewidth=1,
                label=f'{company_name} Treasury Updates ({len(unique_data)})', zorder=5)

    # Plot fitted line
    sort_idx = np.argsort(log_btc_balance)
    X_plot = np.linspace(log_btc_balance.min(), log_btc_balance.max(), 100)
    y_pred_plot = slope * X_plot + np.log10(a_coeff)
    plt.plot(X_plot, y_pred_plot,
             '#ff0000', linewidth=3, label='Fitted Power Law', alpha=0.8, zorder=4)

    # Labels and title
    plt.xlabel('Bitcoin Holdings (BTC)', fontsize=14, fontweight='bold')
    plt.ylabel('Bitcoin per Diluted Share', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    plt.suptitle(f'{company_name} Holdings vs Bitcoin per Diluted Share (Log-Log Scale)',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'Power Law Relationship Analysis\n@DunderHODL - {current_date}', 
              fontsize=12, pad=20)

    # Create equation text
    equation_text = f'Power Law: y = {a_coeff:.2e} × x^{slope:.3f}'
    stats_text = f'R² = {r2:.6f} | Correlation = {correlation:.6f}'
    
    # Add text box with equation and statistics
    textstr = f'{equation_text}\n{stats_text}'
    props = dict(boxstyle='round', facecolor='wheat', alpha=0.8)
    plt.text(0.05, 0.95, textstr, transform=plt.gca().transAxes, fontsize=10,
             verticalalignment='top', bbox=props)

    # Add legend and grid
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    # Save the plot
    filename = f'{company_name.lower()}_log_log_btc_held_vs_btc_per_diluted_share.png'
    if output_dir:
        filepath = os.path.join(output_dir, filename)
    else:
        filepath = filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.show()


def create_stock_nav_chart(df, company_name, config, output_dir=None):
    """Create stock price vs NAV multipliers per share chart with time extension"""
    print("\nCreating Stock Price vs NAV Multipliers Per Share Chart")
    print("=" * 60)

    plt.figure(figsize=(14, 10))

    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Calculate NAV (Net Asset Value) = BTC Balance * BTC Price
    df['nav'] = df['btc_balance'] * df['btc_prices']
    
    # Get NAV reference levels and colors from config
    nav_levels = config.get('nav_reference_levels', [3, 5, 7])
    nav_colors = config.get('nav_reference_colors', ['#0000ff', '#008000', '#ff0000'])
    projection_months = config.get('projection_months', 2)
    
    # Calculate NAV multipliers per share (divide by diluted shares outstanding)
    nav_columns = {}
    for level in nav_levels:
        column_name = f'nav_{level}x_per_share'
        df[column_name] = (df['nav'] * level) / df['diluted_shares_outstanding']
        nav_columns[level] = column_name
    
    # Calculate 30-day average daily bitcoin yield
    last_30_days = df.tail(30)  # Get last 30 days of data
    if len(last_30_days) < 2:
        # If we don't have enough data, use all available data
        last_30_days = df
    
    # Calculate daily bitcoin balance changes
    btc_changes = last_30_days['btc_balance'].diff().dropna()
    daily_btc_yield = btc_changes.mean()
    
    print(f"30-day average daily bitcoin yield: {daily_btc_yield:.4f} BTC/day")
    
    # Extend time axis based on projection_months
    last_date = df['date'].max()
    projection_days = projection_months * 30  # Approximate days per month
    future_dates = pd.date_range(start=last_date + timedelta(days=1), 
                                periods=projection_days, freq='D')
    
    # Get the last values for projection
    last_btc_balance = df['btc_balance'].iloc[-1]
    last_btc_price = df['btc_prices'].iloc[-1]
    last_diluted_shares = df['diluted_shares_outstanding'].iloc[-1]
    
    # Project future bitcoin accumulation and NAV per share
    future_nav_per_share = {level: [] for level in nav_levels}
    
    for i, future_date in enumerate(future_dates):
        days_ahead = i + 1
        projected_btc_balance = last_btc_balance + (daily_btc_yield * days_ahead)
        
        # Assume bitcoin price stays constant for projection (could be enhanced with price models)
        projected_nav = projected_btc_balance * last_btc_price
        
        # Calculate NAV multipliers per share
        for level in nav_levels:
            nav_per_share = (projected_nav * level) / last_diluted_shares
            future_nav_per_share[level].append(nav_per_share)
    
    # Plot historical stock price (dotted line)
    plt.plot(df['date'], df['stock_prices'], '#000000', linestyle='--', linewidth=2, 
             label=f'{company_name} Stock Price (USD)', alpha=0.8)
    
    # Plot NAV multipliers per share (solid lines)
    for i, level in enumerate(nav_levels):
        color = nav_colors[i] if i < len(nav_colors) else f'C{i}'
        column_name = nav_columns[level]
        plt.plot(df['date'], df[column_name], color, linewidth=2, 
                 label=f'{level}x Bitcoin NAV per Share', alpha=0.8)
        
        # Plot future NAV multipliers per share with projected accumulation (solid lines, lighter)
        plt.plot(future_dates, future_nav_per_share[level], color, linewidth=2, 
                 alpha=0.5)
    
    # Add vertical line to separate historical from projected data
    plt.axvline(x=last_date, color='#808080', linestyle=':', alpha=0.7, 
                label='Projection Start')

    # Labels and title
    plt.xlabel('Date', fontsize=14, fontweight='bold')
    plt.ylabel('Price per Share (USD)', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    plt.suptitle(f'{company_name} Stock Price vs Bitcoin NAV Multipliers per Share',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'Extended {projection_months} Months with Projected BTC Accumulation\n@DunderHODL - {current_date}', 
              fontsize=12, pad=20)

    # Set log scale for y-axis
    plt.yscale('log')
    
    # Format y-axis to avoid scientific notation
    from matplotlib.ticker import FuncFormatter
    def format_func(value, tick_number):
        if value >= 1:
            return f'${value:.2f}'
        else:
            return f'${value:.4f}'
    plt.gca().yaxis.set_major_formatter(FuncFormatter(format_func))
    
    # Add legend and grid
    plt.legend(loc='upper left', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # Format x-axis dates
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the plot
    filename = f'{company_name.lower()}_time_vs_stock_price_and_nav_multiples.png'
    if output_dir:
        filepath = os.path.join(output_dir, filename)
    else:
        filepath = filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.show()


def create_mnav_chart(df, company_name, config, output_dir=None):
    """Create mNAV chart showing stock price as multiple of NAV"""
    print("\nCreating mNAV Chart (Stock Price Multiple of NAV)")
    print("=" * 60)

    plt.figure(figsize=(14, 10))

    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Get configuration options
    nav_levels = config.get('nav_reference_levels', [3, 5, 7])
    nav_colors = config.get('nav_reference_colors', ['#0000ff', '#008000', '#ff0000'])
    start_date = config.get('mnav_start_date')
    
    # Filter data from start_date onwards if provided
    if start_date:
        filter_date = pd.to_datetime(start_date)
        df_filtered = df[df['date'] >= filter_date].copy()
        
        if len(df_filtered) == 0:
            print(f"No data available from {start_date} onwards")
            return
    else:
        # Use all available data if no start date specified
        df_filtered = df.copy()
    
    # Calculate NAV (Net Asset Value) = BTC Balance * BTC Price
    df_filtered['nav'] = df_filtered['btc_balance'] * df_filtered['btc_prices']
    
    # Calculate fully diluted market cap manually = Diluted Shares Outstanding * Stock Price
    df_filtered['fully_diluted_market_cap'] = df_filtered['diluted_shares_outstanding'] * df_filtered['stock_prices']
    
    # Calculate mNAV (multiple of NAV) = Fully Diluted Market Cap / Bitcoin NAV
    df_filtered['mnav'] = df_filtered['fully_diluted_market_cap'] / df_filtered['nav']
    
    print(f"Filtered data from {df_filtered['date'].min().strftime('%Y-%m-%d')} to {df_filtered['date'].max().strftime('%Y-%m-%d')}")
    print(f"mNAV range: {df_filtered['mnav'].min():.2f}x to {df_filtered['mnav'].max():.2f}x")
    
    # Plot historical mNAV (solid line)
    plt.plot(df_filtered['date'], df_filtered['mnav'], '#0000ff', linewidth=2, 
             label=f'{company_name} Stock Price Multiple of Bitcoin NAV', alpha=0.8)

    # Labels and title
    plt.xlabel('Date', fontsize=14, fontweight='bold')
    plt.ylabel('Multiple of NAV (mNAV)', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # Get the most recent mNAV value for labeling
    most_recent_mnav = df_filtered['mnav'].iloc[-1]
    most_recent_date = df_filtered['date'].iloc[-1]
    
    plt.suptitle(f'{company_name} Stock Price as Multiple of Bitcoin NAV',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'Market Valuation vs Bitcoin Holdings (from {start_date if start_date else "beginning"})\nCurrent mNAV: {most_recent_mnav:.2f}x | @DunderHODL - {current_date}', 
              fontsize=12, pad=20)

    # Add NAV reference lines with matching colors from stock NAV chart
    for i, level in enumerate(nav_levels):
        color = nav_colors[i] if i < len(nav_colors) else f'C{i}'
        plt.axhline(y=level, color=color, linestyle='--', alpha=0.7, label=f'{level}x NAV')
    
    # Add a data point dot on the most recent mNAV value
    plt.plot(most_recent_date, most_recent_mnav, '#0000ff', markersize=8, zorder=5)
    
    # Add annotation for the most recent mNAV value
    plt.annotate(f'{most_recent_mnav:.2f}x', 
                xy=(most_recent_date, most_recent_mnav),
                xytext=(10, 10), textcoords='offset points',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7),
                fontsize=10, fontweight='bold')
    
    # Add legend and grid
    plt.legend(loc='upper left', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # Format x-axis dates
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the plot
    filename = f'{company_name.lower()}_time_vs_mnav.png'
    if output_dir:
        filepath = os.path.join(output_dir, filename)
    else:
        filepath = filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.show()


def create_stacked_area_chart(df, company_name, output_dir=None):
    """Create a stacked area chart showing market cap and bitcoin NAV with intersection analysis"""
    print("\nCreating Stacked Area Chart (Market Cap vs Bitcoin NAV)")
    print("=" * 60)

    plt.figure(figsize=(14, 10))

    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Calculate NAV (Net Asset Value) = BTC Balance * BTC Price
    df['bitcoin_nav'] = df['btc_balance'] * df['btc_prices']
    
    # Calculate fully diluted market cap = Diluted Shares Outstanding * Stock Price
    df['fully_diluted_market_cap'] = df['diluted_shares_outstanding'] * df['stock_prices']
    
    print(f"Data range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    print(f"Market cap range: ${df['fully_diluted_market_cap'].min():,.0f} to ${df['fully_diluted_market_cap'].max():,.0f}")
    print(f"Bitcoin NAV range: ${df['bitcoin_nav'].min():,.0f} to ${df['bitcoin_nav'].max():,.0f}")
    
    # Create stacked area chart
    plt.fill_between(df['date'], 0, df['fully_diluted_market_cap'], 
                     alpha=0.7, color='#add8e6', label='Fully Diluted Market Cap')
    plt.fill_between(df['date'], 0, df['bitcoin_nav'], 
                     alpha=0.7, color='#ffa07a', label='Bitcoin Net Asset Value')
    
    # Plot the lines on top for clarity
    plt.plot(df['date'], df['fully_diluted_market_cap'], '#0000ff', linewidth=2, alpha=0.8)
    plt.plot(df['date'], df['bitcoin_nav'], '#ff0000', linewidth=2, alpha=0.8)
    
    # Find intersection point: where historical market cap equals current bitcoin NAV
    current_bitcoin_nav = df['bitcoin_nav'].iloc[-1]
    current_date = df['date'].iloc[-1]
    
    # Find the most recent date where market cap crossed above current bitcoin NAV
    # Look for the most recent transition from below to above current NAV
    intersection_idx = None
    for i in range(len(df) - 1, 0, -1):  # Start from end, go backwards, stop at index 1
        current_market_cap = df['fully_diluted_market_cap'].iloc[i]
        previous_market_cap = df['fully_diluted_market_cap'].iloc[i-1]
        
        # Check if this is a crossing point: previous was below, current is above
        if (previous_market_cap < current_bitcoin_nav and 
            current_market_cap >= current_bitcoin_nav):
            intersection_idx = i
            break
    
    if intersection_idx is not None:
        intersection_date = df['date'].iloc[intersection_idx]
        intersection_market_cap = df['fully_diluted_market_cap'].iloc[intersection_idx]
        
        # Calculate days between intersection and current date
        days_difference = (current_date - intersection_date).days
        
        # Draw dashed line from crossing point to current bitcoin NAV
        plt.plot([intersection_date, current_date], 
                 [intersection_market_cap, current_bitcoin_nav], 
                 '#ff0000', linestyle='--', linewidth=2, alpha=0.8)
        
        # Add annotation for the dashed line
        mid_date = intersection_date + (current_date - intersection_date) / 2
        mid_value = (intersection_market_cap + current_bitcoin_nav) / 2
        plt.annotate(f'{days_difference} days', 
                    xy=(mid_date, mid_value),
                    xytext=(0, 20), textcoords='offset points',
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.8),
                    fontsize=10, fontweight='bold', ha='center')
        
        # Add markers at intersection points
        plt.plot(intersection_date, intersection_market_cap, '#0000ff', markersize=8, zorder=5)
        plt.plot(current_date, current_bitcoin_nav, '#0000ff', markersize=8, zorder=5)
    else:
        # If no crossing found, set default values
        days_difference = 0
        intersection_market_cap = 0
    
    # Labels and title
    plt.xlabel('Date', fontsize=14, fontweight='bold')
    plt.ylabel('Value (USD)', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    chart_date = datetime.now().strftime('%Y-%m-%d')
    
    plt.suptitle(f'{company_name} Market Cap vs Bitcoin NAV Over Time',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'@DunderHODL - {chart_date}',
              fontsize=12, pad=20)

    # Format y-axis to show values in millions without scientific notation
    from matplotlib.ticker import FuncFormatter
    def format_millions(value, tick_number):
        if value >= 1e6:
            return f'${value/1e6:.1f}M'
        elif value >= 1e3:
            return f'${value/1e3:.0f}K'
        else:
            return f'${value:.0f}'
    plt.gca().yaxis.set_major_formatter(FuncFormatter(format_millions))
    
    # Set log scale for y-axis
    plt.yscale('log')
    
    # Add legend and grid
    plt.legend(loc='upper left', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # Format x-axis dates
    plt.xticks(rotation=45)
    plt.tight_layout()

    # Save the plot
    filename = f'{company_name.lower()}_stacked_time_vs_mc_and_nav.png'
    if output_dir:
        filepath = os.path.join(output_dir, filename)
    else:
        filepath = filename
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    print(f"Intersection found: {days_difference} days ago (Market Cap: ${intersection_market_cap:,.0f}, Current Bitcoin NAV: ${current_bitcoin_nav:,.0f})")
    plt.show()


def print_detailed_summary(df, valid_data, unique_data, duplicates, correlation, slope, a_coeff, r2, company_name):
    """Print comprehensive analysis summary"""
    print(f"\nDETAILED ANALYSIS SUMMARY FOR {company_name}")
    print(f"=" * 50)
    print(f"Dataset: {len(df)} total records, {len(valid_data)} valid for analysis")
    print(f"Unique datapoints: {len(unique_data)} (used for regression)")
    print(f"Duplicate removal: {duplicates} duplicates removed")
    print(f"")
    print(f"POWER LAW RELATIONSHIP:")
    print(f"• Equation: y = {a_coeff:.2e} × x^{slope:.3f}")
    print(f"• R² = {r2:.6f} ({'excellent' if r2 > 0.95 else 'good' if r2 > 0.8 else 'moderate'} fit)")
    print(f"• Correlation = {correlation:.6f}")
    print(f"• Exponent = {slope:.3f}")
    print(f"")
    print(f"INTERPRETATION:")
    if slope < 1:
        print(f"Exponent interpretation: {slope:.3f} < 1 (diminishing returns)")
    elif slope > 1:
        print(f"Exponent interpretation: {slope:.3f} > 1 (increasing returns)")
    else:
        print(f"Exponent interpretation: {slope:.3f} ≈ 1 (linear relationship)")
