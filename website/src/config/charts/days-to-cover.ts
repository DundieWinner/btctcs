import { ChartConfiguration } from "../types";
import {
  bitcoinOrange,
  emeraldGreen,
  emeraldGreen600,
  emeraldGreen700,
  emeraldGreen800,
  emeraldGreen900,
  white,
  whiteGrid,
  whiteMedium,
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
 */
export function createDaysToCoverChart(
  config: DaysToCoverConfig,
): ChartConfiguration {
  // Default colors for mNAV bands (can be overridden)
  const defaultColors = [
    emeraldGreen,
    emeraldGreen600,
    emeraldGreen700,
    emeraldGreen800,
    emeraldGreen900,
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

  // Share price dataset
  const sharePriceDataset = {
    label: config.sharePriceLabel || "Share Price",
    mapping: {
      x: config.dateColumn,
      y: config.sharePriceColumn,
    },
    borderColor: bitcoinOrange,
    backgroundColor: bitcoinOrange,
    borderDash: [5, 5], // Dotted line to distinguish from mNAV bands
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
    datasets: [
      sharePriceDataset,
      ...mnavDatasets,
    ],
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
          color: white,
        },
        ticks: {
          color: white,
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
