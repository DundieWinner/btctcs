#!/usr/bin/env python3
"""
BLGV Bitcoin Treasury Analysis with S3 Upload

This script runs the full BLGV analysis pipeline and uploads results to S3.
Designed for use with automated workflows (GitHub Actions, serverless functions, etc.)
"""

from config import run_analysis, upload_charts

if __name__ == "__main__":
    df, output_dir = run_analysis()
    upload_charts(output_dir)
