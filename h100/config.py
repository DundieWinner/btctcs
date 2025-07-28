#!/usr/bin/env python3
import sys
import os

# Add parent directory to path to import shared_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis, load_strategy_tracker_stats


def run_h100_analysis():
    """
    Run the complete H100 bitcoin treasury analysis
    
    Returns:
        tuple: (dataframe, current_directory) for potential follow-up operations
    """
    setup_plotting()
    
    print("Loading H100 Bitcoin data...")
    
    # Use the shared data loading function with H100-specific fallback and prefix
    current_dir = os.path.dirname(os.path.abspath(__file__))
    h100_data_path = os.path.join(current_dir, 'data.json')
    df = load_strategy_tracker_stats(fallback_file_path=h100_data_path, prefix="H100")
    
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
    
    return df, current_dir


def upload_h100_charts(current_dir):
    """
    Upload H100 charts to S3
    
    Args:
        current_dir (str): Directory containing the PNG chart files
        
    Returns:
        dict: Upload results
    """
    from shared_utils.s3_uploader import upload_company_charts
    
    try:
        print(f"\n{'='*60}")
        print("UPLOADING CHARTS TO S3")
        print(f"{'='*60}")
        
        upload_result = upload_company_charts(current_dir, "H100")
        
        if upload_result['success_count'] > 0:
            print(f"\n🎉 Successfully uploaded {upload_result['success_count']} charts to S3!")
        
        if upload_result['failure_count'] > 0:
            print(f"\n⚠️  {upload_result['failure_count']} uploads failed. Check logs above for details.")
            
        return upload_result
            
    except ValueError as e:
        print(f"\n⚠️  S3 upload skipped: {e}")
        print("To enable S3 upload, set the following environment variables:")
        print("  - S3_BUCKET_NAME")
        print("  - AWS_ACCESS_KEY_ID") 
        print("  - AWS_SECRET_ACCESS_KEY")
        print("  - AWS_REGION (optional, defaults to us-east-1)")
        print("  - S3_KEY_PREFIX (optional, defaults to 'charts')")
        return None
    except Exception as e:
        print(f"\n❌ S3 upload failed: {e}")
        return None


if __name__ == "__main__":
    # When run directly, just do the analysis
    run_h100_analysis()
