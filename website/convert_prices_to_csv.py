#!/usr/bin/env python3
"""
Script to convert prices.json to CSV with human-readable dates
"""

import json
import csv
from datetime import datetime
import os

def convert_prices_to_csv(json_file_path, csv_file_path):
    """
    Convert prices JSON to CSV with human-readable dates
    Only keeps the 12:00:00 price from each day
    
    Args:
        json_file_path (str): Path to the input JSON file
        csv_file_path (str): Path to the output CSV file
    """
    
    # Read the JSON file
    print(f"Reading JSON file: {json_file_path}")
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    
    # Extract prices array
    prices = data.get('prices', [])
    print(f"Found {len(prices)} price records")
    
    if not prices:
        print("No price data found in JSON file")
        return
    
    # Get all currency columns from the first record (excluding 'time')
    sample_record = prices[0]
    currency_columns = [key for key in sample_record.keys() if key != 'time']
    print(f"Currency columns found: {currency_columns}")
    
    # Filter for only 12:00:00 prices
    daily_prices = []
    seen_dates = set()
    
    print("Filtering for daily 12:00:00 prices...")
    for record in prices:
        timestamp = record['time']
        
        try:
            dt = datetime.fromtimestamp(timestamp)
            
            # Check if this is a 12:00:00 time
            if dt.hour == 12 and dt.minute == 0 and dt.second == 0:
                date_str = dt.strftime('%Y-%m-%d')
                
                # Only keep one 12:00:00 price per day (in case of duplicates)
                if date_str not in seen_dates:
                    daily_prices.append(record)
                    seen_dates.add(date_str)
                    
        except (ValueError, OSError) as e:
            print(f"Warning: Could not convert timestamp {timestamp}: {e}")
            continue
    
    print(f"Filtered to {len(daily_prices)} daily records (12:00:00 only)")
    
    if not daily_prices:
        print("No 12:00:00 price records found")
        return
    
    # Prepare CSV headers
    csv_headers = ['date', 'datetime', 'timestamp'] + currency_columns
    
    # Write to CSV
    print(f"Writing CSV file: {csv_file_path}")
    with open(csv_file_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        
        # Write headers
        writer.writerow(csv_headers)
        
        # Write data rows
        for record in daily_prices:
            timestamp = record['time']
            
            # Convert Unix timestamp to human-readable date
            try:
                dt = datetime.fromtimestamp(timestamp)
                date_only = dt.strftime('%Y-%m-%d')
                human_date = dt.strftime('%Y-%m-%d %H:%M:%S')
            except (ValueError, OSError) as e:
                print(f"Warning: Could not convert timestamp {timestamp}: {e}")
                date_only = f"INVALID_DATE_{timestamp}"
                human_date = f"INVALID_TIMESTAMP_{timestamp}"
            
            # Build row data
            row = [date_only, human_date, timestamp]
            
            # Add currency values
            for currency in currency_columns:
                row.append(record.get(currency, ''))
            
            writer.writerow(row)
    
    print(f"✅ Successfully converted {len(daily_prices)} daily records to CSV")
    print(f"📁 Output file: {csv_file_path}")

def main():
    """Main function"""
    # File paths
    json_file = 'prices.json'
    csv_file = 'prices.csv'
    
    # Check if JSON file exists
    if not os.path.exists(json_file):
        print(f"❌ Error: {json_file} not found in current directory")
        return
    
    try:
        convert_prices_to_csv(json_file, csv_file)
        
        # Show some sample data
        print("\n📊 Sample of converted data:")
        with open(csv_file, 'r') as f:
            lines = f.readlines()
            for i, line in enumerate(lines[:6]):  # Show first 5 data rows + header
                print(f"  {line.strip()}")
                if i == 0:
                    print("  " + "-" * 50)
        
        if len(lines) > 6:
            print(f"  ... and {len(lines) - 6} more rows")
            
    except Exception as e:
        print(f"❌ Error during conversion: {e}")

if __name__ == "__main__":
    main()
