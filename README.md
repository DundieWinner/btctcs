# BTCTCs - Bitcoin Treasury Company Tracking

Open-source project for tracking and analyzing Bitcoin treasury holdings across leading companies. Real-time charts and data for corporate Bitcoin adoption and treasury management.

## Supported Companies

Currently tracking the following Bitcoin treasury companies:

| Company | Curator(s) | Country |
|---------|------------|---------|
| 🇸🇪 H100 | @DunderHodl | Sweden |
| 🇨🇦 LQWD | @DunderHodl | Canada |
| 🇯🇵 Metaplanet | @DunderHodl | Japan |

*Want to help curate data for these or other companies? See [Contributing](#contributing) below.*

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

# Run analysis for a specific company
cd h100
python3 analysis.py

# Or run with data upload to S3 (requires AWS credentials)
python3 analysis_with_upload.py
```

#### Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv data_analysis_env
source data_analysis_env/bin/activate  # On Windows: data_analysis_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run analysis
cd h100
python3 analysis.py
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

## Project Structure

```
btctcs/
├── shared_utils/           # Shared Python utilities
│   ├── bitcoin_analysis.py # Main analysis pipeline
│   └── s3_uploader.py     # S3 upload utilities
├── h100/                  # H100 company data & analysis
├── companies/             # Other company directories
├── website/               # Next.js web application
│   ├── src/app/          # App router pages
│   ├── src/components/   # React components
│   └── src/config/       # Configuration files
└── .github/workflows/    # GitHub Actions for automation
```

## Contributing

This project relies on volunteers to keep company data up to date. **No technical knowledge required!**

### What's Needed
- **Data curators** - Keep source data up to date in Google Sheets
- **Developers** - Improve Python charts and Next.js web app

### How to Help
- **Contact**: DM [@DunderHodl](https://x.com/DunderHodl) on X
- **GitHub**: Open issues or submit PRs at [github.com/DundieWinner/btctcs](https://github.com/DundieWinner/btctcs)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contact

- **Creator**: [@DunderHodl](https://x.com/DunderHodl)
- **Website**: [btctcs.com](https://btctcs.com)
- **GitHub**: [github.com/DundieWinner/btctcs](https://github.com/DundieWinner/btctcs)