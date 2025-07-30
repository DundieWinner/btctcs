#!/usr/bin/env python3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis, load_strategy_tracker_stats


def run_analysis():
    setup_plotting()
    
    print("Loading LQWD Bitcoin data...")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'fallback_data.json')
    df = load_strategy_tracker_stats(fallback_file_path=data_path, prefix="LQWD")
    
    print(f"Loaded {len(df)} records from {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    print(f"\nFirst 5 rows:")
    print(df.head())

    chart_config = {
        'global_start_date': '2025-06-17',
    }

    run_company_analysis(df, company_name="LQWD", chart_config=chart_config, output_dir=current_dir)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir)