import { ragnarProcessor } from "@/config/companies/ragnar";
import { Company } from "@/config/types";

export const metaplanetCompanyConfig: Company = {
  id: "metaplanet",
  name: "Metaplanet",
  disclosure:
    "Data on this dashboard is sourced from @RoaringRagnar's [open-source Google Sheet](https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592).",
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
};
