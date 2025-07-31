import { GoogleSheetData } from "@/config/types";

export interface ColumnFilterConfig {
  requiredColumns: string[];
  dateColumn: string;
  startDate?: string; // Optional date filter (YYYY-MM-DD format)
}

/**
 * Creates a processor that filters Google Sheets data to only include specified columns
 * and optionally filters rows by date
 */
export function createColumnFilterProcessor(
  config: ColumnFilterConfig,
) {
  return (rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[]): GoogleSheetData => {
    const dataRange = rangeData[0]; // Single range with all data

    if (!dataRange || !dataRange.values || dataRange.values.length < 2) {
      return { rows: [] };
    }

    // First row contains headers
    const headers = dataRange.values[0];
    const rows: { [key: string]: string | number }[] = [];

    // Create set for O(1) lookup
    const requiredColumns = new Set<string>(config.requiredColumns);

    // Parse start date if provided
    let startDate: Date | null = null;
    if (config.startDate) {
      startDate = new Date(config.startDate);
    }

    // Process each data row (skip header row)
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

            if (!isNaN(numValue) && header !== config.dateColumn) {
              rowData[header] = numValue;
            } else {
              rowData[header] = String(cellValue).trim();
            }
          }
        }
      });

      // Check if row should be included
      if (rowData[config.dateColumn]) {
        let includeRow = true;

        // Apply date filtering if specified
        if (startDate) {
          const rowDateStr = String(rowData[config.dateColumn]).trim();
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

          // Only include rows on or after start date
          includeRow = rowDate >= startDate;
        }

        if (includeRow) {
          rows.push(rowData);
        }
      }
    }

    return { rows };
  };
}
