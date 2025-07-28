#!/usr/bin/env python3
from config import run_h100_analysis, upload_h100_charts


def main():
    """Main analysis function for H100 with S3 upload"""
    # Run the H100 analysis
    df, current_dir = run_h100_analysis()
    
    # Upload generated charts to S3
    upload_h100_charts(current_dir)


if __name__ == "__main__":
    main()
