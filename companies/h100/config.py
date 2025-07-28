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
    run_analysis()
