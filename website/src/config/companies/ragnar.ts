// Reusable processor for Ragnar's  data

import { KeyStatistic, ProcessorResult } from "../types";

// Ragnar Metric Names
const RAGNAR_METRICS = {
  // Financial metrics
  TOTAL_FIAT_DEBT: "Total Fiat Debt",
  CASH: "Cash",
  BTC_IN_TREASURY: "BTC in Treasury",
  BTC_NAV: "BTC NAV",
  DEBT_USD: "Debt (USD)",
  
  // Share metrics
  BASIC_SHARES_OUTSTANDING: "Basic shares outstanding",
  ASSUMED_FULLY_DILUTED_SHARES: "Assumed fully diluted shares",
  CURRENT_PRICE: "Current price",
  MARKET_CAP_LOCAL: "Market cap [local]",
  CURRENT_MARKET_CAP_USD: "Current market cap USD",
  
  // mNAV metrics
  CURRENT_MNAV_BASIC: "Current mNAV (basic)",
  CURRENT_MNAV_FULLY_DILUTED: "Current mNAV (fully diluted)",
  FORWARD_BTC_IN_TREASURY: "Forward BTC in Treasury",
  FORWARD_MNAV: "Forward mNAV",
  
  // Yield metrics
  BTC_YIELD_YTD_PERCENT: "BTC Yield YTD %",
  BTC_YIELD_DISCOUNT: "BTC Yield Discount",
  ADJ_BTC_YIELD_YTD_PERCENT: "Adj. BTC Yield YTD %",
  BTC_YIELD_MULTIPLE: "BTC Yield Multiple",
  BTC_YIELD_MULTIPLE_1Y: "BTC Yield Multiple 1Y",
  TORQUE_ADJ_BTC_YIELD_Q2_PERCENT: "Torque adj. BTC Yield (Q2) %",
  
  // Time-based metrics
  MONTHS: "Months",
  DAYS_TO_COVER_MNAV_91D: "Days to cover mNAV (91d)",
  FORWARD_MONTHS_TO_COVER_MNAV_FMC: "Forward Months to Cover mNAV (FMC)",
  FORWARD_P_BYD: "Forward P/BYD",
  DAYS_TO_COVER_MNAV: "Days to cover mNAV",
  MONTHS_TO_COVER_MNAV: "Months to cover mNAV",
  RISK_ADJ_MONTHS_TO_COVER: "Risk adj. months to cover",
  
  // Capital metrics
  INCREMENTAL_BTC_REQUIRED: "Incremental BTC Required",
  INCREMENTAL_CAPITAL_REQUIRED: "Incremental Capital Required",
  
  // Purchase history metrics
  FIRST_PURCHASE: "First purchase",
  DAYS_SINCE_FIRST_PURCHASE: "Days since first purchase",
  YEARS_SINCE_FIRST_PURCHASE: "Years since first purchase",
  NUMBER_OF_PURCHASES: "Number of purchases",
  DAYS_BETWEEN_PURCHASES: "Days between purchases",
  BTC_BOUGHT_PER_DAY: "BTC bought per day",
  SATS_PER_SHARE: "Sats per share",
} as const;

// Table column names
const TABLE_COLUMNS = {
  METRIC: "Metric",
  VALUE: "Value",
} as const;

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

  // Define allowed labels for filtering - using Object.values() to handle runtime string comparison
  const allowedLabels = new Set<string>(Object.values(RAGNAR_METRICS));

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
        [TABLE_COLUMNS.METRIC]: label,
        [TABLE_COLUMNS.VALUE]: value,
      });
    }
  }

  // Helper function to extract and format key statistics
  const extractKeyStatistic = (
    metricName: string,
    id: string,
    label: string,
    order: number,
    unit?: string,
    prefix?: string,
  ) => {
    const row = pairedRows.find((row) => row[TABLE_COLUMNS.METRIC] === metricName);
    if (row) {
      let value = row[TABLE_COLUMNS.VALUE];
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
          accentColor: "rgb(249, 115, 22)", // Orange to match theme
        },
      });
    }
  };

  // Create key statistics array
  const keyStatistics: KeyStatistic[] = [];

  // Extract key statistics in order
  extractKeyStatistic(
    RAGNAR_METRICS.BTC_IN_TREASURY,
    "btc-treasury",
    "BTC Holdings",
    1,
    "BTC",
  );

  // Combine basic and diluted mNAV into one card
  const basicMnavRow = pairedRows.find(
    (row) => row[TABLE_COLUMNS.METRIC] === RAGNAR_METRICS.CURRENT_MNAV_BASIC,
  );
  const dilutedMnavRow = pairedRows.find(
    (row) => row[TABLE_COLUMNS.METRIC] === RAGNAR_METRICS.CURRENT_MNAV_FULLY_DILUTED,
  );
  const forwardMnavRow = pairedRows.find(
    (row) => row[TABLE_COLUMNS.METRIC] === RAGNAR_METRICS.FORWARD_MNAV,
  );

  if (basicMnavRow && dilutedMnavRow && forwardMnavRow) {
    let basicValue = basicMnavRow[TABLE_COLUMNS.VALUE];
    let dilutedValue = dilutedMnavRow[TABLE_COLUMNS.VALUE];
    let forwardValue = forwardMnavRow[TABLE_COLUMNS.VALUE];

    // Clean up prefixes
    if (typeof basicValue === "string") {
      basicValue = basicValue.replace(/^\$ /, "");
    }
    if (typeof dilutedValue === "string") {
      dilutedValue = dilutedValue.replace(/^\$ /, "");
    }
    if (typeof forwardValue === "string") {
      forwardValue = forwardValue.replace(/^\$ /, "");
    }

    keyStatistics.push({
      id: "mnav-combined",
      label: "mNAV (Basic / Fully Diluted / Fwd)",
      value: `${basicValue} / ${dilutedValue} / ${forwardValue}`,
      order: 2,
      style: {
        accentColor: "rgb(249, 115, 22)", // Orange to match theme
      },
    });
  }

  extractKeyStatistic(
    RAGNAR_METRICS.FORWARD_MONTHS_TO_COVER_MNAV_FMC,
    "fmc",
    "Forward MTC",
    4,
    "months",
  );
  extractKeyStatistic(RAGNAR_METRICS.FORWARD_P_BYD, "forward-pbyd", "Forward P/BYD", 5);
  extractKeyStatistic(
    RAGNAR_METRICS.RISK_ADJ_MONTHS_TO_COVER,
    "risk-adj-mtc",
    "Risk Adj. MTC",
    6,
    "months",
  );
  extractKeyStatistic(
    RAGNAR_METRICS.BTC_YIELD_YTD_PERCENT,
    "btc-yield-ytd",
    "BTC Yield YTD",
    7,
    "%",
  );

  return {
    data: {
      rows: pairedRows,
    },
    keyStatistics: keyStatistics.length > 0 ? keyStatistics : undefined,
  };
}
