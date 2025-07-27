#!/usr/bin/env python3
"""
Shared utilities for Bitcoin company analysis
Common functions for data loading, visualization, and statistical analysis
"""

import json
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from typing import Dict, Tuple, Any

def load_company_data(filepath: str) -> pd.DataFrame:
    """
    Load and parse company JSON data into a standardized DataFrame
    
    Args:
        filepath: Path to the company's JSON data file
        
    Returns:
        DataFrame with standardized columns for analysis
    """
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    # Extract historical data
    hist_data = data['historicalData']
    
    # Create DataFrame with relevant metrics
    df = pd.DataFrame({
        'date': hist_data['dates'],
        'btc_balance': hist_data['btc_balance'],
        'btc_per_share': hist_data['btc_per_share'],
        'btc_per_diluted_share': hist_data['btc_per_diluted_share'],
        'diluted_shares_outstanding': hist_data['diluted_shares_outstanding']
    })
    
    return df

def create_log_log_chart(df: pd.DataFrame, company_name: str = "Company", 
                        save_path: str = None) -> float:
    """
    Create log-log chart of Bitcoin holdings vs BTC per diluted share
    
    Args:
        df: DataFrame with company data
        company_name: Name of the company for chart titles
        save_path: Optional path to save the chart
        
    Returns:
        Correlation coefficient between log values
    """
    # Filter out zero or negative values for log transformation
    valid_data = df[(df['btc_balance'] > 0) & (df['btc_per_diluted_share'] > 0)]
    
    # Calculate log10 values
    log_btc_balance = np.log10(valid_data['btc_balance'])
    log_btc_per_diluted_share = np.log10(valid_data['btc_per_diluted_share'])
    
    # Create the plot
    plt.figure(figsize=(12, 8))
    plt.scatter(log_btc_balance, log_btc_per_diluted_share, alpha=0.7, s=60, 
               c='blue', edgecolors='black', linewidth=0.5)
    
    # Add labels and title
    plt.xlabel('Log₁₀(Bitcoin Holdings)', fontsize=14, fontweight='bold')
    plt.ylabel('Log₁₀(BTC per Diluted Share)', fontsize=14, fontweight='bold')
    plt.title(f'{company_name}: Bitcoin Holdings vs BTC per Diluted Share (Log-Log Scale)', 
             fontsize=16, fontweight='bold', pad=20)
    
    # Calculate and display correlation
    correlation = np.corrcoef(log_btc_balance, log_btc_per_diluted_share)[0, 1]
    plt.text(0.05, 0.95, f'Correlation: {correlation:.3f}\nData Points: {len(valid_data)}', 
             transform=plt.gca().transAxes, fontsize=12, 
             bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    # Add grid for better readability
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    plt.show()
    
    return correlation

def create_time_series_charts(df: pd.DataFrame, company_name: str = "Company",
                             save_path: str = None) -> None:
    """
    Create time series charts for Bitcoin holdings and BTC per diluted share
    
    Args:
        df: DataFrame with company data
        company_name: Name of the company for chart titles
        save_path: Optional path to save the chart
    """
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    # Convert dates to datetime for better plotting
    df['date_dt'] = pd.to_datetime(df['date'])
    
    # Plot Bitcoin balance over time
    ax1.plot(df['date_dt'], df['btc_balance'], 'b-', linewidth=2, marker='o', markersize=4)
    ax1.set_ylabel('Bitcoin Balance (BTC)', fontsize=12, fontweight='bold')
    ax1.set_title(f'{company_name} Bitcoin Holdings Over Time', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.tick_params(axis='x', rotation=45)
    
    # Plot BTC per diluted share over time
    ax2.plot(df['date_dt'], df['btc_per_diluted_share'], 'r-', linewidth=2, marker='o', markersize=4)
    ax2.set_ylabel('BTC per Diluted Share', fontsize=12, fontweight='bold')
    ax2.set_xlabel('Date', fontsize=12, fontweight='bold')
    ax2.set_title(f'{company_name} BTC per Diluted Share Over Time', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    plt.show()

def generate_analysis_report(df: pd.DataFrame, correlation: float, 
                           company_name: str = "Company") -> Dict[str, Any]:
    """
    Generate comprehensive analysis report for a company
    
    Args:
        df: DataFrame with company data
        correlation: Correlation coefficient from log-log analysis
        company_name: Name of the company
        
    Returns:
        Dictionary containing analysis results
    """
    # Basic statistics
    btc_growth = ((df['btc_balance'].max() - df['btc_balance'].min()) / df['btc_balance'].min()) * 100
    diluted_share_growth = ((df['btc_per_diluted_share'].max() - df['btc_per_diluted_share'].min()) / df['btc_per_diluted_share'].min()) * 100
    
    report = {
        'company_name': company_name,
        'data_points': len(df),
        'date_range': {
            'start': df['date'].min(),
            'end': df['date'].max()
        },
        'btc_holdings': {
            'min': df['btc_balance'].min(),
            'max': df['btc_balance'].max(),
            'growth_percent': btc_growth
        },
        'btc_per_diluted_share': {
            'min': df['btc_per_diluted_share'].min(),
            'max': df['btc_per_diluted_share'].max(),
            'growth_percent': diluted_share_growth
        },
        'correlation': correlation,
        'correlation_strength': get_correlation_strength(correlation)
    }
    
    return report

def get_correlation_strength(correlation: float) -> str:
    """Return descriptive strength of correlation"""
    abs_corr = abs(correlation)
    if abs_corr >= 0.95:
        return "Extremely Strong"
    elif abs_corr >= 0.8:
        return "Very Strong"
    elif abs_corr >= 0.6:
        return "Strong"
    elif abs_corr >= 0.4:
        return "Moderate"
    elif abs_corr >= 0.2:
        return "Weak"
    else:
        return "Very Weak"

def print_analysis_summary(report: Dict[str, Any]) -> None:
    """Print formatted analysis summary"""
    print(f"\n{report['company_name'].upper()} BITCOIN ANALYSIS SUMMARY")
    print("=" * 60)
    print(f"Data Points: {report['data_points']}")
    print(f"Date Range: {report['date_range']['start']} to {report['date_range']['end']}")
    print(f"Bitcoin Holdings: {report['btc_holdings']['min']:.2f} - {report['btc_holdings']['max']:.2f} BTC")
    print(f"BTC per Diluted Share: {report['btc_per_diluted_share']['min']:.8f} - {report['btc_per_diluted_share']['max']:.8f}")
    print(f"Correlation: {report['correlation']:.3f} ({report['correlation_strength']})")
    print(f"Bitcoin Holdings Growth: {report['btc_holdings']['growth_percent']:.1f}%")
    print(f"BTC per Diluted Share Growth: {report['btc_per_diluted_share']['growth_percent']:.1f}%")
    print("=" * 60)
