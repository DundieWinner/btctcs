#!/usr/bin/env python3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis, load_strategy_tracker_stats


def run_analysis():
    setup_plotting()

    current_dir = os.path.dirname(os.path.abspath(__file__))
    h100_data_path = os.path.join(current_dir, 'fallback_data.json')
    df = load_strategy_tracker_stats(fallback_file_path=h100_data_path, prefix="H100")
    
    print(f"Loaded {len(df)} records from {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    print(f"\nFirst 5 rows:")
    print(df.head())

    # Define custom chart generators for H100
    from shared_utils.bitcoin_analysis import (
        create_power_law_generator,
        create_stock_nav_generator,
        create_mnav_generator,
        create_stacked_area_generator,
        create_btc_per_share_generator
    )
    
    # Create custom chart generators with H100-specific configurations
    chart_generators = {
        'power_law': create_power_law_generator(),
        'stock_nav': create_stock_nav_generator(
            nav_levels=[3, 5, 7],  # H100-specific NAV levels
            nav_colors=['#0000ff', '#008000', '#ff0000'],  # H100-specific colors
            projection_months=2
        ),
        'mnav': create_mnav_generator(
            mnav_start_date='2025-06-16'  # H100-specific start date
        ),
        'stacked_area': create_stacked_area_generator(),
        'btc_per_share': create_btc_per_share_generator()
    }

    run_company_analysis(df, company_name="H100", output_dir=current_dir, chart_generators=chart_generators)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir, "H100")