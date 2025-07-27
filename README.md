# Bitcoin Company Analysis

Analyze Bitcoin holding companies and their shareholder value relationships.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run H100 analysis
cd h100
python3 analysis.py
```

## Optional: Virtual Environment

For isolation, you can optionally use a virtual environment:

```bash
python3 -m venv data_analysis_env
source data_analysis_env/bin/activate
pip install -r requirements.txt
```

## What it does

- Analyzes H100's Bitcoin holdings vs BTC per diluted share relationship
- Generates log-log charts with power law regression analysis
- Calculates correlation coefficients and statistical measures
- Exports charts with @DunderHodl signature
- Shows diminishing returns relationship (exponent ~0.82)