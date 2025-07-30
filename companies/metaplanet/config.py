import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import (
    setup_plotting,
    load_strategy_tracker_stats,
    create_power_law_chart,
    create_stock_nav_chart,
    create_mnav_chart,
    create_stacked_mc_btc_nav_chart,
    create_btc_per_share_chart
)

company_name = "Metaplanet"


def run_analysis():
    setup_plotting()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    fb_data_path = os.path.join(current_dir, 'fallback_data.json')
    df = load_strategy_tracker_stats(fallback_file_path=fb_data_path, prefix="METAPLANET")
    
    print("\nGenerating charts...")
    print("Generating power_law chart...")
    create_power_law_chart(df, company_name, current_dir)
    
    print("Generating stock_nav chart...")
    create_stock_nav_chart(df, company_name, {
        'nav_reference_levels': [3, 5, 7],
        'nav_reference_colors': ['#0000ff', '#008000', '#ff0000'],
        'projection_months': 2
    }, current_dir)
    
    print("Generating mnav chart...")
    create_mnav_chart(df, company_name, {
        'nav_reference_levels': [3, 5, 7],
        'nav_reference_colors': ['#0000ff', '#008000', '#ff0000']
    }, current_dir)
    
    print("Generating stacked_area chart...")
    create_stacked_mc_btc_nav_chart(df, company_name, {}, current_dir)
    
    print("Generating btc_per_share chart...")
    create_btc_per_share_chart(df, company_name, {}, current_dir)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir)
