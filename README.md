# Bitcoin Company Analysis

Analyze Bitcoin holding companies and their shareholder value relationships.

## Quick Start

```bash
# Setup
python3 -m venv data_analysis_env
source data_analysis_env/bin/activate
pip install -r requirements.txt

# Run H100 analysis
jupyter notebook h100/analysis.ipynb
```

## What it does

- Analyzes Bitcoin holdings vs shareholder value
- Generates log-log charts and time series plots
- Calculates correlation and power law relationships
- Exports data and visualizations

## Files

- `h100/analysis.py` - Main analysis script
- `h100/data.json` - H100 company data
- `requirements.txt` - Python dependencies

## Output

- PNG charts showing Bitcoin/share relationships
- CSV file with processed data
- Statistical analysis in console

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
