import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared_utils.bitcoin_analysis import (
    setup_plotting,
    create_power_law_chart,
    create_stock_nav_chart,
    create_stacked_mc_btc_nav_chart,
    create_btc_per_share_chart
)
from shared_utils.google_sheets import load_bitcoin_data_from_sheet

company_name = "BLGV"
BLGV_SPREADSHEET_ID = "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw"
BLGV_SHEET_RANGE = "BLGV Historical"
BLGV_DATE_COLUMN = "Date"
BLGV_BTC_BALANCE_COLUMN = "BTC Held"
BLGV_SHARES_COLUMN = "FD Shares"
BLGV_STOCK_PRICE_COLUMN = "Closing Price (USD)"
BLGV_BTC_PER_SHARE_COLUMN = "BTC / FD Share"
BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN = "Fwd BTC Eq. / FD Share"
BLGV_BTC_PRICE_COLUMN = "BTC Price (USD)"


def load_data():
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

        from shared_utils.google_sheets import sheet_to_dataframe
        import pandas as pd
        
        raw_df = sheet_to_dataframe(BLGV_SPREADSHEET_ID, BLGV_SHEET_RANGE)

        if BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN in raw_df.columns:
            # Convert to numeric and add to our main dataframe
            fwd_eq_btc_per_share = pd.to_numeric(raw_df[BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN], errors='coerce')
            df[BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN] = fwd_eq_btc_per_share
            print(f"✅ Added {BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN} column to DataFrame")
        else:
            print(f"⚠️  Warning: {BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN} column not found in sheet")
        
        print(f"\n✅ Successfully loaded {len(df)} records from Google Sheets")
        print(f"Date range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
        print(f"Available columns: {list(df.columns)}")
        
        return df
        
    except Exception as e:
        print(f"\nError loading data from Google Sheets: {e}")
        print("\nTroubleshooting:")
        print("1. Verify BLGV_SPREADSHEET_ID is configured correctly in config.py")
        print("2. Check GOOGLE_API_KEY is valid and has Sheets API access")
        print("3. Ensure the Google Sheet is publicly readable or 'Anyone with the link can view'")
        print("4. Verify column names match the spreadsheet headers")
        raise


def run_analysis():
    setup_plotting()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    df = load_data()
    
    print("\nGenerating charts...")
    print("Generating power_law chart...")
    create_power_law_chart(df, company_name, current_dir)
    
    print("Generating stock_nav chart...")
    create_stock_nav_chart(df, company_name, {
        'nav_reference_levels': [4, 5, 6],
        'nav_reference_colors': ['#0000ff', '#008000', '#ff0000'],
        'projection_months': 1
    }, current_dir)

    print("Generating stacked_area chart...")
    create_stacked_mc_btc_nav_chart(df, company_name, {}, current_dir)

    print("Generating btc_per_share chart...")
    create_btc_per_share_chart(df, company_name, {
        'btc_per_share_columns': ['btc_per_diluted_share', BLGV_FWD_EQ_BTC_PER_SHARE_COLUMN],
        'btc_per_share_labels': ["Sats / FD Share", "Fwd Sats Eq. / FD Share"],
        'btc_per_share_colors': ['#0000ff', '#ff6600']
    }, current_dir)
    
    return df, current_dir


def upload_charts(current_dir):
    from shared_utils import upload_charts as shared_upload_charts
    return shared_upload_charts(current_dir)
