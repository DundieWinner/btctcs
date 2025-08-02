import { Company, KeyStatistic, ProcessorResult } from "@/config/types";
import { createBitcoinAcquisitionsChart } from "@/config/charts/bitcoin-acquisitions";
import { createHistoricalPerformanceChart } from "@/config/charts/historical-performance";
import {
  createColumnFilterProcessor,
  createTreasuryActionsProcessor,
} from "@/config/processors";
import { GOOGLE_SHEET_IDS } from "@/config/sheets";
import { DESCRIPTIONS } from "@/config/extractions/descriptions";
import { DISCLOSURES } from "./disclosures";

// Google Sheet Column Header Names
const COLUMN_HEADERS = {
  // Common columns
  DATE: "Date",
  DESCRIPTION: "Description",

  // Bitcoin and Price columns
  BTC_PRICE_USD: "BTC Price (USD)",
  BTC_PURCHASE: "BTC Purchase",
  BTC_HELD: "BTC Held",
  CHANGE_IN_BTC: "Change in BTC",

  // Share and Equity columns
  CLOSING_PRICE_USD: "Closing Price (USD)",
  FD_SHARE_COUNT: "FD Share Count",
  SATS_PER_FD_SHARE: "Sats / FD Share",
  SATS_EQ_PER_FD_SHARE: "Sats Eq. / FD Share",
  FWD_SATS_EQ_PER_FD_SHARE: "Fwd Sats Eq. / FD Share",

  // Financial columns
  EST_CAD_BALANCE: "Est. CAD Balance",
  DEBT_CAD: "Debt (CAD)",
  FWD_EQ_MNAV: "Fwd Eq. mNAV",
} as const;

const blgvHistoricalProcessor = createColumnFilterProcessor({
  requiredColumns: [
    COLUMN_HEADERS.DATE,
    COLUMN_HEADERS.FWD_SATS_EQ_PER_FD_SHARE,
    COLUMN_HEADERS.SATS_PER_FD_SHARE,
    COLUMN_HEADERS.CLOSING_PRICE_USD,
    COLUMN_HEADERS.FWD_EQ_MNAV,
  ],
  dateColumn: COLUMN_HEADERS.DATE,
  startDate: "2025-07-17",
});

const blgvBitcoinPriceProcessor = createColumnFilterProcessor({
  requiredColumns: [
    COLUMN_HEADERS.DATE,
    COLUMN_HEADERS.BTC_PRICE_USD,
    COLUMN_HEADERS.BTC_PURCHASE,
  ],
  dateColumn: COLUMN_HEADERS.DATE,
  // No startDate specified - includes all rows
});

const blgvTreasuryActionsProcessor = createTreasuryActionsProcessor({
  columnMapping: {
    [COLUMN_HEADERS.DATE]: 0, // Column A
    [COLUMN_HEADERS.DESCRIPTION]: 1, // Column B
    [COLUMN_HEADERS.CHANGE_IN_BTC]: 2, // Column C
    [COLUMN_HEADERS.BTC_HELD]: 3, // Column D
    [COLUMN_HEADERS.EST_CAD_BALANCE]: 5, // Column F
    [COLUMN_HEADERS.DEBT_CAD]: 7, // Column H
    [COLUMN_HEADERS.FD_SHARE_COUNT]: 13, // Column N
    [COLUMN_HEADERS.SATS_PER_FD_SHARE]: 15, // Column P
    [COLUMN_HEADERS.SATS_EQ_PER_FD_SHARE]: 17, // Column R
    [COLUMN_HEADERS.FWD_SATS_EQ_PER_FD_SHARE]: 19, // Column T
  },
  dateColumn: COLUMN_HEADERS.DATE,
  descriptionColumn: COLUMN_HEADERS.DESCRIPTION,
});

const TABLE_COLUMNS = {
  METRIC: "Metric",
  VALUE: "Value",
} as const;

/**
 * Processor for BLGV stats from BTCTCS community sheet
 * Handles data where column D contains metric names and column E contains values
 */
function blgvStatsProcessor(
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): ProcessorResult {
  const statsRange = rangeData[0]; // Single range with D and E columns

  if (!statsRange || !statsRange.values) {
    return { data: { rows: [] } };
  }

  // Process the data where column D (index 0) is metric names and column E (index 1) is values
  const pairedRows: { [key: string]: string | number }[] = [];

  for (let i = 0; i < statsRange.values.length; i++) {
    const row = statsRange.values[i];

    // Column D (index 0) = metric name, Column E (index 1) = value
    const metric = row && row[0] ? String(row[0]).trim() : "";
    const value = row && row[1] ? String(row[1]).trim() : "";

    // Only include rows where both metric and value are non-empty
    if (metric && value) {
      pairedRows.push({
        [TABLE_COLUMNS.METRIC]: metric,
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
  ): KeyStatistic | null => {
    const row = pairedRows.find(
      (row) => row[TABLE_COLUMNS.METRIC] === metricName,
    );
    if (row) {
      let value = row[TABLE_COLUMNS.VALUE];
      // Clean up common prefixes from the value
      if (typeof value === "string") {
        value = value
          .replace(/^[$£€¥]/, "")
          .replace(/^CAD\s*/, "")
          .replace(/^USD\s*/, "");
      }

      const displayValue = prefix ? `${prefix}${value}` : value;
      const finalValue = unit ? `${displayValue} ${unit}` : displayValue;

      return {
        id,
        label,
        value: finalValue,
        order,
      };
    }
    return null;
  };

  // Extract key statistics - you can customize these based on what metrics are available in your sheet
  const keyStatistics: KeyStatistic[] = [];

  // First statistic: BTC in Treasury
  const btcStat = extractKeyStatistic(
    "BTC in Treasury",
    "btc-treasury",
    "BTC in Treasury",
    1,
  );
  if (btcStat) keyStatistics.push(btcStat);

  // Combine basic, diluted, and forward mNAV into one card
  const basicMnavRow = pairedRows.find(
    (row) => row[TABLE_COLUMNS.METRIC] === "mNAV (Basic)",
  );
  const dilutedMnavRow = pairedRows.find(
    (row) => row[TABLE_COLUMNS.METRIC] === "mNAV (Fully Diluted)",
  );
  const forwardMnavRow = pairedRows.find(
    (row) => row[TABLE_COLUMNS.METRIC] === "Forward mNAV",
  );

  if (basicMnavRow && dilutedMnavRow && forwardMnavRow) {
    let basicValue = basicMnavRow[TABLE_COLUMNS.VALUE];
    let dilutedValue = dilutedMnavRow[TABLE_COLUMNS.VALUE];
    let forwardValue = forwardMnavRow[TABLE_COLUMNS.VALUE];

    // Clean up prefixes
    if (typeof basicValue === "string") {
      basicValue = basicValue
        .replace(/^[$£€¥]\s*/, "")
        .replace(/^CAD\s*/, "")
        .replace(/^USD\s*/, "");
    }
    if (typeof dilutedValue === "string") {
      dilutedValue = dilutedValue
        .replace(/^[$£€¥]\s*/, "")
        .replace(/^CAD\s*/, "")
        .replace(/^USD\s*/, "");
    }
    if (typeof forwardValue === "string") {
      forwardValue = forwardValue
        .replace(/^[$£€¥]\s*/, "")
        .replace(/^CAD\s*/, "")
        .replace(/^USD\s*/, "");
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

  // Additional key statistics
  const additionalStats = [
    extractKeyStatistic(
      "Fwd Months to Cover mNAV",
      "fwd-mtc-mnav",
      "Fwd MTC mNAV",
      3,
    ),
    extractKeyStatistic("Forward P/BYD", "fwd-p-byd", "Fwd P/BYD", 4),
    extractKeyStatistic(
      "BTC Yield 30D",
      "btc-yield-30d",
      "BTC Yield YTD (30D)",
      5,
    ),
    extractKeyStatistic(
      "Current Price (USD)",
      "current-price-usd",
      "Current Price (USD)",
      6,
      undefined,
      "$",
    ),
    extractKeyStatistic(
      "Market Cap (USD)",
      "market-cap-usd",
      "Market Cap (USD)",
      7,
      undefined,
      "$",
    ),
  ].filter((stat): stat is KeyStatistic => stat !== null);

  keyStatistics.push(...additionalStats);

  return {
    data: {
      rows: pairedRows,
    },
    keyStatistics,
  };
}

export const blgvCompanyConfig: Company = {
  id: "blgv",
  name: "Belgravia Hartford",
  disclosure: DISCLOSURES.ragnarAndBtctcs(),
  emoji: "🇨🇦",
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
        id: "blgv-stats",
        title: "BLGV Key Stats",
        description: DESCRIPTIONS.btctcsData(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'Stats'!D2:E25"],
        processor: blgvStatsProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history",
        title: "Treasury Actions",
        description: DESCRIPTIONS.treasuryActions(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'BLGV Treasury Actions'!A1:AA1000"],
        processor: blgvTreasuryActionsProcessor,
        renderLocation: "bottom",
        hasHeaders: true,

        // Column formatting
        columnFormats: [
          {
            key: COLUMN_HEADERS.CHANGE_IN_BTC,
            type: "number",
            decimals: 8,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.BTC_HELD,
            type: "number",
            decimals: 8,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.EST_CAD_BALANCE,
            type: "currency",
            decimals: 0,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.DEBT_CAD,
            type: "currency",
            decimals: 2,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.FD_SHARE_COUNT,
            type: "number",
            decimals: 0,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.SATS_PER_FD_SHARE,
            type: "number",
            decimals: 1,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.SATS_EQ_PER_FD_SHARE,
            type: "number",
            decimals: 1,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.FWD_SATS_EQ_PER_FD_SHARE,
            type: "number",
            decimals: 1,
            thousandsSeparator: true,
            textAlign: "right",
          },
        ],

        // Conditional styling for positive/negative changes
        conditionalStyles: [
          {
            key: COLUMN_HEADERS.CHANGE_IN_BTC,
            condition: "positive",
            style: {
              backgroundColor: "rgba(34, 197, 94, 0.2)", // green-500 with opacity
              textColor: "rgb(34, 197, 94)", // green-500
              fontWeight: "bold",
            },
          },
          {
            key: COLUMN_HEADERS.CHANGE_IN_BTC,
            condition: "negative",
            style: {
              backgroundColor: "rgba(239, 68, 68, 0.2)", // red-500 with opacity
              textColor: "rgb(239, 68, 68)", // red-500
              fontWeight: "bold",
            },
          },
        ],

        // Column widths for better layout
        columnWidths: {
          [COLUMN_HEADERS.DATE]: "120px",
          [COLUMN_HEADERS.DESCRIPTION]: "250px",
          [COLUMN_HEADERS.CHANGE_IN_BTC]: "140px",
          [COLUMN_HEADERS.BTC_HELD]: "140px",
          [COLUMN_HEADERS.EST_CAD_BALANCE]: "150px",
          [COLUMN_HEADERS.DEBT_CAD]: "130px",
          [COLUMN_HEADERS.FD_SHARE_COUNT]: "150px",
          [COLUMN_HEADERS.SATS_PER_FD_SHARE]: "130px",
          [COLUMN_HEADERS.SATS_EQ_PER_FD_SHARE]: "130px",
          [COLUMN_HEADERS.FWD_SATS_EQ_PER_FD_SHARE]: "130px",
        },
      },
      {
        id: "bitcoin-price-history",
        title: "Bitcoin Price History",
        description: DESCRIPTIONS.bitcoinPriceHistory(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'BLGV Historical'!A1:S1000"],
        processor: blgvBitcoinPriceProcessor,
        hasHeaders: true,
        renderLocation: "none",
        charts: [
          createBitcoinAcquisitionsChart({
            dateColumn: COLUMN_HEADERS.DATE,
            priceColumn: COLUMN_HEADERS.BTC_PRICE_USD,
            purchaseColumn: COLUMN_HEADERS.BTC_PURCHASE,
            title: "Bitcoin Acquisitions",
            height: {
              default: 400,
              md: 550,
              lg: 650,
            },
          }),
        ],
      },
      {
        id: "historical-performance",
        title: "Historical Performance",
        description: DESCRIPTIONS.historicalPerformance(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'BLGV Historical'!A1:S1000"],
        processor: blgvHistoricalProcessor,
        hasHeaders: true,
        renderLocation: "none",
        charts: [
          createHistoricalPerformanceChart({
            dateColumn: COLUMN_HEADERS.DATE,
            primarySatsColumn: COLUMN_HEADERS.FWD_SATS_EQ_PER_FD_SHARE,
            secondarySatsColumn: COLUMN_HEADERS.SATS_PER_FD_SHARE,
            sharePriceColumn: COLUMN_HEADERS.CLOSING_PRICE_USD,
            mnavColumn: COLUMN_HEADERS.FWD_EQ_MNAV,
            primarySatsLabel: "Fwd Sats Eq. / FD Share",
            secondarySatsLabel: "Sats / FD Share",
            mnavLabel: "Fwd Eq. mNAV",
            title: "Historical Performance",
            height: {
              default: 350,
              md: 500,
            },
          }),
        ],
      },
    ],
  },
};
