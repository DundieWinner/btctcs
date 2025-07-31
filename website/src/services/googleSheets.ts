import { googleSheetsApiKey } from "@/config/environment-be";
import {
  type CellStyle,
  type ColumnFormat,
  type ConditionalStyle,
  type GoogleSheetData,
  type GoogleSheetExtraction,
  type KeyStatistic,
  type TableStyle,
} from "@/config/types";

// Processed extraction result
export interface ProcessedExtraction {
  id: string;
  title: string;
  description?: string;
  data?: GoogleSheetData;
  keyStatistics?: KeyStatistic[];
  hasHeaders?: boolean;

  // Formatting options
  columnFormats?: ColumnFormat[];
  conditionalStyles?: ConditionalStyle[];
  cellStyles?: CellStyle[];
  tableStyle?: TableStyle;

  // Display options
  maxRows?: number;
  sortBy?: {
    column: string;
    direction: "asc" | "desc";
  };
  hideColumns?: string[];
  columnOrder?: string[];
  columnWidths?: { [key: string]: string };
}

// Function to fetch multiple ranges from a single Google Sheet using batchGet
export async function fetchGoogleSheetDataBatch(
  spreadsheetId: string,
  ranges: string[],
): Promise<
  {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[]
> {
  try {
    // Build the batchGet URL with multiple ranges
    const rangeParams = ranges
      .map((range) => `ranges=${encodeURIComponent(range)}`)
      .join("&");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangeParams}&key=${googleSheetsApiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    } as RequestInit & { next: { revalidate: number } });

    if (!response.ok) {
      console.error(
        `Google Sheets batchGet API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const batchResponse: {
      spreadsheetId: string;
      valueRanges: {
        range: string;
        majorDimension: string;
        values?: string[][];
      }[];
    } = await response.json();

    // Return valueRanges as-is from the fetch
    return batchResponse.valueRanges;
  } catch (error) {
    console.error("Error fetching Google Sheet batch data:", error);
    return [];
  }
}

// Function to process multiple Google Sheet extractions using batchGet
export async function processGoogleSheetExtractions(
  extractions: GoogleSheetExtraction[],
): Promise<ProcessedExtraction[]> {
  if (extractions.length === 0) {
    return [];
  }

  const results: ProcessedExtraction[] = [];

  // Process each extraction individually (each extraction = one batchGet call)
  for (const extraction of extractions) {
    try {
      // Fetch all ranges for this extraction in a single batchGet call
      const batchData = await fetchGoogleSheetDataBatch(
        extraction.spreadsheetId,
        extraction.ranges,
      );

      // Apply processor if provided, otherwise use the first range data
      let processedData: GoogleSheetData | undefined;
      let keyStatistics: KeyStatistic[] | undefined;

      if (extraction.processor) {
        const result = extraction.processor(batchData);

        // Handle both old (GoogleSheetData) and new (ProcessorResult) return types
        if ("rows" in result) {
          // Old format: direct GoogleSheetData
          processedData = result;
        } else {
          // New format: ProcessorResult
          processedData = result.data;
          keyStatistics = result.keyStatistics;
        }
      } else {
        // Default behavior: use first range data if no processor
        const firstRangeData = batchData[0];
        if (!firstRangeData || !firstRangeData.values) {
          processedData = { rows: [] };
        } else {
          // Convert raw valueRange to GoogleSheetData format
          const rows: { [key: string]: string | number }[] = [];
          for (let i = 0; i < firstRangeData.values.length; i++) {
            const row: { [key: string]: string | number } = {};
            const rowData = firstRangeData.values[i];

            rowData.forEach((value: string, index: number) => {
              // Try to convert to number if it looks like a number
              const numValue = parseFloat(value);
              row[`col_${index}`] =
                !isNaN(numValue) && value !== "" ? numValue : value;
            });

            rows.push(row);
          }
          processedData = { rows };
        }
      }

      results.push({
        id: extraction.id,
        title: extraction.title,
        description: extraction.description,
        data: processedData,
        keyStatistics: keyStatistics,
        hasHeaders: extraction.hasHeaders,

        // Pass through all formatting options
        columnFormats: extraction.columnFormats,
        conditionalStyles: extraction.conditionalStyles,
        cellStyles: extraction.cellStyles,
        tableStyle: extraction.tableStyle,

        // Pass through display options
        maxRows: extraction.maxRows,
        sortBy: extraction.sortBy,
        hideColumns: extraction.hideColumns,
        columnOrder: extraction.columnOrder,
        columnWidths: extraction.columnWidths,
      });
    } catch (error) {
      console.error(`Error processing extraction ${extraction.id}:`, error);
    }
  }

  return results;
}
