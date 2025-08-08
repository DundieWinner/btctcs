import { Company } from "@/config/types";
import { createBitcoinAcquisitionsChart } from "@/config/charts/bitcoin-acquisitions";
import { createHistoricalPerformanceChart } from "@/config/charts/historical-performance";
import {
  type CompanyStatsConfig,
  createCompanyStatsProcessor,
  createColumnFilterProcessor,
  createTreasuryActionsProcessor,
} from "@/config/processors";
import { GOOGLE_SHEET_IDS } from "@/config/sheets";
import { DESCRIPTIONS } from "@/config/extractions/descriptions";
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
  EST_FIAT_BALANCE: "Est. Fiat Balance (USD)",
  FWD_MNAV: "Fwd mNAV",
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
    [COLUMN_HEADERS.FD_SHARE_COUNT]: 11, // Column L
    [COLUMN_HEADERS.SATS_PER_FD_SHARE]: 13, // Column N
    [COLUMN_HEADERS.FWD_SATS_PER_FD_SHARE]: 15, // Column P
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
    },
    {
      metricName: "Forward P/BYD",
      id: "fwd-p-byd",
      label: "Fwd P/BYD",
      order: 4,
    },
    {
      metricName: "BTC Yield YTD",
      id: "btc-yield-ytd",
      label: "BTC Yield YTD",
      order: 5,
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
      style: {
        accentColor: btctcsOrange,
      },
    },
  ],
};

const sequansStatsProcessor = createCompanyStatsProcessor(sequansStatsConfig);

export const sequansCompanyConfig: Company = {
  id: "sequans-communications",
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
        ranges: ["Stats!M2:N21"],
        processor: sequansStatsProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history-sqns-ta",
        title: "Treasury Actions (SQNS|TA)",
        description: DESCRIPTIONS.treasuryActions(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'SQNS|TA'!A1:AA1000"],
        processor: treasuryActionsProcessor,
        renderLocation: "bottom",
        hasHeaders: true,
      },
      {
        id: "history-sqns-h",
        title: "Historical Performance (SQNS|H)",
        description: DESCRIPTIONS.bitcoinPriceHistory(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'SQNS|H'!A1:S1000"],
        processor: bitcoinPriceProcessor,
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
          createHistoricalPerformanceChart({
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
