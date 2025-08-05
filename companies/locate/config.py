import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import (
    setup_plotting,
    create_power_law_chart,
)
from shared_utils.google_sheets import load_bitcoin_data_from_sheet

company_name = "Locate Technologies"
SPREADSHEET_ID = "1hyRTvjiXQbXU6UnPmZoRDF9Rs7vL8YYYfFsrqu6Jk8Q"
SHEET_RANGE = "Locate|H"
DATE_COLUMN = "Date"
BTC_BALANCE_COLUMN = "BTC Held"
SHARES_COLUMN = "FD Shares"
STOCK_PRICE_COLUMN = "Closing Price (USD)"
BTC_PER_SHARE_COLUMN = "BTC / FD Share"
FWD_BTC_PER_SHARE_COLUMN = "Fwd Sats / FD Share"
BTC_PRICE_COLUMN = "BTC Price (USD)"


def load_data():
    try:
        df = load_bitcoin_data_from_sheet(
            spreadsheet_id=SPREADSHEET_ID,
            range_name=SHEET_RANGE,
            date_column=DATE_COLUMN,
            btc_balance_column=BTC_BALANCE_COLUMN,
            shares_column=SHARES_COLUMN,
            stock_price_column=STOCK_PRICE_COLUMN,
            btc_per_share_column=BTC_PER_SHARE_COLUMN,
            btc_price_column=BTC_PRICE_COLUMN
        )

        from shared_utils.google_sheets import sheet_to_dataframe
        import pandas as pd
        
        raw_df = sheet_to_dataframe(SPREADSHEET_ID, SHEET_RANGE)

        if FWD_BTC_PER_SHARE_COLUMN in raw_df.columns:
            fwd_eq_btc_per_share = pd.to_numeric(raw_df[FWD_BTC_PER_SHARE_COLUMN], errors='coerce')
            df[FWD_BTC_PER_SHARE_COLUMN] = fwd_eq_btc_per_share
            print(f"✅ Added {FWD_BTC_PER_SHARE_COLUMN} column to DataFrame")
        else:
            print(f"⚠️  Warning: {FWD_BTC_PER_SHARE_COLUMN} column not found in sheet")
        
        print(f"\n✅ Successfully loaded {len(df)} records from Google Sheets")
        print(f"Date range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
        print(f"Available columns: {list(df.columns)}")
        
        return df
        
    except Exception as e:
        print(f"\nError loading data from Google Sheets: {e}")
        print("\nTroubleshooting:")
        print("1. Verify SPREADSHEET_ID is configured correctly in config.py")
        print("2. Check GOOGLE_API_KEY is valid and has Sheets API access")
        print("3. Ensure the Google Sheet is publicly readable or 'Anyone with the link can view'")
        print("4. Verify column names match the spreadsheet headers")
        raise


def run_analysis():
    setup_plotting()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    df = load_data()

    share_config = {
        'share_type': 'Fully Diluted Share'
    }
    
    print("\nGenerating charts...")
    print("Generating power_law chart...")
    create_power_law_chart(df, company_name, share_config, current_dir)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir)
