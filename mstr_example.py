#!/usr/bin/env python3
"""
MSTR (MicroStrategy) Bitcoin Treasury Analysis Example
=====================================================
Demonstrates how different companies can use custom chart configurations
"""

import json
import pandas as pd
import sys
import os

# Add parent directory to path to import shared_utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared_utils.bitcoin_analysis import setup_plotting, run_company_analysis


def load_mstr_data(filename='mstr_data.json'):
    """Load MSTR data from JSON file (example structure)"""
    # This would load actual MSTR data in the same format as H100
    # For demonstration purposes, we'll show the expected structure
    pass


def main():
    """Main analysis function for MSTR with custom configuration"""
    setup_plotting()
    
    # MSTR-specific chart configuration (different from H100)
    mstr_chart_config = {
        'nav_reference_levels': [2, 4, 6, 8],  # MSTR might use different NAV reference lines
        'nav_reference_colors': ['purple', 'orange', 'cyan', 'magenta'],  # Different colors
        'projection_months': 3,  # Longer projection period
        'mnav_start_date': '2025-01-01',  # Different start date for mNAV chart
    }
    
    print("MSTR Configuration Example:")
    print(f"NAV Reference Levels: {mstr_chart_config['nav_reference_levels']}")
    print(f"Colors: {mstr_chart_config['nav_reference_colors']}")
    print(f"Projection: {mstr_chart_config['projection_months']} months")
    print(f"mNAV Start Date: {mstr_chart_config['mnav_start_date']}")
    
    # This would run the analysis if we had MSTR data:
    # df = load_mstr_data()
    # run_company_analysis(df, company_name="MSTR", chart_config=mstr_chart_config)


if __name__ == "__main__":
    main()
