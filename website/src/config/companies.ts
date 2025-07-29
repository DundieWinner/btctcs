export interface Curator {
  name: string;
  github: string;
  x?: string; // Optional X handle
}

// Google Sheets data types
export interface GoogleSheetData {
  rows: { [key: string]: string | number }[];
}

export interface GoogleSheetExtraction {
  id: string; // Unique identifier for this extraction
  title: string; // Display title for this data section
  description?: string; // Optional description shown below title
  spreadsheetId: string;
  ranges: string[]; // Array of ranges to fetch in a single batchGet call
  processor?: (
    rangeData: {
      range: string;
      majorDimension: string;
      values?: string[][];
    }[],
  ) => GoogleSheetData; // Optional data processing callback
  renderLocation?: "sidebar" | "top" | "bottom"; // Where to render this extraction, defaults to "top"
}

export interface GoogleSheetConfig {
  extractions: GoogleSheetExtraction[]; // Support multiple spreadsheet extractions
}

// Reusable processor for Ragnar's  data
// Pairs labels from first range with values from second range
export function ragnarProcessor(
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): GoogleSheetData {
  const labelsRange = rangeData[0]; // First range - labels
  const valuesRange = rangeData[1]; // Second range - values

  if (
    !labelsRange ||
    !valuesRange ||
    !labelsRange.values ||
    !valuesRange.values
  ) {
    return { rows: [] };
  }

  // Define allowed labels for filtering
  const allowedLabels = new Set([
    "Total Fiat Debt",
    "Cash",
    "BTC in Treasury",
    "BTC NAV",
    "Basic shares outstanding",
    "Assumed fully diluted shares",
    "Current price",
    "Market cap [local]",
    "Current market cap USD",
    "Debt (USD)",
    "Current mNAV (basic)",
    "Current mNAV (fully diluted)",
    "Forward BTC in Treasury",
    "Forward mNAV",
    "BTC Yield YTD %",
    "BTC Yield Discount",
    "Adj. BTC Yield YTD %",
    "Months",
    "BTC Yield Multiple",
    "BTC Yield Multiple 1Y",
    "Days to cover mNAV (91d)",
    "Forward Months to Cover mNAV (FMC)",
    "Forward P/BYD",
    "Days to cover mNAV",
    "Months to cover mNAV",
    "Risk adj. months to cover",
    "Torque adj. BTC Yield (Q2) %",
    "Incremental BTC Required",
    "Incremental Capital Required",
    "First purchase",
    "Days since first purchase",
    "Years since first purchase",
    "Number of purchases",
    "Days between purchases",
    "BTC bought per day",
    "Sats per share",
  ]);

  // Create paired data from the two ranges
  const pairedRows: { [key: string]: string | number }[] = [];
  const maxRows = Math.min(
    labelsRange.values.length,
    valuesRange.values.length,
  );

  for (let i = 0; i < maxRows; i++) {
    const labelRow = labelsRange.values[i];
    const valueRow = valuesRange.values[i];

    // Get the first column from each range
    const label = labelRow && labelRow[0] ? String(labelRow[0]).trim() : "";
    const value = valueRow && valueRow[0] ? String(valueRow[0]).trim() : "";

    // Only include rows where both label and value are non-empty AND label is in allowed list
    if (label && value && allowedLabels.has(label)) {
      pairedRows.push({
        Metric: label,
        Value: value,
      });
    }
  }

  return {
    rows: pairedRows,
  };
}

export interface Company {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  description?: string;
  curators: Curator[];
  googleSheet?: GoogleSheetConfig; // Optional Google Sheets integration
}

export const companies: Company[] = [
  {
    id: "h100",
    name: "H100",
    displayName: "H100 Company Dashboard",
    emoji: "🇸🇪",
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
          id: "ragnar",
          title: "Ragnar Stats",
          description:
            "Data extracted from <a href='https://x.com/RoaringRagnar' target='_blank' rel='noopener noreferrer'>@RoaringRagnar</a>'s open-source <a href='https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592' target='_blank' rel='noopener noreferrer'>Google Sheet</a>.",
          spreadsheetId: "1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE",
          ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!F2:F70"],
          processor: ragnarProcessor,
          renderLocation: "sidebar",
        },
      ],
    },
  },
  {
    id: "lqwd",
    name: "LQWD",
    displayName: "LQWD Company Dashboard",
    emoji: "🇨🇦",
    curators: [
      {
        name: "DunderHodl",
        github: "DundieWinner",
        x: "DunderHodl",
      },
    ],
  },
  {
    id: "metaplanet",
    name: "Metaplanet",
    displayName: "Metaplanet Company Dashboard",
    emoji: "🇯🇵",
    curators: [
      {
        name: "DunderHodl",
        github: "DundieWinner",
        x: "DunderHodl",
      },
    ],
  },
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find((company) => company.id === id);
};

export const getCompanyByName = (name: string): Company | undefined => {
  return companies.find(
    (company) => company.name.toLowerCase() === name.toLowerCase(),
  );
};
