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
    
    # Step 8: Print analysis results
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
        'diluted_shares_outstanding': hist_data['diluted_shares_outstanding']
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
    plt.xlabel('Log₁₀(H100 Bitcoins Held)', fontsize=14, fontweight='bold')
    plt.ylabel('Log₁₀(H100 BTC per Diluted Share)', fontsize=14, fontweight='bold')
    plt.title('H100: Bitcoin Holdings vs BTC per Diluted Share (Log-Log Scale)',
              fontsize=16, fontweight='bold', pad=20)

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

    # Add signature
    add_signature()

    # Save the plot
    plt.savefig('log_log_chart_no_duplicates.png', dpi=300, bbox_inches='tight')
    plt.show()


def add_signature(text="@DunderHodl", position=(1, -0.08)):
    """Add signature to bottom-right of entire figure, under x-axis"""
    plt.text(position[0], position[1], text, transform=plt.gca().transAxes,
             fontsize=10, ha='right', va='bottom', alpha=0.7,
             bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8))


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
