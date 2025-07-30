#!/usr/bin/env python3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis, load_strategy_tracker_stats


def run_analysis():
    setup_plotting()
    
    print("Loading Metaplanet Bitcoin data...")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'fallback_data.json')
    df = load_strategy_tracker_stats(fallback_file_path=data_path, prefix="METAPLANET")
    
    print(f"Loaded {len(df)} records from {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    print(f"\nFirst 5 rows:")
    print(df.head())

    # Define custom chart generators for Metaplanet
    from shared_utils.bitcoin_analysis import (
        create_power_law_generator,
        create_stock_nav_generator,
        create_mnav_generator,
        create_stacked_area_generator,
        create_btc_per_share_generator
    )
    
    # Create custom chart generators with Metaplanet-specific configurations
    chart_generators = {
        'power_law': create_power_law_generator(),
        'stock_nav': create_stock_nav_generator(),  # Uses default NAV levels
        'mnav': create_mnav_generator(),  # Uses default settings
        'stacked_area': create_stacked_area_generator(),
        'btc_per_share': create_btc_per_share_generator()
    }
    # Note: Metaplanet uses default configurations

    run_company_analysis(df, company_name="Metaplanet", output_dir=current_dir, chart_generators=chart_generators)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir)
