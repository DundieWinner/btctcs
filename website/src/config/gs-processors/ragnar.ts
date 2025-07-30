// Reusable processor for Ragnar's  data

import { GoogleSheetData, ProcessorResult, KeyStatistic } from "../types";

// Pairs labels from first range with values from second range
// Now returns both table data and key statistics
export function ragnarProcessor(
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): ProcessorResult {
  const labelsRange = rangeData[0]; // First range - labels
  const valuesRange = rangeData[1]; // Second range - values

  if (
    !labelsRange ||
    !valuesRange ||
    !labelsRange.values ||
    !valuesRange.values
  ) {
    return { data: { rows: [] } };
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

  // Helper function to extract and format key statistics
  const extractKeyStatistic = (metricName: string, id: string, label: string, order: number, unit?: string, prefix?: string) => {
    const row = pairedRows.find(row => row.Metric === metricName);
    if (row) {
      let value = row.Value;
      // Clean up common prefixes from the value
      if (typeof value === "string") {
        value = value.replace(/^₿ /, "").replace(/^\$ /, "").replace(/^% /, "");
      }
      
      keyStatistics.push({
        id,
        label,
        value,
        unit,
        prefix,
        order,
        style: {
          accentColor: "rgb(249, 115, 22)" // Orange to match theme
        }
      });
    }
  };
  
  // Create key statistics array
  const keyStatistics: KeyStatistic[] = [];
  
  // Extract key statistics in order
  extractKeyStatistic("BTC in Treasury", "btc-treasury", "BTC Holdings", 1, "BTC");
  
  // Combine basic and diluted mNAV into one card
  const basicMnavRow = pairedRows.find(row => row.Metric === "Current mNAV (basic)");
  const dilutedMnavRow = pairedRows.find(row => row.Metric === "Current mNAV (fully diluted)");
  
  if (basicMnavRow && dilutedMnavRow) {
    let basicValue = basicMnavRow.Value;
    let dilutedValue = dilutedMnavRow.Value;
    
    // Clean up prefixes
    if (typeof basicValue === "string") {
      basicValue = basicValue.replace(/^\$ /, "");
    }
    if (typeof dilutedValue === "string") {
      dilutedValue = dilutedValue.replace(/^\$ /, "");
    }
    
    keyStatistics.push({
      id: "mnav-combined",
      label: "Current mNAV (Basic / Fully Diluted)",
      value: `${basicValue} / ${dilutedValue}`,
      order: 2,
      style: {
        accentColor: "rgb(249, 115, 22)" // Orange to match theme
      }
    });
  }
  
  extractKeyStatistic("Forward mNAV", "forward-mnav", "Forward mNAV", 3, undefined, "$");
  extractKeyStatistic("Forward Months to Cover mNAV (FMC)", "fmc", "Forward MTC", 4, "M");
  extractKeyStatistic("Forward P/BYD", "forward-pbyd", "Forward P/BYD", 5);
  extractKeyStatistic("Risk adj. months to cover", "risk-adj-mtc", "Risk Adj. MTC", 6, "months");

  return {
    data: {
      rows: pairedRows,
    },
    keyStatistics: keyStatistics.length > 0 ? keyStatistics : undefined
  };
}
