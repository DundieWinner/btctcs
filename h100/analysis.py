#!/usr/bin/env python3

import sys
import os

# Add parent directory to path to import shared_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis, load_strategy_tracker_stats


def main():
    """Main analysis function for H100"""
    setup_plotting()
    
    print("Loading H100 Bitcoin data...")
    
    # Use the shared data loading function with H100-specific fallback
    current_dir = os.path.dirname(os.path.abspath(__file__))
    h100_data_path = os.path.join(current_dir, 'data.json')
    df = load_strategy_tracker_stats(fallback_file_path=h100_data_path)
    
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
