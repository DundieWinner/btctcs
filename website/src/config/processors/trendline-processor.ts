import { GoogleSheetData } from "@/config/types";

export interface TrendlineConfig {
  columns: string[]; // Columns to calculate trendlines for
  projectionMonths: number; // Number of months to project into the future
  dateColumn: string; // Date column name
  minDataPoints?: number; // Minimum data points required for trendline (default: 2)
}

export interface TrendlineProcessorConfig {
  baseProcessor: (
    rangeData: {
      range: string;
      majorDimension: string;
      values?: string[][];
    }[],
  ) => GoogleSheetData; // Base processor to use first
  trendlineConfig: TrendlineConfig;
}

/**
 * Creates a processor that extends a base processor with trendline calculations
 * Calculates linear regression trendlines for specified columns and projects them into the future
 */
export function createTrendlineProcessor(config: TrendlineProcessorConfig) {
  return (
    rangeData: {
      range: string;
      majorDimension: string;
      values?: string[][];
    }[],
  ): GoogleSheetData => {
    // First, use the base processor to get standard data
    const baseData = config.baseProcessor(rangeData);

    // If no data, return early
    if (!baseData.rows || baseData.rows.length === 0) {
      return baseData;
    }

    const {
      columns,
      projectionMonths,
      dateColumn,
      minDataPoints = 2,
    } = config.trendlineConfig;

    // Helper function to calculate exponential regression
    const calculateExponentialRegression = (
      xValues: number[],
      yValues: number[],
    ) => {
      const n = xValues.length;
      if (n < minDataPoints) return { a: 1, b: 0 };

      // Filter out zero or negative values for logarithmic transformation
      const validIndices = yValues
        .map((y, i) => ({ y, x: xValues[i], i }))
        .filter(({ y }) => y > 0);

      if (validIndices.length < minDataPoints) {
        return { a: 1, b: 0 };
      }

      const validX = validIndices.map(({ x }) => x);
      const validY = validIndices.map(({ y }) => y);
      const lnY = validY.map((y) => Math.log(y));

      // Linear regression on ln(y) = ln(a) + b*x
      const sumX = validX.reduce((a, b) => a + b, 0);
      const sumLnY = lnY.reduce((a, b) => a + b, 0);
      const sumXLnY = validX.reduce((sum, x, i) => sum + x * lnY[i], 0);
      const sumXX = validX.reduce((sum, x) => sum + x * x, 0);

      const denominator = validIndices.length * sumXX - sumX * sumX;
      if (denominator === 0)
        return { a: Math.exp(sumLnY / validIndices.length), b: 0 };

      const b = (validIndices.length * sumXLnY - sumX * sumLnY) / denominator;
      const lnA = (sumLnY - b * sumX) / validIndices.length;
      const a = Math.exp(lnA);

      return { a, b };
    };

    // Helper function to parse dates and convert to numeric values
    const parseDate = (dateStr: string): number => {
      const date = new Date(dateStr);
      return date.getTime();
    };

    // Sort data by date to ensure proper trendline calculation
    const sortedRows = [...baseData.rows].sort((a, b) => {
      const dateA = parseDate(String(a[dateColumn]));
      const dateB = parseDate(String(b[dateColumn]));
      return dateA - dateB;
    });

    // Calculate trendlines for each specified column
    const trendlineData: {
      [key: string]: { a: number; b: number };
    } = {};

    columns.forEach((column) => {
      // Get valid data points (non-null, non-zero values)
      const validPoints = sortedRows
        .filter((row) => row[column] && Number(row[column]) > 0)
        .map((row) => ({
          x: parseDate(String(row[dateColumn])),
          y: Number(row[column]),
        }));

      if (validPoints.length >= minDataPoints) {
        const xValues = validPoints.map((p) => p.x);
        const yValues = validPoints.map((p) => p.y);
        trendlineData[column] = calculateExponentialRegression(
          xValues,
          yValues,
        );
      }
    });

    // Generate future dates for projection
    if (sortedRows.length === 0) return baseData;

    const lastDate = new Date(
      String(sortedRows[sortedRows.length - 1][dateColumn]),
    );
    const futureRows: { [key: string]: string | number }[] = [];

    for (let i = 1; i <= projectionMonths; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);

      const futureDateStr = futureDate.toISOString().split("T")[0]; // YYYY-MM-DD format
      const futureDateNum = futureDate.getTime();

      const futureRow: { [key: string]: string | number } = {
        [dateColumn]: futureDateStr,
      };

      // Calculate trendline values for future dates
      columns.forEach((column) => {
        if (trendlineData[column]) {
          const { a, b } = trendlineData[column];
          const trendlineValue = a * Math.exp(b * futureDateNum);
          futureRow[`${column}_trendline`] = Math.max(0, trendlineValue); // Ensure non-negative
        }
      });

      futureRows.push(futureRow);
    }

    // Add trendline values to existing rows (for continuity)
    const enhancedRows = sortedRows.map((row) => {
      const enhancedRow = { ...row };
      const rowDateNum = parseDate(String(row[dateColumn]));

      columns.forEach((column) => {
        if (trendlineData[column]) {
          const { a, b } = trendlineData[column];
          const trendlineValue = a * Math.exp(b * rowDateNum);
          enhancedRow[`${column}_trendline`] = Math.max(0, trendlineValue);
        }
      });

      return enhancedRow;
    });

    // Combine historical data with future projections
    const allRows = [...enhancedRows, ...futureRows];

    return { rows: allRows };
  };
}
