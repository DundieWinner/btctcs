import { ragnarProcessor } from "@/config/processors";
import { Company } from "@/config/types";
import { GOOGLE_SHEET_IDS } from "@/config/sheets";
import { DESCRIPTIONS } from "@/config/extractions/descriptions";
import { DISCLOSURES } from "./disclosures";

export const metaplanetCompanyConfig: Company = {
  id: "metaplanet",
  name: "Metaplanet",
  disclosure: DISCLOSURES.ragnarOnly(),
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
        description: DESCRIPTIONS.ragnarStats(),
        spreadsheetId: GOOGLE_SHEET_IDS.RAGNAR_COMPARISON,
        ranges: ["'Ragnar Comparison'!A2:A70", "'Ragnar Comparison'!C2:C70"],
        processor: ragnarProcessor,
        renderLocation: "sidebar",
      },
    ],
  },
};
