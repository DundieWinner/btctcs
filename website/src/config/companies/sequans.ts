import { Company } from "@/config/types";
import { createBitcoinAcquisitionsChart } from "@/config/charts/bitcoin-acquisitions";
import { createHistoricalPerformanceCharts } from "@/config/charts/historical-performance";
import { createDaysToCoverChart } from "@/config/charts/days-to-cover";
import {
  type CompanyStatsConfig,
  createColumnFilterProcessor,
  createCompanyStatsProcessor,
  createTreasuryActionsProcessor,
} from "@/config/processors";
import { GOOGLE_SHEET_IDS } from "@/config/sheets";
import {
  DESCRIPTIONS,
  KEY_STATISTIC_DESCRIPTIONS,
} from "@/config/extractions/descriptions";
import { emeraldGreen, emeraldGreen600 } from "@/config/colors";
import { btctcsOrange } from "@/config/colors";
import { DISCLOSURES } from "./disclosures";

const COLUMN_HEADERS = {
  DATE: "Date",
  DESCRIPTION: "Description",
  BTC_PRICE_USD: "BTC Price (USD)",
  BTC_PURCHASE: "BTC Purchase",
  BTC_HELD: "BTC Held",
  CHANGE_IN_BTC: "Change in BTC",
  CLOSING_PRICE_USD: "Closing Price (USD)",
  SHARE_COUNT: "Share Count",
  FD_SHARE_COUNT: "FD Share Count",
  SATS_PER_FD_SHARE: "Sats / FD Share",
  FWD_SATS_PER_FD_SHARE: "Fwd Sats / FD Share",
  EST_FIAT_BALANCE: "BTC Earmarked Cash (USD)",
  FWD_MNAV: "Fwd mNAV",
  FWD_MNAV_1_PRICE: "1 Fwd mNAV Price",
  FWD_MNAV_3_PRICE: "3 Fwd mNAV Price",
} as const;

const bitcoinPriceProcessor = createColumnFilterProcessor({
  requiredColumns: [
    COLUMN_HEADERS.DATE,
    COLUMN_HEADERS.BTC_PRICE_USD,
    COLUMN_HEADERS.BTC_PURCHASE,
    COLUMN_HEADERS.CLOSING_PRICE_USD,
    COLUMN_HEADERS.SATS_PER_FD_SHARE,
    COLUMN_HEADERS.FWD_SATS_PER_FD_SHARE,
    COLUMN_HEADERS.FWD_MNAV,
    COLUMN_HEADERS.FWD_MNAV_1_PRICE,
    COLUMN_HEADERS.FWD_MNAV_3_PRICE,
  ],
  dateColumn: COLUMN_HEADERS.DATE,
});

const treasuryActionsProcessor = createTreasuryActionsProcessor({
  columnMapping: {
    [COLUMN_HEADERS.DATE]: 0, // Column A
    [COLUMN_HEADERS.DESCRIPTION]: 1, // Column B
    [COLUMN_HEADERS.CHANGE_IN_BTC]: 2, // Column C
    [COLUMN_HEADERS.BTC_HELD]: 3, // Column D
    [COLUMN_HEADERS.EST_FIAT_BALANCE]: 5, // Column F
    [COLUMN_HEADERS.FD_SHARE_COUNT]: 13, // Column N
    [COLUMN_HEADERS.SATS_PER_FD_SHARE]: 15, // Column P
    [COLUMN_HEADERS.FWD_SATS_PER_FD_SHARE]: 17, // Column R
  },
  dateColumn: COLUMN_HEADERS.DATE,
  descriptionColumn: COLUMN_HEADERS.DESCRIPTION,
});

const sequansStatsConfig: CompanyStatsConfig = {
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
      description: KEY_STATISTIC_DESCRIPTIONS.forwardMonthsToCoverMnav(),
    },
    {
      metricName: "Forward P/BYD",
      id: "fwd-p-byd",
      label: "Fwd P/BYD",
      order: 4,
      description: KEY_STATISTIC_DESCRIPTIONS.forwardPByd(),
    },
    {
      metricName: "BTC Yield T30D",
      id: "btc-yield-t30d",
      label: "BTC Yield T30D",
      order: 5,
      description: KEY_STATISTIC_DESCRIPTIONS.btcYieldT30d(),
    },
    {
      metricName: "Current Price (USD)",
      id: "current-price-usd",
      label: "Current Price (USD)",
      order: 6,
      prefix: "$",
    },
    {
      metricName: "Market Cap (USD)",
      id: "market-cap-usd",
      label: "Market Cap (USD)",
      order: 7,
      prefix: "$",
    },
    {
      metricName: "Enterprise Value (USD)",
      id: "enterprise-value-usd",
      label: "Enterprise Value (USD)",
      order: 8,
      description: KEY_STATISTIC_DESCRIPTIONS.enterpriseValue(),
      prefix: "$",
    },
  ],
  combinedMetrics: [
    {
      id: "mnav-combined",
      label: "mNAV (Basic / Fwd)",
      order: 2,
      metrics: [
        { metricName: "mNAV", required: true },
        { metricName: "Forward mNAV", required: true },
      ],
      separator: " / ",
      description: KEY_STATISTIC_DESCRIPTIONS.mnavCombined(),
      style: {
        accentColor: btctcsOrange,
      },
    },
  ],
};

const sequansStatsProcessor = createCompanyStatsProcessor(sequansStatsConfig);

export const sequansCompanyConfig: Company = {
  id: "sequans-communications",
  s3Key: "sequans",
  name: "Sequans Communications",
  disclosure: DISCLOSURES.btctcsOnly(),
  emoji: "🇫🇷",
  curators: [
    {
      name: "@american_roci",
      x: "american_roci",
    },
  ],
  googleSheet: {
    extractions: [
      {
        id: "sequans-stats",
        title: "Key Stats",
        description: DESCRIPTIONS.btctcsData(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["Stats!M2:N20"],
        processor: sequansStatsProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history-sqns-ta",
        title: "Treasury Actions",
        description: DESCRIPTIONS.treasuryActions(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'SQNS|TA'!A1:AA1000"],
        processor: treasuryActionsProcessor,
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
            key: COLUMN_HEADERS.EST_FIAT_BALANCE,
            type: "currency",
            decimals: 0,
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
            key: COLUMN_HEADERS.FWD_SATS_PER_FD_SHARE,
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
        columnWidths: {
          [COLUMN_HEADERS.DATE]: "120px",
          [COLUMN_HEADERS.DESCRIPTION]: "250px",
          [COLUMN_HEADERS.CHANGE_IN_BTC]: "140px",
          [COLUMN_HEADERS.BTC_HELD]: "140px",
          [COLUMN_HEADERS.EST_FIAT_BALANCE]: "150px",
          [COLUMN_HEADERS.FD_SHARE_COUNT]: "150px",
          [COLUMN_HEADERS.SATS_PER_FD_SHARE]: "130px",
          [COLUMN_HEADERS.FWD_SATS_PER_FD_SHARE]: "130px",
        },
      },
      {
        id: "history-sqns-h",
        title: "Historical Performance",
        description: DESCRIPTIONS.bitcoinPriceHistory(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'SQNS|H'!A1:V1000"],
        processor: bitcoinPriceProcessor,
        hasHeaders: true,
        renderLocation: "none",
        charts: [
          createBitcoinAcquisitionsChart({
            dateColumn: COLUMN_HEADERS.DATE,
            priceColumn: COLUMN_HEADERS.BTC_PRICE_USD,
            purchaseColumn: COLUMN_HEADERS.BTC_PURCHASE,
          }),
          createDaysToCoverChart({
            dateColumn: COLUMN_HEADERS.DATE,
            sharePriceColumn: COLUMN_HEADERS.CLOSING_PRICE_USD,
            mnavBands: [
              {
                column: COLUMN_HEADERS.FWD_MNAV_1_PRICE,
                level: 1,
                label: "1x FmNAV Price",
                color: emeraldGreen,
              },
              {
                column: COLUMN_HEADERS.FWD_MNAV_3_PRICE,
                level: 3,
                label: "3x FmNAV Price",
                color: emeraldGreen600,
              },
            ],
            title: "mNAV Bands",
            sharePriceLabel: "Share Price (USD)",
            sharePriceAxisTitle: "Share Price (USD)",
          }),
          ...createHistoricalPerformanceCharts({
            dateColumn: COLUMN_HEADERS.DATE,
            primarySatsColumn: COLUMN_HEADERS.FWD_SATS_PER_FD_SHARE,
            secondarySatsColumn: COLUMN_HEADERS.SATS_PER_FD_SHARE,
            sharePriceColumn: COLUMN_HEADERS.CLOSING_PRICE_USD,
            mnavColumn: COLUMN_HEADERS.FWD_MNAV,
            primarySatsLabel: "Fwd Sats / Share",
            secondarySatsLabel: "Sats / Share",
            sharePriceLabel: "Share Price (USD)",
            sharePriceAxisTitle: "Share Price (USD)",
            mnavLabel: "Fwd mNAV",
          }),
        ],
      },
    ],
  },
};
