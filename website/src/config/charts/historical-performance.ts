import { ChartConfiguration } from "../types";
import {
  bitcoinOrange,
  bitcoinOrangeMedium,
  emeraldGreen,
  emeraldGreenMedium,
  white,
  whiteGrid,
  whiteMedium,
} from "../colors";

export interface HistoricalPerformanceConfig {
  dateColumn: string;
  primarySatsColumn: string;
  secondarySatsColumn: string;
  sharePriceColumn: string;
  mnavColumn: string;
  primarySatsLabel: string;
  secondarySatsLabel: string;
  sharePriceLabel?: string;
  sharePriceAxisTitle?: string;
  mnavLabel: string;
  title?: string;
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
 * Creates a standardized historical performance chart configuration
 * Shows sats per share, share price, and mNAV metrics over time with multiple axes
 * 
 * @param config.sharePriceLabel - Optional label for the stock price series (defaults to "Share Price (USD)")
 * @param config.sharePriceAxisTitle - Optional title for the stock price axis (defaults to "Share Price (USD)")
 */
export function createHistoricalPerformanceChart(
  config: HistoricalPerformanceConfig,
): ChartConfiguration {
  return {
    type: "line",
    title: config.title || "Historical Performance",
    height: config.height || {
      default: 350,
      md: 500,
    },
    animation: false,
    datasets: [
      {
        label: config.primarySatsLabel,
        mapping: {
          x: config.dateColumn,
          y: config.primarySatsColumn,
        },
        borderColor: bitcoinOrange,
        backgroundColor: bitcoinOrangeMedium,
        tension: 0,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: "sats",
      },
      {
        label: config.secondarySatsLabel,
        mapping: {
          x: config.dateColumn,
          y: config.secondarySatsColumn,
        },
        borderColor: "#f9cc8f",
        backgroundColor: "#f9cc8f",
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 3,
        pointHoverRadius: 7,
        yAxisID: "sats",
      },
      {
        label: config.sharePriceLabel || "Share Price (USD)",
        mapping: {
          x: config.dateColumn,
          y: config.sharePriceColumn,
        },
        borderColor: white,
        backgroundColor: whiteMedium,
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "price",
      },
      {
        label: config.mnavLabel,
        mapping: {
          x: config.dateColumn,
          y: config.mnavColumn,
        },
        borderColor: emeraldGreen,
        backgroundColor: emeraldGreenMedium,
        borderDash: [10, 5],
        tension: 0,
        pointRadius: 2,
        pointHoverRadius: 4,
        yAxisID: "mnav",
      },
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
        id: "sats",
        type: "logarithmic",
        position: "left",
        title: {
          display: true,
          text: "Sats",
          color: bitcoinOrange,
        },
        ticks: {
          color: bitcoinOrange,
        },
        grid: {
          color: whiteGrid,
        },
      },
      {
        id: "price",
        type: "logarithmic",
        position: "right",
        title: {
          display: true,
          text: config.sharePriceAxisTitle || "Share Price (USD)",
          color: white,
        },
        ticks: {
          color: white,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      {
        id: "mnav",
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "mNAV",
          color: emeraldGreen,
        },
        ticks: {
          color: emeraldGreen,
        },
        grid: {
          drawOnChartArea: false,
        },
        offset: true,
        beginAtZero: true,
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
