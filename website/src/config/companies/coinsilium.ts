import { ragnarProcessor } from "@/config/companies/ragnar";
import { Company, GoogleSheetData } from "@/config/types";
import { createBitcoinAcquisitionsChart } from "@/config/charts/bitcoin-acquisitions";
import {
  bitcoinOrange,
  bitcoinOrangeMedium,
  emeraldGreen,
  emeraldGreenMedium,
  white,
  whiteGrid,
  whiteMedium,
} from "@/config/colors";

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

const bitcoinPriceProcessor = (
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): GoogleSheetData => {
  const dataRange = rangeData[0]; // Single range with all data

  if (!dataRange || !dataRange.values || dataRange.values.length < 2) {
    return { rows: [] };
  }

  // First row contains headers
  const headers = dataRange.values[0];
  const rows: { [key: string]: string | number }[] = [];

  // Define only the columns we actually need for Bitcoin price chart
  const requiredColumns = new Set<string>([
    COLUMN_HEADERS.DATE,
    COLUMN_HEADERS.BTC_PRICE_USD,
    COLUMN_HEADERS.BTC_PURCHASE,
    COLUMN_HEADERS.CLOSING_PRICE_USD,
    COLUMN_HEADERS.SATS_PER_SHARE,
    COLUMN_HEADERS.FWD_SATS_PER_SHARE,
    COLUMN_HEADERS.FWD_MNAV,
  ]);

  // Process each data row (skip header row) - NO DATE FILTERING
  for (let i = 1; i < dataRange.values.length; i++) {
    const rowValues = dataRange.values[i];
    const rowData: { [key: string]: string | number } = {};

    // Only process required columns
    headers.forEach((header, index) => {
      if (requiredColumns.has(header)) {
        const cellValue = rowValues[index];
        if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
          // Try to convert to number if it looks like a number
          const cleanValue = String(cellValue).trim().replace(/[,$]/g, "");
          const numValue = parseFloat(cleanValue);

          if (!isNaN(numValue) && header !== COLUMN_HEADERS.DATE) {
            rowData[header] = numValue;
          } else {
            rowData[header] = String(cellValue).trim();
          }
        }
      }
    });

    // Add all rows that have at least a date (no date filtering)
    if (rowData[COLUMN_HEADERS.DATE]) {
      rows.push(rowData);
    }
  }

  return { rows };
};

const treasuryActionsProcessor = (
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): GoogleSheetData => {
  const dataRange = rangeData[0]; // Single range with all data

  if (!dataRange || !dataRange.values) {
    return { rows: [] };
  }

  // Extract treasury actions from columns A-D and E, F, G, H, K, L
  const treasuryActions: { [key: string]: string | number }[] = [];

  for (let i = 1; i < dataRange.values.length; i++) {
    const row = dataRange.values[i];

    // Extract data from specific columns
    const date = row && row[0] ? String(row[0]).trim() : ""; // Column A
    const description = row && row[1] ? String(row[1]).trim() : ""; // Column B
    const changeRaw = row && row[2] ? String(row[2]).trim() : ""; // Column C (index 2)
    const btcHeld = row && row[3] ? String(row[3]).trim() : ""; // Column D (index 3)
    const estGBPBalance = row && row[5] ? String(row[5]).trim() : ""; // Column F (index 5)
    const shareCount = row && row[7] ? String(row[7]).trim() : ""; // Column H (index 7)
    const satsPerShare = row && row[9] ? String(row[9]).trim() : ""; // Column J (index 9)
    const fwdSatsPerShare = row && row[11] ? String(row[11]).trim() : ""; // Column L (index 11)

    // Helper function to convert to number with better parsing
    const convertToNumber = (
      value: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      columnName?: string,
    ): number | string => {
      if (!value || value === "") {
        return "-";
      }

      // Clean the value - remove commas, currency symbols, and extra spaces
      let cleanValue = value.toString().trim();
      cleanValue = cleanValue.replace(/[,£]/g, ""); // Remove commas and dollar signs
      cleanValue = cleanValue.replace(/\s+/g, ""); // Remove all whitespace

      // Handle negative values in parentheses (accounting format)
      if (cleanValue.startsWith("(") && cleanValue.endsWith(")")) {
        cleanValue = "-" + cleanValue.slice(1, -1);
      }

      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed)) {
        return parsed;
      }

      return "-";
    };

    // Convert all numerical values with debugging
    const changeInBTC = convertToNumber(
      changeRaw,
      COLUMN_HEADERS.CHANGE_IN_BTC,
    );
    const btcHeldValue = convertToNumber(btcHeld, COLUMN_HEADERS.BTC_HELD);
    const estGBPBalanceValue = convertToNumber(
      estGBPBalance,
      COLUMN_HEADERS.EST_GBP_BALANCE,
    );
    const shareCountValue = convertToNumber(
      shareCount,
      COLUMN_HEADERS.SHARE_COUNT,
    );
    const satsPerShareValue = convertToNumber(
      satsPerShare,
      COLUMN_HEADERS.SATS_PER_SHARE,
    );
    const fwdSatsPerShareValue = convertToNumber(
      fwdSatsPerShare,
      COLUMN_HEADERS.FWD_SATS_PER_SHARE,
    );

    // Only include rows where we have at least a date and description
    if (date && description) {
      treasuryActions.push({
        [COLUMN_HEADERS.DATE]: date,
        [COLUMN_HEADERS.DESCRIPTION]: description,
        [COLUMN_HEADERS.CHANGE_IN_BTC]: changeInBTC,
        [COLUMN_HEADERS.BTC_HELD]: btcHeldValue,
        [COLUMN_HEADERS.EST_GBP_BALANCE]: estGBPBalanceValue,
        [COLUMN_HEADERS.SHARE_COUNT]: shareCountValue,
        [COLUMN_HEADERS.SATS_PER_SHARE]: satsPerShareValue,
        [COLUMN_HEADERS.FWD_SATS_PER_SHARE]: fwdSatsPerShareValue,
      });
    }
  }

  console.log(dataRange.values);

  return {
    rows: treasuryActions,
  };
};

export const coinsiliumCompanyConfig: Company = {
  id: "coinsilium",
  name: "Coinsilium",
  disclosure:
    "Data on this dashboard is sourced from @RoaringRagnar's [open-source Google Sheet](https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592) as well as BTCTCs's [community-sheet](https://docs.google.com/spreadsheets/d/1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw/edit?gid=1527424383#gid=1527424383).",
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
        description:
          "Data extracted from <a href='https://x.com/RoaringRagnar' target='_blank' rel='noopener noreferrer'>@RoaringRagnar</a>'s open-source <a href='https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592' target='_blank' rel='noopener noreferrer'>Google Sheet</a>.",
        spreadsheetId: "1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE",
        ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!G2:G70"],
        processor: ragnarProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history",
        title: "Treasury Actions",
        description:
          "Data extracted from BTCTC's <a href='https://docs.google.com/spreadsheets/d/1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw/edit?usp=sharing' target='_blank' rel='noopener noreferrer'>community-sheet</a>.",
        spreadsheetId: "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw",
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
        description:
          "Complete Bitcoin price history with purchase events (all data, no date filtering)",
        spreadsheetId: "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw",
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
          {
            type: "line",
            title: "Historical Performance",
            height: {
              default: 350,
              md: 500,
            },
            animation: false,
            datasets: [
              {
                label: "Fwd Sats / Share",
                mapping: {
                  x: COLUMN_HEADERS.DATE,
                  y: COLUMN_HEADERS.FWD_SATS_PER_SHARE,
                },
                borderColor: bitcoinOrange,
                backgroundColor: bitcoinOrangeMedium,
                tension: 0,
                pointRadius: 5,
                pointHoverRadius: 7,
                yAxisID: "sats",
              },
              {
                label: "Sats / Share",
                mapping: {
                  x: COLUMN_HEADERS.DATE,
                  y: COLUMN_HEADERS.SATS_PER_SHARE,
                },
                borderColor: "#f9cc8f",
                backgroundColor: "#f9cc8f",
                borderDash: [5, 5],
                tension: 0,
                pointRadius: 3,
                pointHoverRadius: 7,
                yAxisID: "sats",
              },
              {
                label: "Share Price (USD)",
                mapping: {
                  x: COLUMN_HEADERS.DATE,
                  y: COLUMN_HEADERS.CLOSING_PRICE_USD,
                },
                borderColor: white,
                backgroundColor: whiteMedium,
                borderDash: [5, 5],
                tension: 0,
                pointRadius: 4,
                pointHoverRadius: 6,
                yAxisID: "price",
              },
              {
                label: "Fwd mNAV",
                mapping: {
                  x: COLUMN_HEADERS.DATE,
                  y: COLUMN_HEADERS.FWD_MNAV,
                },
                borderColor: emeraldGreen,
                backgroundColor: emeraldGreenMedium,
                borderDash: [10, 5],
                tension: 0,
                pointRadius: 2,
                pointHoverRadius: 4,
                yAxisID: "mnav",
              },
            ],
            axes: [
              {
                id: "x",
                type: "time",
                position: "bottom",
                title: {
                  display: true,
                  text: "Date",
                  color: white,
                },
                grid: {
                  color: whiteGrid,
                },
              },
              {
                id: "sats",
                type: "logarithmic",
                position: "left",
                title: {
                  display: true,
                  text: "Sats",
                  color: bitcoinOrange,
                },
                ticks: {
                  color: bitcoinOrange,
                },
                grid: {
                  color: whiteGrid,
                },
              },
              {
                id: "price",
                type: "logarithmic",
                position: "right",
                title: {
                  display: true,
                  text: "Share Price (USD)",
                  color: white,
                },
                ticks: {
                  color: white,
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              {
                id: "mnav",
                type: "linear",
                position: "right",
                title: {
                  display: true,
                  text: "mNAV",
                  color: emeraldGreen,
                },
                ticks: {
                  color: emeraldGreen,
                },
                grid: {
                  drawOnChartArea: false,
                },
                offset: true,
                beginAtZero: true,
              },
            ],
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                enabled: true,
              },
              watermark: {
                enabled: true,
                text: "btctcs.com",
              },
            },
          },
        ],
      },
    ],
  },
};
