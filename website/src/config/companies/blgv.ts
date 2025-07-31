import { Company, GoogleSheetData } from "@/config/types";
import { ragnarProcessor } from "@/config/companies/ragnar";

// Processor for BLGV Historical chart data
const blgvHistoricalProcessor = (
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

  // Define the start date filter (July 17th, 2025)
  const startDate = new Date("2025-07-17");

  // Process each data row (skip header row)
  for (let i = 1; i < dataRange.values.length; i++) {
    const rowValues = dataRange.values[i];
    const rowData: { [key: string]: string | number } = {};

    // Map each cell to its corresponding header
    headers.forEach((header, index) => {
      const cellValue = rowValues[index];
      if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
        // Try to convert to number if it looks like a number
        const cleanValue = String(cellValue).trim().replace(/[,$]/g, "");
        const numValue = parseFloat(cleanValue);

        if (!isNaN(numValue) && header !== "Date") {
          rowData[header] = numValue;
        } else {
          rowData[header] = String(cellValue).trim();
        }
      }
    });

    // Only add rows that have at least a date and are on or after July 17th, 2025
    if (rowData["Date"]) {
      // Parse the date from the row
      const rowDateStr = String(rowData["Date"]).trim();
      let rowDate: Date;

      // Handle different date formats
      if (rowDateStr.includes("/")) {
        // Handle M/D/YYYY format
        const [month, day, year] = rowDateStr.split("/");
        rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (rowDateStr.includes("-")) {
        // Handle YYYY-MM-DD format
        rowDate = new Date(rowDateStr);
      } else {
        // Fallback to direct parsing
        rowDate = new Date(rowDateStr);
      }

      // Only include rows on or after July 17th, 2025
      if (rowDate >= startDate) {
        rows.push(rowData);
      }
    }
  }

  return { rows };
};

// Processor for BLGV Bitcoin acquisitions chart data (no date filtering)
const blgvBitcoinPriceProcessor = (
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

  // Process each data row (skip header row) - NO DATE FILTERING
  for (let i = 1; i < dataRange.values.length; i++) {
    const rowValues = dataRange.values[i];
    const rowData: { [key: string]: string | number } = {};

    // Map each cell to its corresponding header
    headers.forEach((header, index) => {
      const cellValue = rowValues[index];
      if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
        // Try to convert to number if it looks like a number
        const cleanValue = String(cellValue).trim().replace(/[,$]/g, "");
        const numValue = parseFloat(cleanValue);

        if (!isNaN(numValue) && header !== "Date") {
          rowData[header] = numValue;
        } else {
          rowData[header] = String(cellValue).trim();
        }
      }
    });

    // Add all rows that have at least a date (no date filtering)
    if (rowData["Date"]) {
      rows.push(rowData);
    }
  }

  return { rows };
};

const blgvTreasuryActionsProcessor = (
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
    const estCADBalance = row && row[5] ? String(row[5]).trim() : ""; // Column F (index 5)
    const debtCAD = row && row[7] ? String(row[7]).trim() : ""; // Column H (index 7)
    const fdShareCount = row && row[13] ? String(row[13]).trim() : ""; // Column N (index 13)
    const satsPerFDShare = row && row[15] ? String(row[15]).trim() : ""; // Column P (index 15)
    const satsEquityPerFDShare = row && row[17] ? String(row[17]).trim() : ""; // Column R (index 17)

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
      cleanValue = cleanValue.replace(/[,$]/g, ""); // Remove commas and dollar signs
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
    const changeInBTC = convertToNumber(changeRaw, "Change in BTC");
    const btcHeldValue = convertToNumber(btcHeld, "BTC Held");
    const estCADBalanceValue = convertToNumber(
      estCADBalance,
      "Est. CAD Balance",
    );
    const debtCADValue = convertToNumber(debtCAD, "Debt (CAD)");
    const fdShareCountValue = convertToNumber(fdShareCount, "FD Share Count");
    const satsPerFDShareValue = convertToNumber(
      satsPerFDShare,
      "Sats / FD Share",
    );
    const satsEquityPerFDShareValue = convertToNumber(
      satsEquityPerFDShare,
      "Sats Eq. / FD Share",
    );

    // Only include rows where we have at least a date and description
    if (date && description) {
      treasuryActions.push({
        Date: date,
        Description: description,
        "Change in BTC": changeInBTC,
        "BTC Held": btcHeldValue,
        "Est. CAD Balance": estCADBalanceValue,
        "Debt (CAD)": debtCADValue,
        "FD Share Count": fdShareCountValue,
        "Sats / FD Share": satsPerFDShareValue,
        "Sats Eq. / FD Share": satsEquityPerFDShareValue,
      });
    }
  }

  return {
    rows: treasuryActions,
  };
};

export const blgvCompanyConfig: Company = {
  id: "blgv",
  name: "Belgravia Hartford",
  displayName: "Belgravia Hartford Dashboard",
  disclosure:
    "Data on this dashboard is sourced from @RoaringRagnar's [open-source Google Sheet](https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592) as well as BTCTCs's [community-sheet](https://docs.google.com/spreadsheets/d/1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw/edit?gid=1527424383#gid=1527424383).",
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
        id: "ragnar",
        title: "Ragnar Stats",
        description:
          "Data extracted from <a href='https://x.com/RoaringRagnar' target='_blank' rel='noopener noreferrer'>@RoaringRagnar</a>'s open-source <a href='https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592' target='_blank' rel='noopener noreferrer'>Google Sheet</a>.",
        spreadsheetId: "1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE",
        ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!H2:H70"],
        processor: ragnarProcessor,
        renderLocation: "sidebar",
      },
      {
        id: "history",
        title: "Treasury Actions",
        description:
          "Data extracted from <a href='https://docs.google.com/spreadsheets/d/1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw/edit?usp=sharing' target='_blank' rel='noopener noreferrer'>Google Sheet</a>.",
        spreadsheetId: "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw",
        ranges: ["'BLGV Treasury Actions'!A1:AA1000"],
        processor: blgvTreasuryActionsProcessor,
        renderLocation: "bottom",
        hasHeaders: true,

        // Column formatting
        columnFormats: [
          {
            key: "Change in BTC",
            type: "number",
            decimals: 8,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: "BTC Held",
            type: "number",
            decimals: 8,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: "Est. CAD Balance",
            type: "currency",
            decimals: 2,
            textAlign: "right",
          },
          {
            key: "Debt (CAD)",
            type: "currency",
            decimals: 2,
            textAlign: "right",
          },
          {
            key: "FD Share Count",
            type: "number",
            decimals: 0,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: "Sats / FD Share",
            type: "number",
            decimals: 1,
            thousandsSeparator: true,
            textAlign: "right",
          },
          {
            key: "Sats Eq. / FD Share",
            type: "number",
            decimals: 1,
            thousandsSeparator: true,
            textAlign: "right",
          },
        ],

        // Conditional styling for positive/negative changes
        conditionalStyles: [
          {
            key: "Change in BTC",
            condition: "positive",
            style: {
              backgroundColor: "rgba(34, 197, 94, 0.2)", // green-500 with opacity
              textColor: "rgb(34, 197, 94)", // green-500
              fontWeight: "bold",
            },
          },
          {
            key: "Change in BTC",
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
          Date: "120px",
          Description: "250px",
          "Change in BTC": "140px",
          "BTC Held": "140px",
          "Est. CAD Balance": "150px",
          "Debt (CAD)": "130px",
          "FD Share Count": "150px",
          "Sats / FD Share": "130px",
          "Sats Eq. / FD Share": "130px",
        },
      },
      {
        id: "bitcoin-price-history",
        title: "Bitcoin Price History",
        description: "Complete Bitcoin price history with purchase events (all data, no date filtering)",
        spreadsheetId: "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw",
        ranges: ["'BLGV Historical'!A1:S1000"],
        processor: blgvBitcoinPriceProcessor,
        hasHeaders: true,
        renderLocation: "none",
        charts: [{
          type: "line",
          title: "Bitcoin Acquisitions",
          height: {
            default: 400,
            md: 550,
            lg: 650,
          },
          animation: false,
          datasets: [
            {
              label: "Bitcoin Price (USD)",
              mapping: { x: "Date", y: "BTC Price (USD)" },
              borderColor: "#f3991f",
              backgroundColor: "rgba(243, 153, 31, 0.1)",
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 0,
              yAxisID: "btcPrice",
            },
            {
              label: "BTC Purchase",
              mapping: { 
                x: "Date", 
                y: "BTC Purchase",
                yPosition: "BTC Price (USD)", 
                filter: {
                  column: "BTC Purchase",
                  condition: "nonzero"
                },
                pointSize: {
                  column: "BTC Purchase",
                  minSize: 8,
                  maxSize: 20,
                  scale: "sqrt"
                }
              },
              borderColor: "#f3991f",
              backgroundColor: "rgba(243, 153, 31, 0.1)",
              pointBackgroundColor: "#f3991f",
              pointBorderColor: "#f3991f",
              pointBorderWidth: 2,
              showLine: false,
              yAxisID: "btcPrice",
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
                color: "#ffffff",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
            {
              id: "btcPrice",
              type: "logarithmic",
              position: "left",
              title: {
                display: true,
                text: "Bitcoin Price (USD)",
                color: "#f3991f",
              },
              ticks: {
                color: "#f3991f",
                callback: "(value) => '$' + value.toLocaleString()",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
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
        }],
      },
      {
        id: "historical-performance",
        title: "Historical Performance",
        description: "Historical performance tracking of key financial metrics",
        spreadsheetId: "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw",
        ranges: ["'BLGV Historical'!A1:S1000"],
        processor: blgvHistoricalProcessor,
        hasHeaders: true,
        renderLocation: "none",
        charts: [{
          type: "line",
          title: "Historical Performance",
          height: {
            default: 350,
            md: 500,
          },
          animation: false,
          datasets: [
            {
              label: "Fwd Sats Eq. / FD Share",
              mapping: { x: "Date", y: "Fwd Sats Eq. / FD Share" },
              borderColor: "#f3991f",
              backgroundColor: "rgba(243, 153, 31, 0.2)",
              tension: 0,
              pointRadius: 5,
              pointHoverRadius: 7,
              yAxisID: "sats",
            },
            {
              label: "Sats / FD Share",
              mapping: { x: "Date", y: "Sats / FD Share" },
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
              mapping: { x: "Date", y: "Closing Price (USD)" },
              borderColor: "#ffffff",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderDash: [5, 5],
              tension: 0,
              pointRadius: 4,
              pointHoverRadius: 6,
              yAxisID: "price",
            },
            {
              label: "Fwd Eq. mNAV",
              mapping: { x: "Date", y: "Fwd Eq. mNAV" },
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
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
                color: "#ffffff",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
            {
              id: "sats",
              type: "logarithmic",
              position: "left",
              title: {
                display: true,
                text: "Sats",
                color: "#f3991f",
              },
              ticks: {
                color: "#f3991f",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
            {
              id: "price",
              type: "logarithmic",
              position: "right",
              title: {
                display: true,
                text: "Share Price (USD)",
                color: "#ffffff",
              },
              ticks: {
                color: "#ffffff",
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
                color: "#10b981",
              },
              ticks: {
                color: "#10b981",
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
        }],
      },
    ],
  },
};
