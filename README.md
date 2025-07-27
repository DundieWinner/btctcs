# Bitcoin Company Analysis Platform

A comprehensive multi-company analysis platform for Bitcoin holding companies. This project provides standardized tools for analyzing Bitcoin accumulation patterns, shareholder value relationships, and financial metrics across different companies.

## Project Structure

```
btctcs/
├── shared/                    # Shared utilities and common functions
│   └── analysis_utils.py     # Common analysis functions
├── h100/                     # H100 company analysis
│   ├── data.json            # H100 raw data
│   ├── analysis.py          # H100 analysis script
│   ├── notebook.py          # H100 notebook-style script
│   ├── Bitcoin_Analysis.ipynb  # H100 Jupyter notebook
│   ├── log_log_chart.png    # Generated log-log chart
│   ├── time_series.png      # Generated time series chart
│   └── processed_data.csv   # Processed analysis data
├── requirements.txt          # Python dependencies
├── README.md                # This file
└── data_analysis_env/       # Virtual environment
```

## Features

- **Multi-Company Support**: Organized structure for analyzing multiple Bitcoin companies
- **Standardized Analysis**: Common utilities for consistent analysis across companies
- **Log-Log Visualization**: Specialized charts for Bitcoin holdings vs diluted share value
- **Time Series Analysis**: Track Bitcoin accumulation and share value over time
- **Correlation Analysis**: Quantify relationships between Bitcoin holdings and shareholder value
- **Automated Reporting**: Generate comprehensive analysis reports
- **Export Capabilities**: Save charts and processed data

## Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment (if not already created)
python3 -m venv data_analysis_env

# Activate virtual environment
source data_analysis_env/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Run Company Analysis

#### H100 Analysis
```bash
# Navigate to H100 directory
cd h100/

# Run analysis script
python analysis.py

# Or run notebook-style script
python notebook.py
```

#### Jupyter Notebook Analysis
```bash
# Start Jupyter server
jupyter notebook

# Open analysis.ipynb for interactive analysis
```

## Analysis Components

### 1. Log-Log Charts
- **X-axis**: Log₁₀(Bitcoin Holdings)
- **Y-axis**: Log₁₀(BTC per Diluted Share)
- **Purpose**: Identify power-law relationships between Bitcoin accumulation and shareholder value

### 2. Time Series Analysis
- Bitcoin holdings over time
- BTC per diluted share evolution
- Growth rate calculations

### 3. Statistical Analysis
- Correlation coefficients
- Growth percentages
- Data quality metrics

## Adding New Companies

To add analysis for a new company:

1. **Create company directory**:
   ```bash
   mkdir company_name/
   ```

2. **Add company data**:
   - Place JSON data file in the company directory
   - Ensure data follows the standard format with `historicalData` structure

3. **Create analysis script**:
   ```python
   # company_name/analysis.py
   import sys
   import os
   sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))
   
   from analysis_utils import (
       load_company_data, 
       create_log_log_chart, 
       create_time_series_charts,
       generate_analysis_report,
       print_analysis_summary
   )
   
   def main():
       df = load_company_data('data.json')
       correlation = create_log_log_chart(df, company_name="CompanyName")
       create_time_series_charts(df, company_name="CompanyName")
       report = generate_analysis_report(df, correlation, company_name="CompanyName")
       print_analysis_summary(report)
   
   if __name__ == "__main__":
       main()
   ```

## Data Format Requirements

Company data files should follow this JSON structure:

```json
{
  "currencyMetadata": { ... },
  "historicalData": {
    "dates": ["2025-05-22", "2025-05-23", ...],
    "btc_balance": [4.39, 4.39, ...],
    "btc_per_share": [0.00000003749285, ...],
    "btc_per_diluted_share": [0.00000003749285, ...],
    "diluted_shares_outstanding": [117000000, ...]
  }
}
```

## Current Companies

### H100
- **Data Points**: 66 records (May-July 2025)
- **Bitcoin Holdings**: 4.39 - 628.22 BTC
- **Correlation**: 0.996 (Extremely Strong)
- **Key Finding**: Nearly perfect power-law relationship between Bitcoin accumulation and diluted shareholder value

## Next Steps

- Add more Bitcoin companies (MicroStrategy, Tesla, etc.)
- Implement comparative analysis across companies
- Add predictive modeling capabilities
- Create automated reporting dashboard
- Add real-time data integration
