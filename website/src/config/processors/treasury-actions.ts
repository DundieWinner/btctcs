import { GoogleSheetData } from "@/config/types";

export interface TreasuryActionsColumnMapping {
  [columnHeader: string]: number; // Column header -> column index mapping
}

export interface TreasuryActionsConfig {
  columnMapping: TreasuryActionsColumnMapping;
  dateColumn: string;
  descriptionColumn: string;
  currencySymbolsToRemove?: string[]; // e.g., ['$', '£', '€']
}

/**
 * Creates a processor that extracts treasury actions data from specific column indices
 * and converts values to numbers where appropriate
 */
export function createTreasuryActionsProcessor(
  config: TreasuryActionsConfig,
) {
  return (rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[]): GoogleSheetData => {
    const dataRange = rangeData[0]; // Single range with all data

    if (!dataRange || !dataRange.values) {
      return { rows: [] };
    }

    const treasuryActions: { [key: string]: string | number }[] = [];
    const currencySymbols = config.currencySymbolsToRemove || ['$', '£', '€', ','];

    // Helper function to convert to number with better parsing
    const convertToNumber = (value: string): number | string => {
      if (!value || value === "") {
        return "-";
      }

      // Clean the value - remove currency symbols and extra spaces
      let cleanValue = value.toString().trim();
      
      // Remove specified currency symbols
      const symbolsRegex = new RegExp(`[${currencySymbols.map(s => `\\${s}`).join('')}]`, 'g');
      cleanValue = cleanValue.replace(symbolsRegex, "");
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

    // Process each data row (skip header row)
    for (let i = 1; i < dataRange.values.length; i++) {
      const row = dataRange.values[i];

      // Extract basic required fields
      const date = row && row[config.columnMapping[config.dateColumn]] 
        ? String(row[config.columnMapping[config.dateColumn]]).trim() 
        : "";
      const description = row && row[config.columnMapping[config.descriptionColumn]] 
        ? String(row[config.columnMapping[config.descriptionColumn]]).trim() 
        : "";

      // Only include rows where we have at least a date and description
      if (date && description) {
        const rowData: { [key: string]: string | number } = {
          [config.dateColumn]: date,
          [config.descriptionColumn]: description,
        };

        // Process all other configured columns
        Object.entries(config.columnMapping).forEach(([columnHeader, columnIndex]) => {
          if (columnHeader !== config.dateColumn && columnHeader !== config.descriptionColumn) {
            const rawValue = row && row[columnIndex] ? String(row[columnIndex]).trim() : "";
            
            // Convert to number if it looks like a numeric value
            if (rawValue && rawValue !== "") {
              rowData[columnHeader] = convertToNumber(rawValue);
            } else {
              rowData[columnHeader] = "-";
            }
          }
        });

        treasuryActions.push(rowData);
      }
    }

    return {
      rows: treasuryActions,
    };
  };
}
