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
