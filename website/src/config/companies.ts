import {
  blgvHistoricalProcessor,
  blgvTreasuryActionsProcessor,
} from "@/config/gs-processors/blgv";
import { Company } from "./types";
import { ragnarProcessor } from "@/config/gs-processors/ragnar";

export const companies: Company[] = [
  {
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
          id: "historical-performance",
          title: "Historical Performance",
          description:
            "Historical performance tracking of key financial metrics",
          spreadsheetId: "1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw",
          ranges: ["'BLGV Historical'!A1:S1000"],
          processor: blgvHistoricalProcessor,
          hasHeaders: true,
          renderLocation: "none",
          chart: {
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
          },
        },
      ],
    },
  },
  {
    id: "h100",
    name: "H100",
    displayName: "H100 Company Dashboard",
    emoji: "🇸🇪",
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
          ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!F2:F70"],
          processor: ragnarProcessor,
          renderLocation: "sidebar",
        },
      ],
    },
  },
  {
    id: "lqwd",
    name: "LQWD",
    displayName: "LQWD Company Dashboard",
    emoji: "🇨🇦",
    curators: [
      {
        name: "DunderHodl",
        github: "DundieWinner",
        x: "DunderHodl",
      },
    ],
  },
  {
    id: "metaplanet",
    name: "Metaplanet",
    displayName: "Metaplanet Company Dashboard",
    emoji: "🇯🇵",
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
          ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!C2:C70"],
          processor: ragnarProcessor,
          renderLocation: "sidebar",
        },
      ],
    },
  },
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find((company) => company.id === id);
};

export const getCompanyByName = (name: string): Company | undefined => {
  return companies.find(
    (company) => company.name.toLowerCase() === name.toLowerCase(),
  );
};
