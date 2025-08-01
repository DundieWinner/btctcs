import { Company, GoogleSheetData } from "@/config/types";
import { createBitcoinAcquisitionsChart } from "@/config/charts/bitcoin-acquisitions";
import { createHistoricalPerformanceChart } from "@/config/charts/historical-performance";
import {
  createColumnFilterProcessor,
  createTreasuryActionsProcessor,
  ragnarProcessor,
} from "@/config/processors";
import { GOOGLE_SHEET_IDS } from "@/config/sheets";
import { DESCRIPTIONS } from "@/config/extractions/descriptions";
import { DISCLOSURES } from "./disclosures";

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
  SHARE_COUNT: "Share Count",
  SATS_PER_SHARE: "Sats / Share",
  FWD_SATS_PER_SHARE: "Fwd Sats / Share",

  // Financial columns
  EST_GBP_BALANCE: "Est. Fiat Balance (GBP)",
  FWD_MNAV: "Fwd mNAV",
} as const;

const bitcoinPriceProcessor = createColumnFilterProcessor({
  requiredColumns: [
    COLUMN_HEADERS.DATE,
    COLUMN_HEADERS.BTC_PRICE_USD,
    COLUMN_HEADERS.BTC_PURCHASE,
    COLUMN_HEADERS.CLOSING_PRICE_USD,
    COLUMN_HEADERS.SATS_PER_SHARE,
    COLUMN_HEADERS.FWD_SATS_PER_SHARE,
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
    [COLUMN_HEADERS.EST_GBP_BALANCE]: 5, // Column F
    [COLUMN_HEADERS.SHARE_COUNT]: 7, // Column H
    [COLUMN_HEADERS.SATS_PER_SHARE]: 9, // Column J
    [COLUMN_HEADERS.FWD_SATS_PER_SHARE]: 11, // Column L
  },
  dateColumn: COLUMN_HEADERS.DATE,
  descriptionColumn: COLUMN_HEADERS.DESCRIPTION,
});

export const coinsiliumCompanyConfig: Company = {
  id: "coinsilium",
  name: "Coinsilium",
  disclosure: DISCLOSURES.ragnarAndBtctcs(),
  emoji: "🇬🇧",
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
        description: DESCRIPTIONS.ragnarStats(),
        spreadsheetId: GOOGLE_SHEET_IDS.RAGNAR_COMPARISON,
        ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!G2:G70"],
        processor: ragnarProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history",
        title: "Treasury Actions",
        description: DESCRIPTIONS.treasuryActions(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'Coinsilium Treasury Actions'!A1:AA1000"],
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
            key: COLUMN_HEADERS.EST_GBP_BALANCE,
            type: "currency",
            decimals: 0,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.SHARE_COUNT,
            type: "number",
            decimals: 0,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.SATS_PER_SHARE,
            type: "number",
            decimals: 1,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: COLUMN_HEADERS.FWD_SATS_PER_SHARE,
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
          [COLUMN_HEADERS.EST_GBP_BALANCE]: "150px",
          [COLUMN_HEADERS.SHARE_COUNT]: "150px",
          [COLUMN_HEADERS.SATS_PER_SHARE]: "130px",
          [COLUMN_HEADERS.FWD_SATS_PER_SHARE]: "130px",
        },
      },
      {
        id: "bitcoin-price-history",
        title: "Bitcoin Price History",
        description: DESCRIPTIONS.bitcoinPriceHistory(),
        spreadsheetId: GOOGLE_SHEET_IDS.BTCTCS_COMMUNITY,
        ranges: ["'Coinsilium Historical'!A1:S1000"],
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
            primarySatsColumn: COLUMN_HEADERS.FWD_SATS_PER_SHARE,
            secondarySatsColumn: COLUMN_HEADERS.SATS_PER_SHARE,
            sharePriceColumn: COLUMN_HEADERS.CLOSING_PRICE_USD,
            mnavColumn: COLUMN_HEADERS.FWD_MNAV,
            primarySatsLabel: "Fwd Sats / Share",
            secondarySatsLabel: "Sats / Share",
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
