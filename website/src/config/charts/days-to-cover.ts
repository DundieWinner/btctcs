import { ChartConfiguration } from "../types";
import {
  pastelBlue,
  pastelGreen,
  pastelPink,
  pastelYellow,
  pastelPurple,
  white,
  whiteGrid,
  bitcoinOrange,
} from "../colors";

export interface DaysToCoverConfig {
  dateColumn: string;
  sharePriceColumn: string;
  mnavBands: Array<{
    column: string;
    level: number;
    label?: string;
    color?: string;
  }>;
  title?: string;
  sharePriceLabel?: string;
  sharePriceAxisTitle?: string;
  trendlines?: {
    enabled: boolean;
    opacity?: number; // Opacity for trendline (default: 0.6)
    dashPattern?: number[]; // Dash pattern for trendlines (default: [5, 5])
  };
  height?:
    | number
    | {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        "2xl"?: number;
      };
}

/**
 * Creates a standardized Days to Cover chart configuration
 * Shows share price and forward mNAV price levels over time
 *
 * @param config.mnavBands - Array of mNAV bands to display, each with column name, level, optional label and color
 * @param config.sharePriceLabel - Optional label for the stock price series (defaults to "Share Price")
 * @param config.sharePriceAxisTitle - Optional title for the stock price axis (defaults to "Share Price")
 * @param config.trendlines - Optional trendline configuration to show trend projections for each mNAV band
 *
 * Note: When trendlines are enabled, the data processor must calculate and include trendline data columns
 * with the naming pattern: `${originalColumn}_trendline` for each mNAV band column.
 */
export function createDaysToCoverChart(
  config: DaysToCoverConfig,
): ChartConfiguration {
  // Default colors for mNAV bands (can be overridden)
  const defaultColors = [
    pastelBlue,
    pastelGreen,
    pastelPink,
    pastelYellow,
    pastelPurple,
  ];

  // Create datasets for mNAV bands
  const mnavDatasets = config.mnavBands.map((band, index) => ({
    label: band.label || `${band.level}x mNAV Price`,
    mapping: {
      x: config.dateColumn,
      y: band.column,
    },
    borderColor: band.color || defaultColors[index % defaultColors.length],
    backgroundColor: band.color || defaultColors[index % defaultColors.length],
    tension: 0,
    pointRadius: 2,
    pointHoverRadius: 4,
    yAxisID: "price",
  }));

  // Create trendline datasets for mNAV bands (if enabled)
  const trendlineDatasets =
    (config.trendlines?.enabled ?? true)
      ? config.mnavBands.map((band, index) => {
          const baseColor =
            band.color || defaultColors[index % defaultColors.length];
          const opacity = config.trendlines?.opacity || 0.6;
          const dashPattern = config.trendlines?.dashPattern || [5, 5];

          // Convert hex color to rgba with opacity for better visual separation
          const trendlineColor = baseColor.startsWith("#")
            ? `${baseColor}${Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0")}`
            : baseColor;

          return {
            label: `${band.label || `${band.level}x mNAV Price`} Trendline`,
            mapping: {
              x: config.dateColumn,
              y: `${band.column}_trendline`,
            },
            borderColor: trendlineColor,
            backgroundColor: "transparent",
            borderDash: dashPattern,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
            yAxisID: "price",
            showLine: true,
            skipLegend: true,
          };
        })
      : [];

  // Share price dataset
  const sharePriceDataset = {
    label: config.sharePriceLabel || "Share Price",
    mapping: {
      x: config.dateColumn,
      y: config.sharePriceColumn,
    },
    borderColor: bitcoinOrange,
    backgroundColor: bitcoinOrange,
    tension: 0,
    pointRadius: 3,
    pointHoverRadius: 5,
    yAxisID: "price",
  };

  return {
    type: "line",
    title: config.title || "Share Price vs mNAV Price Levels",
    height: config.height || {
      default: 400,
      md: 550,
      lg: 650,
    },
    animation: false,
    datasets: [sharePriceDataset, ...mnavDatasets, ...trendlineDatasets],
    axes: [
      {
        id: "x",
        type: "time",
        position: "bottom",
        title: {
          display: true,
          text: "Date",
          color: white,
        },
        grid: {
          color: whiteGrid,
        },
      },
      {
        id: "price",
        type: "logarithmic",
        position: "left",
        title: {
          display: true,
          text: config.sharePriceAxisTitle || "Price (USD)",
          color: bitcoinOrange,
        },
        ticks: {
          color: bitcoinOrange,
          maxTicksLimit: 8,
        },
        grid: {
          color: whiteGrid,
        },
      },
    ],
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
      watermark: {
        enabled: true,
        text: "btctcs.com",
      },
    },
  };
}
