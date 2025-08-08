# BTCTCs - Bitcoin Treasury Company Tracking

Open-source project for tracking and analyzing Bitcoin treasury holdings across leading companies. Real-time charts and data for corporate Bitcoin adoption and treasury management.

## Supported Companies

Currently tracking the following Bitcoin treasury companies:

| Company | Curator(s) | Country | Data Source(s) |
|---------|------------|---------|----------------|
| 🇬🇧 BLGV | [@DunderHodl](https://x.com/DunderHodl) | Canada | [Ragnar GSheet](https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE), [GSheet](https://docs.google.com/spreadsheets/d/1hyRTvjiXQbXU6UnPmZoRDF9Rs7vL8YYYfFsrqu6Jk8Q/edit?usp=sharing) |
| 🇬🇮 Coinsilium | [@DunderHodl](https://x.com/DunderHodl) | Gibraltar | [GSheet](https://docs.google.com/spreadsheets/d/1hyRTvjiXQbXU6UnPmZoRDF9Rs7vL8YYYfFsrqu6Jk8Q/edit?usp=sharing) |
| 🇸🇪 H100 | [@DunderHodl](https://x.com/DunderHodl) | Sweden | https://treasury.h100.group, [Ragnar GSheet](https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE) |
| 🇦🇺 Locate Technologies | [@Eh_0z](https://x.com/Eh_0z) | Australia | [GSheet](https://docs.google.com/spreadsheets/d/1hyRTvjiXQbXU6UnPmZoRDF9Rs7vL8YYYfFsrqu6Jk8Q/edit?usp=sharing) |
| 🇯🇵 Metaplanet | [@DunderHodl](https://x.com/DunderHodl) | Japan | https://metaplanet.strategytracker.com, [Ragnar GSheet](https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE) |
| 🇫🇷 SQNS | [@american_roci](https://x.com/american_roci) | France | [GSheet](https://docs.google.com/spreadsheets/d/1hyRTvjiXQbXU6UnPmZoRDF9Rs7vL8YYYfFsrqu6Jk8Q/edit?usp=sharing) |

*Want to help curate data for these or other companies? See [Contributing](http://btctcs.com/contributing).

## How It Works

BTCTCs operates as a dual-component system that automatically generates and displays Bitcoin treasury analytics:

### Architecture Overview

```
📊 Data Sources → 🐍 Python Analysis → ☁️ S3 Storage → 🌐 Next.js Dashboard
```

**1. Data Collection & Analysis (Python)**
- Each company has a dedicated directory in `/companies/` (e.g., `companies/h100/`, `companies/blgv/`)
- Company-specific Python scripts (`analysis.py`, `analysis_with_upload.py`) run on a regular cadence
- Scripts pull data from multiple sources: Google Sheets, APIs, local JSON files, or any data source
- Shared utilities in `/shared_utils/` provide common analysis functions (power law regression, chart generation, S3 upload)
- Generated charts are automatically uploaded to S3/DigitalOcean Spaces for web display

**2. Web Dashboard (Next.js)**
- Located in `/website/` directory with TypeScript and Tailwind CSS
- Dynamic company pages at `/c/[company]` route (e.g., `/c/h100`, `/c/blgv`)
- Fetches and displays charts from each company's S3 bucket
- Integrates live Google Sheets data with advanced formatting and chart capabilities
- Interactive Chart.js charts generated directly from Google Sheets data with full JSON configuration
- Responsive design with interactive features (chart navigation, data tables, key statistics)

**3. Data Source Flexibility**
- **Google Sheets**: Live data extraction with custom processors and formatting
- **APIs**: Real-time data feeds from company endpoints
- **Local Files**: Fallback JSON data for offline analysis
- **Mixed Sources**: Companies can combine multiple data sources as needed

### Project Structure

```
btctcs/
├── companies/                    # Company-specific analysis scripts
│   ├── h100/
│   │   ├── analysis.py          # Generate charts locally
│   │   ├── analysis_with_upload.py  # Generate + upload to S3
│   │   ├── config.py            # Company configuration & data processing
│   │   └── fallback_data.json   # Backup data source
│   ├── blgv/
│   ├── lqwd/
│   └── metaplanet/
├── shared_utils/                 # Common analysis utilities
│   ├── bitcoin_analysis.py      # Chart generation & statistical analysis
│   ├── s3_uploader.py          # S3/DigitalOcean Spaces integration
│   ├── google_sheets.py        # Google Sheets API integration
│   └── upload_handler.py       # Unified upload management
├── website/                     # Next.js web dashboard
│   ├── src/
│   │   ├── app/c/[company]/     # Dynamic company pages
│   │   ├── components/          # Reusable UI components
│   │   ├── config/              # Company configurations & types
│   │   └── services/            # API integrations
│   └── ...
└── requirements.txt             # Python dependencies
```

### Automation Workflow

1. **Scheduled Execution**: Python scripts run automatically (via cron, GitHub Actions, etc.)
2. **Data Processing**: Scripts fetch latest data and generate updated charts
3. **Cloud Upload**: Charts are uploaded to S3 with company-specific prefixes
4. **Web Display**: Next.js dashboard automatically displays the latest charts
5. **Live Integration**: Google Sheets data is fetched in real-time by the web dashboard

### Volunteer-Friendly Contribution Model

**🚀 Adding a new company is as simple as updating a single `config.py` file!**

The project has been scaffolded to make volunteer contributions incredibly easy:

- **Minimal Setup**: Each company needs a `config.py` file (data loading and chart configuration) and `analysis_with_upload.py` file (automation entry point)
- **Web Dashboard Integration**: Add company configuration to `website/src/config/companies.ts` for dashboard display
- **Instant Global Sharing**: Once configured, charts are automatically generated and shared worldwide via the web dashboard
- **No Infrastructure Knowledge Required**: Volunteers only need to understand the company's data - the framework can handle most everything else
- **Template-Based**: Copy an existing company's directory and modify for your target company
- **Flexible Data Sources**: Use whatever data source works best (Google Sheets, APIs, CSV files, etc.)
- **Automated CI/CD**: GitHub Actions automatically discovers and runs any company with an `analysis_with_upload.py` file

**Example**: To add GameStop's Bitcoin holdings, a volunteer would:
1. Copy `/companies/h100/` to `/companies/gamestop/`
2. Update `config.py` with GameStop's data source (e.g., point to a public Google Sheet with GameStop's treasury data)
3. Customize chart settings (colors, date ranges, etc.) / create custom charts
4. Add GameStop configuration to `website/src/config/companies.ts` (company name, emoji, curator info, etc.)
5. The `analysis_with_upload.py` file works automatically (no changes needed)
6. GameStop's analytics are now live at `btctcs.com/c/gamestop` and update automatically 🎉

### Key Features

- **Multi-Source Data**: Supports Google Sheets, APIs, JSON files, and custom data sources
- **Automated Charts**: Power law analysis, NAV multiples, time series, and custom visualizations
- **Real-Time Dashboard**: Live data integration with interactive charts and tables
- **Scalable Architecture**: Easy to add new companies with minimal configuration
- **Volunteer-Driven Growth**: Community can scale the project by adopting individual companies
- **Flexible Deployment**: Python scripts can run anywhere, web dashboard deploys to Vercel

## Development Setup

### Python Analysis Code

The Python analysis tools generate charts and metrics for Bitcoin treasury companies.

#### Prerequisites
- Python 3.8+
- pip

#### Setup & Run
```bash
# Clone the repository
git clone https://github.com/DundieWinner/btctcs.git
cd btctcs

# Install Python dependencies
pip install -r requirements.txt

# Run analysis for a specific company (from root directory)
python3 companies/h100/analysis.py

# Or run with data upload to S3 (requires AWS credentials)
python3 companies/h100/analysis_with_upload.py
```

#### Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv data_analysis_env
source data_analysis_env/bin/activate  # On Windows: data_analysis_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run analysis (from root directory)
python3 companies/h100/analysis.py
```

#### Environment Variables (Optional)
```bash
# For live API data instead of local JSON
export DATA_URL="https://treasury.h100.group/companyData?ticker=H100"

# For S3 chart uploads
export S3_BUCKET_NAME="your-bucket-name"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

### Next.js Website

The website displays the charts and provides company dashboards.

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Setup & Run
```bash
# Navigate to website directory
cd website

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
# or
yarn dev

# Open http://localhost:3000 in your browser
```

#### Build for Production
```bash
cd website

# Build the application
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start
```

#### Environment Variables
Create a `.env.local` file in the `website` directory:

```bash
# Google Sheets API (for data fetching)
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key

# AWS S3 (for chart images)
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET=your_s3_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=us-east-1

# Base URL for the site
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contact

- **Creator**: [@DunderHodl](https://x.com/DunderHodl)
- **Website**: [btctcs.com](https://btctcs.com)
- **GitHub**: [github.com/DundieWinner/btctcs](https://github.com/DundieWinner/btctcs)
