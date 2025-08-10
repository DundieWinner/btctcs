import { KeyStatistic, ProcessorResult } from "../types";
import { btctcsOrange } from "../colors";

const TABLE_COLUMNS = {
  METRIC: "Metric",
  VALUE: "Value",
} as const;

// Configuration interface for key statistics
export interface KeyStatConfig {
  metricName: string;
  id: string;
  label: string;
  order: number;
  unit?: string;
  prefix?: string;
  description?: string; // Optional description for information icon
}

// Configuration interface for individual metrics in a combined statistic
export interface CombinedMetricComponent {
  metricName: string;
  required?: boolean; // Default: true
  prefix?: string; // Optional prefix for this specific metric
  format?: "shorthand" | "number" | "percentage"; // Optional formatting
  description?: string; // Optional description for information icon
}

// Configuration interface for combined metrics (generalized)
export interface CombinedMetricConfig {
  id: string;
  label: string;
  order: number;
  metrics: CombinedMetricComponent[];
  separator?: string; // Default: " / "
  description?: string; // Optional description for information icon
  style?: {
    accentColor?: string;
  };
}

// Legacy interface for backward compatibility
export interface CombinedMnavConfig {
  basicMetricName: string;
  dilutedMetricName?: string;
  forwardMetricName: string;
  id: string;
  label: string;
  order: number;
}

// Configuration interface for the processor
export interface CompanyStatsConfig {
  keyStatistics: KeyStatConfig[];
  combinedMetrics?: CombinedMetricConfig[];
  combinedMnav?: CombinedMnavConfig; // Legacy support
}

/**
 * Creates a configurable processor for company stats from BTCTCS community sheet
 * Handles data where column D contains metric names and column E contains values
 */
export function createCompanyStatsProcessor(config: CompanyStatsConfig) {
  return function companyStatsProcessor(
    rangeData: {
      range: string;
      majorDimension: string;
      values?: string[][];
    }[],
  ): ProcessorResult {
    const statsRange = rangeData[0]; // Single range with D and E columns

    if (!statsRange || !statsRange.values) {
      return { data: { rows: [] } };
    }

    // Process the data where column D (index 0) is metric names and column E (index 1) is values
    const pairedRows: { [key: string]: string | number }[] = [];

    for (let i = 0; i < statsRange.values.length; i++) {
      const row = statsRange.values[i];

      // Column D (index 0) = metric name, Column E (index 1) = value
      const metric = row && row[0] ? String(row[0]).trim() : "";
      const value = row && row[1] ? String(row[1]).trim() : "";

      // Only include rows where both metric and value are non-empty
      if (metric && value) {
        pairedRows.push({
          [TABLE_COLUMNS.METRIC]: metric,
          [TABLE_COLUMNS.VALUE]: value,
        });
      }
    }

    // Helper function to extract and format key statistics
    const extractKeyStatistic = (
      metricName: string,
      id: string,
      label: string,
      order: number,
      unit?: string,
      prefix?: string,
      description?: string,
    ): KeyStatistic | null => {
      const row = pairedRows.find(
        (row) => row[TABLE_COLUMNS.METRIC] === metricName,
      );
      if (row) {
        let value = row[TABLE_COLUMNS.VALUE];
        // Clean up common prefixes from the value
        if (typeof value === "string") {
          value = value
            .replace(/^[$£€¥]/, "")
            .replace(/^CAD\s*/, "")
            .replace(/^USD\s*/, "");
        }

        const displayValue = prefix ? `${prefix}${value}` : value;
        const finalValue = unit ? `${displayValue} ${unit}` : displayValue;

        return {
          id,
          label,
          value: finalValue,
          order,
          ...(description && { description }),
        };
      }
      return null;
    };

    // Extract configured key statistics
    const keyStatistics: KeyStatistic[] = [];

    // Add individual key statistics
    for (const statConfig of config.keyStatistics) {
      const stat = extractKeyStatistic(
        statConfig.metricName,
        statConfig.id,
        statConfig.label,
        statConfig.order,
        statConfig.unit,
        statConfig.prefix,
        statConfig.description,
      );
      if (stat) keyStatistics.push(stat);
    }

    // Helper function to clean currency prefixes
    const cleanCurrencyValue = (
      value: string | number | null | undefined,
    ): string | null => {
      if (!value) return null;
      const stringValue = typeof value === "number" ? value.toString() : value;
      if (typeof stringValue !== "string") return null;
      return stringValue
        .replace(/^[$£€¥]\s*/, "")
        .replace(/^CAD\s*/, "")
        .replace(/^USD\s*/, "")
        .replace(/^GBP\s*/, "")
        .trim();
    };

    // Helper function to format numbers as shorthand (e.g., 26,118,527 -> 26.1M)
    const formatValue = (
      value: string | null,
      format?: string,
    ): string | null => {
      if (!value || !format) return value;

      // Remove commas and convert to number
      const cleanValue = value.replace(/,/g, "");
      const numValue = parseFloat(cleanValue);

      if (isNaN(numValue)) return value;

      switch (format) {
        case "shorthand":
          if (numValue >= 1_000_000_000) {
            return (numValue / 1_000_000_000).toFixed(1) + "B";
          } else if (numValue >= 1_000_000) {
            return (numValue / 1_000_000).toFixed(1) + "M";
          } else if (numValue >= 1_000) {
            return (numValue / 1_000).toFixed(1) + "K";
          }
          return numValue.toString();
        case "percentage":
          return numValue.toFixed(1) + "%";
        case "number":
        default:
          return value;
      }
    };

    // Add generalized combined metrics
    if (config.combinedMetrics) {
      for (const combinedConfig of config.combinedMetrics) {
        const metricRows: Array<{
          value: string | number | null;
          required: boolean;
        }> = [];
        let allRequiredPresent = true;

        // Find all metric rows for this combined metric
        for (const metricComponent of combinedConfig.metrics) {
          const row = pairedRows.find(
            (row) => row[TABLE_COLUMNS.METRIC] === metricComponent.metricName,
          );
          const isRequired = metricComponent.required !== false; // Default to true
          const value = row ? row[TABLE_COLUMNS.VALUE] : null;

          metricRows.push({ value, required: isRequired });

          // Check if required metric is missing
          if (isRequired && !value) {
            allRequiredPresent = false;
          }
        }

        // Only create combined metric if all required components are present
        if (allRequiredPresent) {
          const separator = combinedConfig.separator || " / ";
          const formattedValues = metricRows
            .map(({ value }, index) => {
              const cleanedValue = cleanCurrencyValue(value);
              if (cleanedValue === null) return null;

              const metricComponent = combinedConfig.metrics[index];
              const formattedValue = formatValue(
                cleanedValue,
                metricComponent.format,
              );
              const prefix = metricComponent.prefix || "";

              return prefix + (formattedValue || cleanedValue);
            })
            .filter((value) => value !== null);

          if (formattedValues.length > 0) {
            keyStatistics.push({
              id: combinedConfig.id,
              label: combinedConfig.label,
              value: formattedValues.join(separator),
              order: combinedConfig.order,
              style: combinedConfig.style || {
                accentColor: btctcsOrange,
              },
              ...(combinedConfig.description && {
                description: combinedConfig.description,
              }),
            });
          }
        }
      }
    }

    // Legacy: Add combined mNAV statistic if configured (backward compatibility)
    if (config.combinedMnav) {
      const basicMnavRow = pairedRows.find(
        (row) =>
          row[TABLE_COLUMNS.METRIC] === config.combinedMnav!.basicMetricName,
      );
      const dilutedMnavRow = config.combinedMnav.dilutedMetricName
        ? pairedRows.find(
            (row) =>
              row[TABLE_COLUMNS.METRIC] ===
              config.combinedMnav!.dilutedMetricName,
          )
        : null;
      const forwardMnavRow = pairedRows.find(
        (row) =>
          row[TABLE_COLUMNS.METRIC] === config.combinedMnav!.forwardMetricName,
      );

      // Require basic and forward, diluted is optional
      if (basicMnavRow && forwardMnavRow) {
        const basicValue = cleanCurrencyValue(
          basicMnavRow[TABLE_COLUMNS.VALUE],
        );
        const dilutedValue = dilutedMnavRow
          ? cleanCurrencyValue(dilutedMnavRow[TABLE_COLUMNS.VALUE])
          : null;
        const forwardValue = cleanCurrencyValue(
          forwardMnavRow[TABLE_COLUMNS.VALUE],
        );

        // Build display value based on available metrics
        const displayValue = dilutedValue
          ? `${basicValue} / ${dilutedValue} / ${forwardValue}`
          : `${basicValue} / ${forwardValue}`;

        keyStatistics.push({
          id: config.combinedMnav.id,
          label: config.combinedMnav.label,
          value: displayValue,
          order: config.combinedMnav.order,
          style: {
            accentColor: btctcsOrange,
          },
        });
      }
    }

    // Sort key statistics by order
    keyStatistics.sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      data: {
        rows: pairedRows,
      },
      keyStatistics,
    };
  };
}
