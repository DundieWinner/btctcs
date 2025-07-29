// Reusable processor for Ragnar's  data

import { GoogleSheetData } from "../types";

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
