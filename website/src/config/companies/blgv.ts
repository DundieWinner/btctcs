import { Company } from "@/config/types";
import { createBitcoinAcquisitionsChart } from "@/config/charts/bitcoin-acquisitions";
import { createHistoricalPerformanceChart } from "@/config/charts/historical-performance";
import {
  type CompanyStatsConfig,
  createColumnFilterProcessor,
  createCompanyStatsProcessor,
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

const blgvStatsConfig: CompanyStatsConfig = {
  keyStatistics: [
    {
      metricName: "BTC in Treasury",
      id: "btc-treasury",
      label: "BTC in Treasury",
      order: 1,
    },
    {
      metricName: "Fwd Months to Cover mNAV",
      id: "fwd-mtc-mnav",
      label: "Fwd MTC mNAV",
      order: 3,
    },
    {
      metricName: "Forward P/BYD",
      id: "fwd-p-byd",
      label: "Fwd P/BYD",
      order: 4,
    },
    {
      metricName: "BTC Yield 30D",
      id: "btc-yield-30d",
      label: "BTC Yield YTD (30D)",
      order: 5,
    },
  ],
  combinedMetrics: [
    {
      id: "mnav-combined",
      label: "mNAV (Basic / Fully Diluted / Fwd)",
      order: 2,
      metrics: [
        { metricName: "mNAV (Basic)", required: true },
        { metricName: "mNAV (Fully Diluted)", required: true },
        { metricName: "Forward mNAV", required: true },
      ],
      separator: " / ",
      style: {
        accentColor: "rgb(249, 115, 22)",
      },
    },
    {
      id: "price-combined",
      label: "Stock Price (CAD / USD)",
      order: 6,
      metrics: [
        {
          metricName: "Local Price (CAD)",
          required: true,
          prefix: "$",
          format: "shorthand",
        },
        {
          metricName: "Current Price (USD)",
          required: true,
          prefix: "$",
          format: "shorthand",
        },
      ],
      separator: " / ",
      style: {
        accentColor: "rgb(249, 115, 22)",
      },
    },
    {
      id: "mc-combined",
      label: "Market Cap (CAD / USD)",
      order: 7,
      metrics: [
        {
          metricName: "Market Cap (CAD)",
          required: true,
          prefix: "$",
          format: "shorthand",
        },
        {
          metricName: "Market Cap (USD)",
          required: true,
          prefix: "$",
          format: "shorthand",
        },
      ],
      separator: " / ",
      style: {
        accentColor: "rgb(249, 115, 22)",
      },
    },
  ],
};

const blgvStatsProcessor = createCompanyStatsProcessor(blgvStatsConfig);

export const blgvCompanyConfig: Company = {
  id: "blgv",
  name: "Belgravia Hartford",
  disclosure: DISCLOSURES.btctcsOnly(),
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
        title: "Key Stats",
        description: DESCRIPTIONS.btctcsData(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["Stats!D2:E25"],
        processor: blgvStatsProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history",
        title: "Treasury Actions",
        description: DESCRIPTIONS.treasuryActions(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'BLGV/TA'!A1:AA1000"],
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
        ranges: ["'BLGV/H'!A1:S1000"],
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
        ranges: ["'BLGV/H'!A1:S1000"],
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
