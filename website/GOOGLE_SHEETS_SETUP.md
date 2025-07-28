# Google Sheets Integration Setup

## Overview

I've added a robust Google Sheets integration to your company dashboard pages using the Google Sheets API v4 `values:batchGet` endpoint. This allows you to display data from multiple public Google Sheets with custom processing and efficient batch fetching.

## Setup Instructions

### 1. Get a Google Sheets API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Add the API key to your environment variables

### 2. Environment Variables

Add your Google Sheets API key to your environment variables:

```bash
# In your .env.local file
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### 3. Configure Companies

Add Google Sheets configuration directly to your company definitions in `/src/config/companies.ts`. The new system supports multiple extractions per company:

```typescript
export const companies: Company[] = [
  {
    id: "h100",
    name: "H100",
    displayName: "H100 Company Dashboard",
    emoji: "🏢",
    curators: [
      {
        name: "DunderHodl",
        github: "DundieWinner",
        x: "DunderHodl",
      },
    ],
    googleSheet: {
      extractions: [
        {
          id: "holdings",
          title: "Bitcoin Holdings",
          description: "Current Bitcoin treasury holdings and metrics",
          spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          ranges: ["Holdings!A:E"], // Array of ranges to fetch in one batchGet call
        },
        {
          id: "combined-data",
          title: "Combined Financial Data",
          description: "Holdings and transactions combined into one view",
          spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          ranges: ["Holdings!A:E", "Transactions!A:F"], // Multiple ranges in one call
          processor: (rangeData) => {
            // Combine data from multiple ranges
            const holdingsData = rangeData[0];
            const transactionsData = rangeData[1];
            
            if (!holdingsData || !transactionsData) {
              return { headers: [], rows: [] };
            }
            
            // Example: Combine headers and filter transactions
            return {
              headers: [...holdingsData.headers, ...transactionsData.headers],
              rows: transactionsData.rows.filter(row => row['Amount'] && row['Amount'] !== '')
            };
          }
        }
      ]
    },
  },
  // Add more companies...
];
```

### 4. Make Your Google Sheet Public

For the API to access your sheet without authentication:

1. Open your Google Sheet
2. Click "Share" in the top right
3. Change access to "Anyone with the link can view"
4. Copy the sheet ID from the URL

The sheet ID is the long string in the URL between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
```

## How It Works

### Efficient Batch Data Fetching

The system uses the Google Sheets API v4 `values:batchGet` endpoint with a one-to-one mapping:

1. **One Extraction = One BatchGet Call**: Each extraction maps directly to one batchGet API call
2. **Multiple Ranges Per Call**: Each extraction can specify multiple ranges to fetch together
3. **Flexible Data Combination**: Processor functions receive all range data to combine as needed
4. **Caching**: All requests are cached for 10 minutes to reduce API usage

### Data Processing Pipeline

1. **Batch Range Fetching**: All ranges for an extraction are fetched in one batchGet call
2. **Type Conversion**: String values are automatically converted to numbers when possible
3. **Multi-Range Processing**: Processor functions receive an array of range data to combine/transform
4. **Fallback Behavior**: If no processor is provided, the first range data is used by default
5. **Error Handling**: Failed extractions don't break the entire dashboard

### Benefits of BatchGet Approach

**Performance Improvements:**
- **Reduced API Calls**: Multiple ranges from the same spreadsheet are fetched in one request
- **Lower Latency**: Fewer round trips to Google's servers
- **Better Rate Limiting**: More efficient use of API quotas
- **Concurrent Processing**: Different spreadsheets are processed in parallel

**Scalability:**
- **Multiple Extractions**: Support for unlimited extractions per company
- **Cross-Spreadsheet**: Can pull data from different spreadsheets efficiently
- **Flexible Ranges**: Each extraction can specify its own range (sheets, columns, rows)

**Reliability:**
- **Graceful Degradation**: Failed extractions don't affect others
- **Individual Error Handling**: Each extraction has its own error boundary
- **Consistent Caching**: All data is cached uniformly for 10 minutes

### Display

Each extraction renders as a separate section:
- Custom title and description per extraction
- Responsive table with consistent styling
- Shows first 10 rows by default with row count indicator
- Numbers are formatted with locale-specific formatting
- Empty cells show as "-"
- Multiple extractions are spaced with proper visual separation

### Example Sheet Structure

Your Google Sheet should have headers in the first row:

| Date       | BTC Holdings | USD Value | Price    |
|------------|-------------|-----------|----------|
| 2024-01-01 | 1000        | 45000000  | 45000    |
| 2024-01-02 | 1050        | 47250000  | 45000    |

## Customization

### Styling

The table uses your existing color scheme:
- Orange headers (rgb(249, 115, 22))
- Dark card background (rgb(3, 7, 18, 0.9))
- White text (#ffffff)
- Gray borders and hover effects

### Data Processing

You can modify the `fetchGoogleSheetData` function to:
- Add custom data transformations
- Filter specific rows
- Format dates or currencies
- Add validation

### Display Options

Modify the display section to:
- Show more/fewer rows
- Add pagination
- Create charts from the data
- Add sorting functionality

## Testing

1. Set up a test Google Sheet with sample data
2. Make it publicly viewable
3. Add the sheet ID to your configuration
4. Visit `/c/your-company` to see the data

## Error Handling

The integration includes error handling for:
- Invalid API keys
- Private sheets
- Network errors
- Empty sheets
- Malformed data

Errors are logged to the console and the section simply won't appear if data can't be fetched.
