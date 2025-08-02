import { getCompanyById } from "@/config/companies";
import { type ChartConfiguration } from "@/config/types";
import { type ProcessedExtraction } from "@/services/googleSheets";

// Helper function to get extractions with chart configurations
export function getChartExtractions(
  extractedData: ProcessedExtraction[],
  companyData: ReturnType<typeof getCompanyById>,
): Array<{
  extraction: ProcessedExtraction;
  config: ChartConfiguration;
  chartIndex: number;
}> {
  const chartExtractions: Array<{
    extraction: ProcessedExtraction;
    config: ChartConfiguration;
    chartIndex: number;
  }> = [];

  for (const extraction of extractedData) {
    if (!extraction.data?.rows) continue;

    // Find the original configuration for this extraction
    const config = companyData?.googleSheet?.extractions.find(
      (e) => e.id === extraction.id,
    );

    if (!config?.charts || config.charts.length === 0) continue;

    // Add each chart configuration as a separate entry
    config.charts.forEach((chartConfig, index) => {
      chartExtractions.push({
        extraction,
        config: chartConfig,
        chartIndex: index,
      });
    });
  }

  return chartExtractions;
}
