import { GoogleSheetData } from "@/config/types";

export interface TreasuryActionsColumnMapping {
  [columnHeader: string]: number; // Column header -> column index mapping
}

export interface TreasuryActionsConfig {
  columnMapping: TreasuryActionsColumnMapping;
  dateColumn: string;
  descriptionColumn: string;
}

/**
 * Creates a processor that extracts treasury actions data from specific column indices
 * and converts values to numbers where appropriate
 */
export function createTreasuryActionsProcessor(config: TreasuryActionsConfig) {
  return (
    rangeData: {
      range: string;
      majorDimension: string;
      values?: string[][];
    }[],
  ): GoogleSheetData => {
    const dataRange = rangeData[0]; // Single range with all data

    if (!dataRange || !dataRange.values) {
      return { rows: [] };
    }

    const treasuryActions: { [key: string]: string | number }[] = [];

    // Helper function to convert to number with comprehensive cleaning
    const convertToNumber = (value: string): number | string => {
      if (!value || value === "") {
        return "-";
      }

      // Clean the value - remove any non-numeric characters except decimal point, minus sign, and parentheses
      let cleanValue = value.toString().trim();

      // Handle negative values in parentheses (accounting format) first
      if (cleanValue.startsWith("(") && cleanValue.endsWith(")")) {
        cleanValue = "-" + cleanValue.slice(1, -1);
      }

      // Remove all characters except digits, decimal point, and minus sign
      // This will handle any currency symbols ($, £, €, ¥, etc.), commas, spaces, etc.
      cleanValue = cleanValue.replace(/[^\d.-]/g, "");

      // Handle multiple decimal points (keep only the first one)
      const decimalIndex = cleanValue.indexOf(".");
      if (decimalIndex !== -1) {
        cleanValue =
          cleanValue.substring(0, decimalIndex + 1) +
          cleanValue.substring(decimalIndex + 1).replace(/\./g, "");
      }

      // Handle multiple minus signs (keep only the first one)
      const minusIndex = cleanValue.indexOf("-");
      if (minusIndex !== -1) {
        cleanValue =
          cleanValue.substring(0, minusIndex + 1) +
          cleanValue.substring(minusIndex + 1).replace(/-/g, "");
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
      const date =
        row && row[config.columnMapping[config.dateColumn]]
          ? String(row[config.columnMapping[config.dateColumn]]).trim()
          : "";
      const description =
        row && row[config.columnMapping[config.descriptionColumn]]
          ? String(row[config.columnMapping[config.descriptionColumn]]).trim()
          : "";

      // Only include rows where we have at least a date and description
      if (date && description) {
        const rowData: { [key: string]: string | number } = {
          [config.dateColumn]: date,
          [config.descriptionColumn]: description,
        };

        // Process all other configured columns
        Object.entries(config.columnMapping).forEach(
          ([columnHeader, columnIndex]) => {
            if (
              columnHeader !== config.dateColumn &&
              columnHeader !== config.descriptionColumn
            ) {
              const rawValue =
                row && row[columnIndex] ? String(row[columnIndex]).trim() : "";

              // Convert to number if it looks like a numeric value
              if (rawValue && rawValue !== "") {
                rowData[columnHeader] = convertToNumber(rawValue);
              } else {
                rowData[columnHeader] = "-";
              }
            }
          },
        );

        treasuryActions.push(rowData);
      }
    }

    return {
      rows: treasuryActions,
    };
  };
}
