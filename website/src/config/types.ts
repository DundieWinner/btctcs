export interface Curator {
  name: string;
  github: string;
  x?: string; // Optional X handle
}

// Google Sheets data types
export interface GoogleSheetData {
  rows: { [key: string]: string | number }[];
}

// Column formatting configuration
export interface ColumnFormat {
  key: string; // Column key to apply formatting to
  type?: "number" | "currency" | "percentage" | "date" | "text"; // Data type formatting
  decimals?: number; // Number of decimal places for numbers
  prefix?: string; // Text to prepend (e.g., "$" for currency)
  suffix?: string; // Text to append (e.g., "%" for percentage)
  thousandsSeparator?: boolean; // Whether to use thousands separator (default: true for numbers)
  dateFormat?: string; // Date format string (e.g., "MM/dd/yyyy")
  customFormatter?: (value: string | number) => string; // Custom formatting function
  textAlign?: "left" | "center" | "right"; // Text alignment for the column
}

// Conditional styling configuration
export interface ConditionalStyle {
  key: string; // Column key to apply conditional styling to
  condition: "positive" | "negative" | "zero" | "custom"; // Condition type
  customCondition?: (value: string | number) => boolean; // Custom condition function
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
  };
}

// Cell-level styling override
export interface CellStyle {
  row: number; // Row index (0-based)
  column: string; // Column key
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
  };
}

// Table styling configuration
export interface TableStyle {
  headerBackgroundColor?: string;
  headerTextColor?: string;
  rowBackgroundColor?: string;
  alternateRowBackgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export interface GoogleSheetExtraction {
  id: string; // Unique identifier for this extraction
  title: string; // Display title for this data section
  description?: string; // Optional description shown below title
  spreadsheetId: string;
  ranges: string[]; // Array of ranges to fetch in a single batchGet call
  processor?: (
    rangeData: {
      range: string;
      majorDimension: string;
      values?: string[][];
    }[],
  ) => GoogleSheetData;
  renderLocation?: "sidebar" | "top" | "bottom"; // Where to render this extraction, defaults to "top"
  hasHeaders?: boolean;
  
  // Advanced formatting options
  columnFormats?: ColumnFormat[]; // Custom formatting for specific columns
  conditionalStyles?: ConditionalStyle[]; // Conditional styling based on cell values
  cellStyles?: CellStyle[]; // Individual cell style overrides
  tableStyle?: TableStyle; // Overall table styling
  
  // Display options
  maxRows?: number; // Maximum number of rows to display
  sortBy?: {
    column: string;
    direction: "asc" | "desc";
  }; // Default sorting
  hideColumns?: string[]; // Columns to hide from display
  columnOrder?: string[]; // Custom column order
  columnWidths?: { [key: string]: string }; // Custom column widths (CSS values)
}

export interface GoogleSheetConfig {
  extractions: GoogleSheetExtraction[]; // Support multiple spreadsheet extractions
}

export interface Company {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  description?: string;
  curators: Curator[];
  googleSheet?: GoogleSheetConfig; // Optional Google Sheets integration
}
