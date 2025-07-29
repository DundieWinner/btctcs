import { blgvTreasuryActionsProcessor } from "@/config/gs-processors/blgv";
import { Company } from "./types";
import { ragnarProcessor } from "@/config/gs-processors/ragnar";

export const companies: Company[] = [
  {
    id: "blgv",
    name: "Belgravia Hartford",
    displayName: "Belgravia Hartford Dashboard",
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
          ranges: ["'BLGV'!A1:AA1000"],
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
              textAlign: "right"
            },
            {
              key: "BTC Held",
              type: "number",
              decimals: 8,
              thousandsSeparator: true,
              textAlign: "right"
            },
            {
              key: "Est. CAD Balance",
              type: "currency",
              decimals: 2,
              textAlign: "right"
            },
            {
              key: "Debt (CAD)",
              type: "currency",
              decimals: 2,
              textAlign: "right"
            },
            {
              key: "FD Share Count",
              type: "number",
              decimals: 0,
              thousandsSeparator: true,
              textAlign: "right"
            },
            {
              key: "Sats / FD Share",
              type: "number",
              decimals: 8,
              thousandsSeparator: true,
              textAlign: "right"
            },
            {
              key: "Sats Equity / FD Share",
              type: "number",
              decimals: 8,
              thousandsSeparator: true,
              textAlign: "right"
            }
          ],
          
          // Conditional styling for positive/negative changes
          conditionalStyles: [
            {
              key: "Change in BTC",
              condition: "positive",
              style: {
                backgroundColor: "rgba(34, 197, 94, 0.2)", // green-500 with opacity
                textColor: "rgb(34, 197, 94)", // green-500
                fontWeight: "bold"
              }
            },
            {
              key: "Change in BTC",
              condition: "negative",
              style: {
                backgroundColor: "rgba(239, 68, 68, 0.2)", // red-500 with opacity
                textColor: "rgb(239, 68, 68)", // red-500
                fontWeight: "bold"
              }
            }
          ],
          
          // Column widths for better layout
          columnWidths: {
            "Date": "120px",
            "Description": "250px",
            "Change in BTC": "140px",
            "BTC Held": "140px",
            "Est. CAD Balance": "150px",
            "Debt (CAD)": "130px",
            "FD Share Count": "140px",
            "Sats / FD Share": "150px",
            "Sats Equity / FD Share": "170px"
          }
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
