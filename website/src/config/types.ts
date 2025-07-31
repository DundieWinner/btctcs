export interface Curator {
  name: string;
  github: string;
  x?: string; // Optional X handle
}

// Google Sheets data types
export interface GoogleSheetData {
  rows: { [key: string]: string | number }[];
}

// Key statistic for prominent display on company dashboard
export interface KeyStatistic {
  id: string; // Unique identifier for this statistic
  label: string; // Display label (e.g., "BTC Holdings")
  value: string | number; // The statistic value (e.g., "628.22" or 628.22)
  unit?: string; // Optional unit (e.g., "BTC", "$", "%")
  prefix?: string; // Optional prefix (e.g., "$" for currency)
  suffix?: string; // Optional suffix (e.g., "%" for percentage)
  description?: string; // Optional description/credit text
  link?: {
    url: string;
    text?: string; // Link text, defaults to description if not provided
    external?: boolean; // Whether link opens in new tab (default: true)
  };
  order?: number; // Display order (lower numbers first, defaults to 0)
  style?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string; // Color for the value text
  };
}

// Result from a processor that can include both table data and key statistics
export interface ProcessorResult {
  data?: GoogleSheetData; // Table data (optional)
  keyStatistics?: KeyStatistic[]; // Key statistics for dashboard display (optional)
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

// Chart configuration interfaces
export interface ChartDataMapping {
  x: string; // Column name for X-axis data
  y: string; // Column name for Y-axis data
  label?: string; // Optional label override for this dataset
}

export interface ChartDataset {
  label: string; // Dataset label
  mapping: ChartDataMapping; // How to map data columns
  borderColor?: string; // Line/border color
  backgroundColor?: string; // Fill/background color
  borderDash?: number[]; // Dash pattern for lines
  tension?: number; // Line tension (0 = straight lines)
  pointRadius?: number; // Point size
  pointHoverRadius?: number; // Point size on hover
  yAxisID?: string; // Which Y-axis to use
  hidden?: boolean; // Start hidden
}

export interface ChartAxis {
  id: string; // Unique axis ID
  type: "linear" | "logarithmic" | "time" | "category"; // Axis type
  position: "left" | "right" | "top" | "bottom"; // Axis position
  title?: {
    display: boolean;
    text: string;
    color?: string;
  };
  ticks?: {
    color?: string;
    callback?: string; // Function name for custom formatting
  };
  grid?: {
    display?: boolean;
    color?: string;
    drawOnChartArea?: boolean;
  };
  beginAtZero?: boolean;
  offset?: boolean;
}

// Responsive height configuration
export interface ResponsiveHeight {
  default: number; // Default height in pixels
  sm?: number; // Small screens (640px+)
  md?: number; // Medium screens (768px+)
  lg?: number; // Large screens (1024px+)
  xl?: number; // Extra large screens (1280px+)
  "2xl"?: number; // 2X large screens (1536px+)
}

export interface ChartConfiguration {
  type: "line" | "bar" | "scatter" | "bubble"; // Chart type
  title?: string; // Chart title (overrides extraction title)
  datasets: ChartDataset[]; // Dataset configurations
  axes?: ChartAxis[]; // Custom axis configurations
  height?: number | ResponsiveHeight; // Chart height in pixels (default: 500) or responsive configuration
  showExportButton?: boolean; // Show export button (default: true)
  animation?: boolean; // Enable animations (default: false)
  responsive?: boolean; // Responsive sizing (default: true)
  maintainAspectRatio?: boolean; // Maintain aspect ratio (default: false)
  plugins?: {
    legend?: {
      display?: boolean;
      position?: "top" | "bottom" | "left" | "right";
    };
    tooltip?: {
      enabled?: boolean;
    };
    watermark?: {
      enabled?: boolean;
      text?: string;
    };
  };
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
  ) => GoogleSheetData | ProcessorResult;
  renderLocation?: "sidebar" | "top" | "bottom" | "none"; // Where to render this extraction, defaults to "top". Use "none" for chart-only extractions
  charts?: ChartConfiguration[]; // Custom chart configurations for this extraction (supports multiple charts)
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
  disclosure?: string;
  curators: Curator[];
  googleSheet?: GoogleSheetConfig; // Optional Google Sheets integration
}
