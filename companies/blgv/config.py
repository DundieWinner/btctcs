#!/usr/bin/env python3
"""
BLGV (Belgravia Hartford Capital) Bitcoin Treasury Analysis Configuration

This configuration loads data from Google Sheets using a simple API key approach.

Required Environment Variables:
    GOOGLE_API_KEY: Google API key with Sheets API access enabled

Setup:
    1. Go to Google Cloud Console
    2. Enable Google Sheets API
    3. Create an API key (restrict to Sheets API for security)
    4. Make your Google Sheet publicly readable or "Anyone with the link can view"
    5. Set GOOGLE_API_KEY environment variable
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis
from shared_utils.google_sheets import load_bitcoin_data_from_sheet

# BLGV Configuration
BLGV_SPREADSHEET_ID = "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw"
BLGV_SHEET_RANGE = "BLGV Historical"
BLGV_DATE_COLUMN = "Date"
BLGV_BTC_BALANCE_COLUMN = "BTC Held"
BLGV_SHARES_COLUMN = "FD Shares"
BLGV_STOCK_PRICE_COLUMN = "Closing Price (USD)"
BLGV_BTC_PER_SHARE_COLUMN = "Equity Sats / Share"
BLGV_BTC_PRICE_COLUMN = "BTC Price (USD)"


def load_blgv_data():
    """
    Load BLGV data from Google Sheets.
    
    Returns:
        pd.DataFrame: BLGV bitcoin treasury data
        
    Raises:
        Exception: If required environment variables are missing or data loading fails
    """
    
    print(f"Loading BLGV data from Google Sheets...")
    print(f"Spreadsheet ID: {BLGV_SPREADSHEET_ID}")
    print(f"Sheet Range: {BLGV_SHEET_RANGE}")
    print(f"Column Mapping:")
    print(f"  Date: {BLGV_DATE_COLUMN}")
    print(f"  BTC Balance: {BLGV_BTC_BALANCE_COLUMN}")
    print(f"  Diluted Shares: {BLGV_SHARES_COLUMN}")
    print(f"  Stock Price: {BLGV_STOCK_PRICE_COLUMN}")
    print(f"  BTC per Share: {BLGV_BTC_PER_SHARE_COLUMN}")
    print(f"  BTC Price: {BLGV_BTC_PRICE_COLUMN}")
    
    try:
        df = load_bitcoin_data_from_sheet(
            spreadsheet_id=BLGV_SPREADSHEET_ID,
            range_name=BLGV_SHEET_RANGE,
            date_column=BLGV_DATE_COLUMN,
            btc_balance_column=BLGV_BTC_BALANCE_COLUMN,
            shares_column=BLGV_SHARES_COLUMN,
            stock_price_column=BLGV_STOCK_PRICE_COLUMN,
            btc_per_share_column=BLGV_BTC_PER_SHARE_COLUMN,
            btc_price_column=BLGV_BTC_PRICE_COLUMN
        )
        
        print(f"\n✅ Successfully loaded {len(df)} records from Google Sheets")
        print(f"Date range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
        
        return df
        
    except Exception as e:
        print(f"\n❌ Error loading data from Google Sheets: {e}")
        print("\nTroubleshooting:")
        print("1. Verify BLGV_SPREADSHEET_ID is configured correctly in config.py")
        print("2. Check GOOGLE_API_KEY is valid and has Sheets API access")
        print("3. Ensure the Google Sheet is publicly readable or 'Anyone with the link can view'")
        print("4. Verify column names match the spreadsheet headers")
        raise


def run_analysis():
    """
    Run BLGV bitcoin treasury analysis using Google Sheets data.
    
    Returns:
        tuple: (DataFrame, output_directory)
    """
    setup_plotting()
    
    # Load data from Google Sheets
    df = load_blgv_data()
    
    print(f"\nFirst 5 rows:")
    print(df.head())
    
    # BLGV-specific chart configuration
    # These can be customized based on BLGV's trading patterns and preferences
    chart_config = {
        'nav_reference_levels': [2, 3, 4, 5],  # BLGV NAV multiplier levels
        'nav_reference_colors': ['#800080', '#0000ff', '#008000', '#ff0000'],  # Purple, Blue, Green, Red
        'projection_months': 3,  # 3-month projection
        'mnav_start_date': None,  # Use earliest date in dataset
        'global_start_date': None,  # Use all available data
    }
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"\n{'='*60}")
    print("RUNNING BLGV BITCOIN TREASURY ANALYSIS")
    print(f"{'='*60}")
    
    run_company_analysis(df, company_name="BLGV", chart_config=chart_config, output_dir=current_dir)
    
    return df, current_dir


def upload_charts(current_dir):
    """
    Upload generated charts to S3.
    
    Args:
        current_dir (str): Directory containing the charts
        
    Returns:
        dict: Upload results
    """
    from shared_utils.s3_uploader import upload_company_charts
    
    try:
        print(f"\n{'='*60}")
        print("UPLOADING CHARTS TO S3")
        print(f"{'='*60}")
        
        upload_result = upload_company_charts(current_dir, "BLGV")
        
        if upload_result['success_count'] > 0:
            print(f"\n🎉 Successfully uploaded {upload_result['success_count']} charts to S3!")
        
        if upload_result['failure_count'] > 0:
            print(f"\n⚠️  {upload_result['failure_count']} uploads failed. Check logs above for details.")
            
        return upload_result
        
    except Exception as e:
        print(f"\n❌ Error uploading charts: {e}")
        print("Charts are still available locally in the company directory.")
        return {'success_count': 0, 'failure_count': 0, 'error': str(e)}


if __name__ == "__main__":
    try:
        df, output_dir = run_analysis()
        print(f"\n✅ Analysis complete! Charts saved to: {output_dir}")
        
        # Optional: Upload to S3 if configured
        if any(key.startswith('S3_') or key.startswith('AWS_') for key in os.environ):
            upload_charts(output_dir)
        else:
            print("\n💡 To enable S3 upload, configure AWS credentials and S3_BUCKET_NAME")
            
    except Exception as e:
        print(f"\n❌ Analysis failed: {e}")
        sys.exit(1)
