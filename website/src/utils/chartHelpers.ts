import { getCompanyById } from "@/config/companies";
import { type ChartConfiguration } from "@/config/types";
import { type ProcessedExtraction } from "@/services/googleSheets";

// Helper function to get extractions with chart configurations
export function getChartExtractions(
  extractedData: ProcessedExtraction[],
  companyData: ReturnType<typeof getCompanyById>,
): Array<{ extraction: ProcessedExtraction; config: ChartConfiguration }> {
  const chartExtractions: Array<{
    extraction: ProcessedExtraction;
    config: ChartConfiguration;
  }> = [];

  for (const extraction of extractedData) {
    if (!extraction.data?.rows) continue;

    // Find the original configuration for this extraction
    const config = companyData?.googleSheet?.extractions.find(
      (e) => e.id === extraction.id,
    );

    if (!config?.chart) continue;

    chartExtractions.push({ extraction, config: config.chart });
  }

  return chartExtractions;
}
