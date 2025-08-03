#!/usr/bin/env python3
"""
Simplified Google Sheets integration utility for bitcoin treasury analysis.

This module provides a lightweight wrapper around the Google Sheets API v4
using direct HTTP requests instead of the heavy Google API client libraries.

Environment Variables:
    GOOGLE_API_KEY: Google API key with Sheets API access enabled

Setup:
    1. Go to Google Cloud Console
    2. Enable Google Sheets API
    3. Create an API key (restrict to Sheets API for security)
    4. Make your Google Sheet publicly readable or "Anyone with the link can view"
    5. Set GOOGLE_API_KEY environment variable

Dependencies:
    Only requires: requests, pandas (already in main requirements.txt)
"""

import json
import logging
import os
from datetime import datetime, timedelta
from typing import List
from urllib.parse import quote

import pandas as pd
import requests


def convert_google_sheets_date(serial_number):
    """
    Convert Google Sheets serial date number to datetime.
    
    Google Sheets uses the same date system as Excel:
    - Serial number 1 = January 1, 1900
    - Each increment represents one day
    
    Args:
        serial_number (int or float): Google Sheets date serial number
        
    Returns:
        datetime: Converted datetime object
    """
    try:
        # Google Sheets epoch is January 1, 1900
        # But there's a leap year bug in Excel/Google Sheets where 1900 is treated as a leap year
        # So we need to account for this
        if isinstance(serial_number, (int, float)) and serial_number > 0:
            # Convert to datetime
            # Subtract 2 to account for the 1900 leap year bug and 0-based indexing
            base_date = datetime(1899, 12, 30)  # December 30, 1899
            return base_date + timedelta(days=serial_number)
        else:
            return None
    except (ValueError, TypeError):
        return None


def get_sheet_data(spreadsheet_id: str, range_name: str = 'Sheet1') -> List[List[str]]:
    """
    Retrieve data from a Google Sheet using direct API call.
    
    Args:
        spreadsheet_id (str): The ID of the Google Spreadsheet
        range_name (str): The range to read (e.g., 'Sheet1', 'A1:Z1000', 'Data!A:Z')
        
    Returns:
        List[List[str]]: Raw sheet data as list of rows
        
    Raises:
        Exception: If the API request fails or authentication is invalid
    """
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise Exception(
            "GOOGLE_API_KEY environment variable is required. "
            "Get an API key from Google Cloud Console with Sheets API enabled."
        )
    
    # Build API URL
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/{quote(range_name)}"
    params = {
        'key': api_key,
        'majorDimension': 'ROWS',
        'valueRenderOption': 'UNFORMATTED_VALUE'
    }
    
    try:
        response = requests.get(url, params=params, timeout=4)
        response.raise_for_status()
        
        data = response.json()
        values = data.get('values', [])
        
        logging.info(f"Retrieved {len(values)} rows from Google Sheet {spreadsheet_id}")
        return values
        
    except requests.exceptions.HTTPError as e:
        if response.status_code == 403:
            raise Exception(
                f"Access denied to spreadsheet {spreadsheet_id}. "
                "Make sure the sheet is publicly readable or 'Anyone with the link can view'."
            )
        elif response.status_code == 404:
            raise Exception(f"Spreadsheet {spreadsheet_id} not found.")
        elif response.status_code == 400:
            error_details = response.json().get('error', {}).get('message', 'Unknown error')
            raise Exception(f"Bad request: {error_details}")
        else:
            raise Exception(f"HTTP error {response.status_code}: {e}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error accessing Google Sheets API: {e}")
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON response from Google Sheets API: {e}")


def sheet_to_dataframe(spreadsheet_id: str, range_name: str = 'Sheet1', 
                      header_row: int = 0) -> pd.DataFrame:
    """
    Convert Google Sheet data to a pandas DataFrame.
    
    Args:
        spreadsheet_id (str): The ID of the Google Spreadsheet
        range_name (str): The range to read (e.g., 'Sheet1', 'A1:Z1000')
        header_row (int): Row index to use as column headers (0-based)
        
    Returns:
        pd.DataFrame: DataFrame with the sheet data
        
    Raises:
        Exception: If data retrieval or conversion fails
    """
    try:
        values = get_sheet_data(spreadsheet_id, range_name)
        
        if not values:
            return pd.DataFrame()
        
        # Use specified row as headers
        if header_row < len(values):
            headers = values[header_row]
            data_rows = values[header_row + 1:]
        else:
            # Generate generic headers if header_row is out of range
            max_cols = max(len(row) for row in values) if values else 0
            headers = [f'Column_{i+1}' for i in range(max_cols)]
            data_rows = values
        
        # Pad rows to match header length
        max_cols = len(headers)
        padded_rows = []
        for row in data_rows:
            padded_row = row + [''] * (max_cols - len(row))
            padded_rows.append(padded_row[:max_cols])  # Truncate if too long
        
        df = pd.DataFrame(padded_rows, columns=headers)
        
        logging.info(f"Created DataFrame with {len(df)} rows and {len(df.columns)} columns")
        return df
        
    except Exception as e:
        raise Exception(f"Error converting sheet to DataFrame: {e}")


def load_bitcoin_data_from_sheet(spreadsheet_id: str, range_name: str = 'Sheet1',
                                date_column: str = 'date',
                                btc_balance_column: str = 'btc_balance',
                                shares_column: str = 'diluted_shares_outstanding',
                                stock_price_column: str = 'stock_price',
                                btc_per_share_column: str = None,
                                btc_price_column: str = None) -> pd.DataFrame:
    """
    Load bitcoin treasury data from Google Sheets in the format expected by bitcoin_analysis.py.
    
    Args:
        spreadsheet_id (str): Google Sheets spreadsheet ID or URL
        range_name (str): Sheet range to read
        date_column (str): Name of the date column
        btc_balance_column (str): Name of the BTC balance column
        shares_column (str): Name of the diluted shares outstanding column
        stock_price_column (str): Name of the stock price column
        btc_per_share_column (str): Name of the pre-calculated BTC per share column (optional)
        btc_price_column (str): Name of the Bitcoin price column (optional)
        
    Returns:
        pd.DataFrame: DataFrame formatted for bitcoin analysis
        
    Raises:
        Exception: If required columns are missing or data conversion fails
    """
    try:
        # Load data from sheet
        df = sheet_to_dataframe(spreadsheet_id, range_name)
        
        if df.empty:
            raise Exception("No data found in the specified sheet range")
        
        # Check required columns
        required_columns = [date_column, btc_balance_column, shares_column, stock_price_column]
        if btc_per_share_column is not None:
            required_columns.append(btc_per_share_column)
        if btc_price_column is not None:
            required_columns.append(btc_price_column)
            
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            available_columns = list(df.columns)
            raise Exception(
                f"Missing required columns: {missing_columns}. "
                f"Available columns: {available_columns}"
            )
        
        # Convert data types
        df[date_column] = pd.to_numeric(df[date_column], errors='coerce').apply(convert_google_sheets_date)
        df[btc_balance_column] = pd.to_numeric(df[btc_balance_column], errors='coerce')
        df[shares_column] = pd.to_numeric(df[shares_column], errors='coerce')
        df[stock_price_column] = pd.to_numeric(df[stock_price_column], errors='coerce')
        
        # Convert btc_per_share column if provided
        if btc_per_share_column is not None:
            df[btc_per_share_column] = pd.to_numeric(df[btc_per_share_column], errors='coerce')
        
        # Convert btc_price column if provided
        if btc_price_column is not None:
            df[btc_price_column] = pd.to_numeric(df[btc_price_column], errors='coerce')
        
        # Remove rows with invalid data
        initial_count = len(df)
        required_numeric_columns = [date_column, btc_balance_column, shares_column, stock_price_column]
        if btc_per_share_column is not None:
            required_numeric_columns.append(btc_per_share_column)
        if btc_price_column is not None:
            required_numeric_columns.append(btc_price_column)
            
        df = df.dropna(subset=required_numeric_columns)
        final_count = len(df)
        
        if final_count < initial_count:
            logging.warning(f"Removed {initial_count - final_count} rows with invalid data")
        
        if df.empty:
            raise Exception("No valid data rows after cleaning")
        
        # Rename columns to standard format
        column_mapping = {
            date_column: 'date',
            btc_balance_column: 'btc_balance',
            shares_column: 'diluted_shares_outstanding',
            stock_price_column: 'stock_prices'
        }
        
        if btc_per_share_column is not None:
            column_mapping[btc_per_share_column] = 'btc_per_diluted_share'
        if btc_price_column is not None:
            column_mapping[btc_price_column] = 'btc_prices'
            
        df = df.rename(columns=column_mapping)
        
        # Sort by date
        df = df.sort_values('date').reset_index(drop=True)
        
        # Calculate derived columns needed for analysis
        if btc_per_share_column is None:
            # Calculate if not provided
            df['btc_per_diluted_share'] = df['btc_balance'] / df['diluted_shares_outstanding']
        # If btc_per_share_column was provided, it's already renamed to 'btc_per_diluted_share' above
        
        logging.info(f"Successfully loaded {len(df)} records from Google Sheets")
        logging.info(f"Date range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
        
        return df
        
    except Exception as e:
        raise Exception(f"Error loading bitcoin data from Google Sheets: {e}")
