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

    chart_config = {
        'nav_reference_levels': [3, 5, 7],
        'nav_reference_colors': ['#0000ff', '#008000', '#ff0000'],
        'projection_months': 2,
        'mnav_start_date': '2025-06-16',
    }

    run_company_analysis(df, company_name="H100", chart_config=chart_config, output_dir=current_dir)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir, "H100")