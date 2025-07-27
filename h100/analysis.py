#!/usr/bin/env python3
"""
H100 Bitcoin Analysis
====================
"""

# Import required libraries
import json
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from datetime import datetime, timedelta

def main():
    """Main analysis orchestrator function"""
    # Step 1: Setup
    setup_plotting()
    
    # Step 2: Load data
    df = load_data()
    
    # Step 3: Filter and deduplicate
    valid_data, unique_data, duplicates = filter_and_deduplicate_data(df)
    
    # Step 4: Log transformation
    log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique, log_btc_per_diluted_share_unique = perform_log_transformation(valid_data, unique_data)
    
    # Step 5: Regression analysis
    reg, y_pred_plot, r2 = fit_power_law_regression(log_btc_balance, log_btc_balance_unique, log_btc_per_diluted_share_unique, unique_data)
    
    # Step 6: Calculate statistics
    correlation, slope, intercept, a_coeff = calculate_statistics(log_btc_balance_unique, log_btc_per_diluted_share_unique, reg)
    
    # Step 7: Create visualization
    create_chart(log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique, 
                log_btc_per_diluted_share_unique, y_pred_plot, unique_data, 
                correlation, slope, a_coeff, r2)
    
    # Step 8: Create stock price vs NAV chart
    create_stock_nav_chart(df)
    
    # Step 9: Create mNAV chart
    create_mnav_chart(df)
    
    # Step 10: Create stacked area chart
    create_stacked_area_chart(df)
    
    # Step 11: Print analysis results
    print_detailed_summary(df, valid_data, unique_data, duplicates, correlation, slope, a_coeff, r2)


def setup_plotting():
    """Configure matplotlib plotting settings"""
    plt.style.use('default')
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['font.size'] = 12


def load_data(filename='data.json'):
    """Load H100 data from JSON file and return DataFrame"""
    print("Loading H100 Bitcoin data...")
    with open(filename, 'r') as f:
        data = json.load(f)

    # Extract historical data
    hist_data = data['historicalData']
    df = pd.DataFrame({
        'date': hist_data['dates'],
        'btc_balance': hist_data['btc_balance'],
        'btc_per_share': hist_data['btc_per_share'],
        'btc_per_diluted_share': hist_data['btc_per_diluted_share'],
        'diluted_shares_outstanding': hist_data['diluted_shares_outstanding'],
        'stock_prices': hist_data['stock_prices'],
        'btc_prices': hist_data['btc_prices'],
        'market_cap_basic': hist_data['market_cap_basic']
    })

    print(f"Loaded {len(df)} records from {df['date'].min()} to {df['date'].max()}")
    print("\nFirst 5 rows:")
    print(df.head())

    return df


def filter_and_deduplicate_data(df):
    """Filter valid data and remove duplicates for analysis"""
    # Filter valid data for log transformation (remove zeros/negatives)
    valid_data = df[(df['btc_balance'] > 0) & (df['btc_per_diluted_share'] > 0)]
    print(f"\nValid data points for log transformation: {len(valid_data)}")

    # Check for duplicates
    duplicates = valid_data.duplicated(subset=['btc_balance', 'btc_per_diluted_share'])
    print(f"Duplicate datapoints found: {duplicates.sum()}")

    # Remove duplicate datapoints for regression (keep unique combinations)
    unique_data = valid_data.drop_duplicates(subset=['btc_balance', 'btc_per_diluted_share'])
    print(f"Unique data points for regression: {len(unique_data)}")

    # Show the unique Bitcoin holding levels
    print("\nUnique Bitcoin holding levels:")
    print(sorted(unique_data['btc_balance'].unique()))

    return valid_data, unique_data, duplicates


def perform_log_transformation(valid_data, unique_data):
    """Apply log10 transformation to the data"""
    # Calculate log10 values for all valid data (for plotting)
    log_btc_balance = np.log10(valid_data['btc_balance'])
    log_btc_per_diluted_share = np.log10(valid_data['btc_per_diluted_share'])

    # Calculate log10 values for unique data (for regression)
    log_btc_balance_unique = np.log10(unique_data['btc_balance'])
    log_btc_per_diluted_share_unique = np.log10(unique_data['btc_per_diluted_share'])

    print("Log transformation completed for both all data and unique data")

    return log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique, log_btc_per_diluted_share_unique


def fit_power_law_regression(log_btc_balance, log_btc_balance_unique, log_btc_per_diluted_share_unique, unique_data):
    """Fit linear regression on log-log data to find power law relationship"""
    print("\nFitting regression on unique datapoints only...")
    X_unique = log_btc_balance_unique.values.reshape(-1, 1)
    y_unique = log_btc_per_diluted_share_unique.values

    reg = LinearRegression().fit(X_unique, y_unique)

    # Generate predictions for plotting (using full range for smooth line)
    X_plot = log_btc_balance.values.reshape(-1, 1)
    y_pred_plot = reg.predict(X_plot)

    # Calculate R² using unique data
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
    a_coeff = 10 ** intercept

    return correlation, slope, intercept, a_coeff


def create_chart(log_btc_balance, log_btc_per_diluted_share, log_btc_balance_unique,
                 log_btc_per_diluted_share_unique, y_pred_plot, unique_data,
                 correlation, slope, a_coeff, r2):
    """Create and save the log-log chart with power law fit"""
    print("\nCreating Log-Log Chart with Fitted Power Law Function")
    print("=" * 70)

    plt.figure(figsize=(12, 8))

    # Highlight unique points used for regression
    plt.scatter(log_btc_balance_unique, log_btc_per_diluted_share_unique,
                alpha=0.9, s=80, c='red', edgecolors='darkred', linewidth=1,
                label=f'BTC Treasury Updates ({len(unique_data)})', zorder=5)

    # Plot fitted line
    sort_idx = np.argsort(log_btc_balance)
    plt.plot(log_btc_balance.iloc[sort_idx], y_pred_plot[sort_idx],
             'r-', linewidth=3, label='Fitted Power Law', alpha=0.8, zorder=4)

    # Labels and title
    plt.xlabel('Bitcoin Holdings (BTC)', fontsize=14, fontweight='bold')
    plt.ylabel('Bitcoin per Diluted Share', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    plt.suptitle('Bitcoin Holdings vs Bitcoin per Diluted Share (Log-Log Scale)',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'Power Law Relationship Analysis\n@DunderHODL - {current_date}', 
              fontsize=12, pad=20)

    # Create equation text
    equation_text = f'Power Law: y = {a_coeff:.2e} × x^{slope:.3f}'

    # Display statistics
    stats_text = (f'Correlation: {correlation:.3f}\n'
                  f'R² (unique data): {r2:.3f}\n'
                  f'{equation_text}')

    plt.text(0.05, 0.95, stats_text,
             transform=plt.gca().transAxes, fontsize=11,
             bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8),
             verticalalignment='top')

    # Add legend and grid
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    # Save the plot
    plt.savefig('log_log_chart_no_duplicates.png', dpi=300, bbox_inches='tight')
    plt.show()


def create_stock_nav_chart(df):
    """Create stock price vs NAV multipliers per share chart with time extension"""
    print("\nCreating Stock Price vs NAV Multipliers Per Share Chart")
    print("=" * 60)

    plt.figure(figsize=(14, 10))

    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Calculate NAV (Net Asset Value) = BTC Balance * BTC Price
    df['nav'] = df['btc_balance'] * df['btc_prices']
    
    # Calculate NAV multipliers per share (divide by diluted shares outstanding)
    df['nav_3x_per_share'] = (df['nav'] * 3) / df['diluted_shares_outstanding']
    df['nav_5x_per_share'] = (df['nav'] * 5) / df['diluted_shares_outstanding']
    df['nav_7x_per_share'] = (df['nav'] * 7) / df['diluted_shares_outstanding']
    
    # Calculate 30-day average daily bitcoin yield
    last_30_days = df.tail(30)  # Get last 30 days of data
    if len(last_30_days) < 2:
        # If we don't have enough data, use all available data
        last_30_days = df
    
    # Calculate daily bitcoin balance changes
    btc_changes = last_30_days['btc_balance'].diff().dropna()
    daily_btc_yield = btc_changes.mean()
    
    print(f"30-day average daily bitcoin yield: {daily_btc_yield:.4f} BTC/day")
    
    # Extend time axis 2 months into the future
    last_date = df['date'].max()
    future_dates = pd.date_range(start=last_date + timedelta(days=1), 
                                periods=60, freq='D')  # ~2 months
    
    # Get the last values for projection
    last_btc_balance = df['btc_balance'].iloc[-1]
    last_btc_price = df['btc_prices'].iloc[-1]
    last_diluted_shares = df['diluted_shares_outstanding'].iloc[-1]
    
    # Project future bitcoin accumulation and NAV per share
    future_nav_3x_per_share = []
    future_nav_5x_per_share = []
    future_nav_7x_per_share = []
    
    for i, future_date in enumerate(future_dates):
        days_ahead = i + 1
        projected_btc_balance = last_btc_balance + (daily_btc_yield * days_ahead)
        
        # Assume bitcoin price stays constant for projection (could be enhanced with price models)
        projected_nav = projected_btc_balance * last_btc_price
        
        # Calculate NAV multipliers per share
        nav_3x_per_share = (projected_nav * 3) / last_diluted_shares
        nav_5x_per_share = (projected_nav * 5) / last_diluted_shares
        nav_7x_per_share = (projected_nav * 7) / last_diluted_shares
        
        future_nav_3x_per_share.append(nav_3x_per_share)
        future_nav_5x_per_share.append(nav_5x_per_share)
        future_nav_7x_per_share.append(nav_7x_per_share)
    
    # Plot historical stock price (dotted line)
    plt.plot(df['date'], df['stock_prices'], 'k--', linewidth=2, 
             label='H100 Stock Price (USD)', alpha=0.8)
    
    # Plot NAV multipliers per share (solid lines)
    plt.plot(df['date'], df['nav_3x_per_share'], 'b-', linewidth=2, 
             label='3x Bitcoin NAV per Share', alpha=0.8)
    plt.plot(df['date'], df['nav_5x_per_share'], 'g-', linewidth=2, 
             label='5x Bitcoin NAV per Share', alpha=0.8)
    plt.plot(df['date'], df['nav_7x_per_share'], 'r-', linewidth=2, 
             label='7x Bitcoin NAV per Share', alpha=0.8)
    
    # Plot future NAV multipliers per share with projected accumulation (solid lines, lighter)
    plt.plot(future_dates, future_nav_3x_per_share, 'b-', linewidth=2, 
             alpha=0.5)
    plt.plot(future_dates, future_nav_5x_per_share, 'g-', linewidth=2, 
             alpha=0.5)
    plt.plot(future_dates, future_nav_7x_per_share, 'r-', linewidth=2, 
             alpha=0.5)
    
    # Add vertical line to separate historical from projected data
    plt.axvline(x=last_date, color='gray', linestyle=':', alpha=0.7, 
                label='Projection Start')

    # Labels and title
    plt.xlabel('Date', fontsize=14, fontweight='bold')
    plt.ylabel('Price per Share (USD)', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    plt.suptitle('Stock Price vs Bitcoin NAV Multipliers per Share',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'Extended 2 Months with Projected BTC Accumulation\n@DunderHODL - {current_date}', 
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
    plt.savefig('h100_stock_nav_per_share_chart.png', dpi=300, bbox_inches='tight')
    print(f"Chart saved as 'h100_stock_nav_per_share_chart.png'")
    plt.show()


def create_mnav_chart(df):
    """Create mNAV chart showing stock price as multiple of NAV"""
    print("\nCreating mNAV Chart (Stock Price Multiple of NAV)")
    print("=" * 60)

    plt.figure(figsize=(14, 10))

    # Convert date column to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Filter data from June 16th onwards
    june_16_2025 = pd.to_datetime('2025-06-16')
    df_filtered = df[df['date'] >= june_16_2025].copy()
    
    if len(df_filtered) == 0:
        print("No data available from June 16th onwards")
        return
    
    # Calculate NAV (Net Asset Value) = BTC Balance * BTC Price
    df_filtered['nav'] = df_filtered['btc_balance'] * df_filtered['btc_prices']
    
    # Calculate fully diluted market cap manually = Diluted Shares Outstanding * Stock Price
    df_filtered['fully_diluted_market_cap'] = df_filtered['diluted_shares_outstanding'] * df_filtered['stock_prices']
    
    # Calculate mNAV (multiple of NAV) = Fully Diluted Market Cap / Bitcoin NAV
    df_filtered['mnav'] = df_filtered['fully_diluted_market_cap'] / df_filtered['nav']
    
    print(f"Filtered data from {df_filtered['date'].min().strftime('%Y-%m-%d')} to {df_filtered['date'].max().strftime('%Y-%m-%d')}")
    print(f"mNAV range: {df_filtered['mnav'].min():.2f}x to {df_filtered['mnav'].max():.2f}x")
    
    # Plot historical mNAV (solid line)
    plt.plot(df_filtered['date'], df_filtered['mnav'], 'b-', linewidth=2, 
             label='Stock Price Multiple of Bitcoin NAV', alpha=0.8)

    # Labels and title
    plt.xlabel('Date', fontsize=14, fontweight='bold')
    plt.ylabel('Multiple of NAV (mNAV)', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # Get the most recent mNAV value for labeling
    most_recent_mnav = df_filtered['mnav'].iloc[-1]
    most_recent_date = df_filtered['date'].iloc[-1]
    
    plt.suptitle('Stock Price as Multiple of Bitcoin NAV',
                 fontsize=16, fontweight='bold', y=0.98)
    plt.title(f'Market Valuation vs Bitcoin Holdings (from June 16th)\nCurrent mNAV: {most_recent_mnav:.2f}x | @DunderHODL - {current_date}', 
              fontsize=12, pad=20)

    # Add NAV reference lines with matching colors from stock NAV chart
    plt.axhline(y=3.0, color='b', linestyle='--', alpha=0.7, label='3x NAV')
    plt.axhline(y=5.0, color='g', linestyle='--', alpha=0.7, label='5x NAV')
    plt.axhline(y=7.0, color='r', linestyle='--', alpha=0.7, label='7x NAV')
    
    # Add a data point dot on the most recent mNAV value
    plt.plot(most_recent_date, most_recent_mnav, 'bo', markersize=8, zorder=5)
    
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
    plt.savefig('h100_mnav_chart.png', dpi=300, bbox_inches='tight')
    print(f"Chart saved as 'h100_mnav_chart.png'")
    plt.show()


def create_stacked_area_chart(df):
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
                     alpha=0.7, color='lightblue', label='Fully Diluted Market Cap')
    plt.fill_between(df['date'], 0, df['bitcoin_nav'], 
                     alpha=0.7, color='orange', label='Bitcoin Net Asset Value')
    
    # Plot the lines on top for clarity
    plt.plot(df['date'], df['fully_diluted_market_cap'], 'b-', linewidth=2, alpha=0.8)
    plt.plot(df['date'], df['bitcoin_nav'], 'orange', linewidth=2, alpha=0.8)
    
    # Find intersection point: where historical market cap equals current bitcoin NAV
    current_bitcoin_nav = df['bitcoin_nav'].iloc[-1]
    current_date = df['date'].iloc[-1]
    
    # Find the closest historical market cap value to current bitcoin NAV
    market_cap_diff = abs(df['fully_diluted_market_cap'] - current_bitcoin_nav)
    intersection_idx = market_cap_diff.idxmin()
    intersection_date = df['date'].iloc[intersection_idx]
    intersection_market_cap = df['fully_diluted_market_cap'].iloc[intersection_idx]
    
    # Calculate days between intersection and current date
    days_difference = (current_date - intersection_date).days
    
    # Draw dashed line from current bitcoin NAV to intersection point
    plt.plot([intersection_date, current_date], 
             [intersection_market_cap, current_bitcoin_nav], 
             'r--', linewidth=2, alpha=0.8)
    
    # Add annotation for the dashed line
    mid_date = intersection_date + (current_date - intersection_date) / 2
    mid_value = (intersection_market_cap + current_bitcoin_nav) / 2
    plt.annotate(f'{days_difference} days', 
                xy=(mid_date, mid_value),
                xytext=(0, 20), textcoords='offset points',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.8),
                fontsize=10, fontweight='bold', ha='center')
    
    # Add markers at intersection points
    plt.plot(intersection_date, intersection_market_cap, 'ro', markersize=8, zorder=5)
    plt.plot(current_date, current_bitcoin_nav, 'ro', markersize=8, zorder=5)

    # Labels and title
    plt.xlabel('Date', fontsize=14, fontweight='bold')
    plt.ylabel('Value (USD)', fontsize=14, fontweight='bold')
    
    # Get current date for subtitle
    from datetime import datetime
    chart_date = datetime.now().strftime('%Y-%m-%d')
    
    plt.suptitle('Market Cap vs Bitcoin NAV Over Time',
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
    plt.savefig('h100_stacked_area_chart.png', dpi=300, bbox_inches='tight')
    print(f"Chart saved as 'h100_stacked_area_chart.png'")
    print(f"Intersection found: {days_difference} days ago (Market Cap: ${intersection_market_cap:,.0f}, Current Bitcoin NAV: ${current_bitcoin_nav:,.0f})")
    plt.show()


def print_detailed_summary(df, valid_data, unique_data, duplicates, correlation, slope, a_coeff, r2):
    """Print comprehensive analysis summary"""
    print(f"\nDETAILED ANALYSIS SUMMARY")
    print(f"=" * 50)
    print(f"Dataset: {len(df)} total records, {len(valid_data)} valid for analysis")
    print(f"Unique datapoints: {len(unique_data)} (used for regression)")
    print(f"Duplicate removal: {duplicates.sum()} duplicates removed")
    print(f"")
    print(f"POWER LAW RELATIONSHIP:")
    print(f"• Equation: y = {a_coeff:.2e} × x^{slope:.3f}")
    print(f"• R² = {r2:.6f} (excellent fit)")
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


if __name__ == "__main__":
    main()
