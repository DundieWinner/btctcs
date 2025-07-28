#!/usr/bin/env python3
"""
H100 Bitcoin Treasury Analysis
=============================
Company-specific analysis script using shared bitcoin analysis pipeline
"""

import json
import pandas as pd
import sys
import os

# Add parent directory to path to import shared_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis


def load_data(filename='data.json'):
    """Load H100 data from JSON file"""
    with open(filename, 'r') as f:
        data = json.load(f)
    
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


def main():
    """Main analysis function for H100"""
    setup_plotting()
    
    print("Loading H100 Bitcoin data...")
    df = load_data()
    
    print(f"Loaded {len(df)} records from {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    print(f"\nFirst 5 rows:")
    print(df.head())
    
    # H100-specific chart configuration
    h100_chart_config = {
        'nav_reference_levels': [3, 5, 7],  # H100 uses 3x, 5x, 7x NAV reference lines
        'nav_reference_colors': ['#0000ff', '#008000', '#ff0000'],  # Custom colors for H100 (blue, green, red)
        'projection_months': 2,  # 2-month projection
        'mnav_start_date': '2025-06-16',  # Start mNAV chart from June 16th
    }
    
    # Run the generalized analysis pipeline with H100-specific configuration
    run_company_analysis(df, company_name="H100", chart_config=h100_chart_config)


if __name__ == "__main__":
    main()
