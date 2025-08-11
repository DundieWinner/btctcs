import { ChartConfiguration } from "../types";
import {
  bitcoinOrange,
  emeraldGreen,
  pastelBlue,
  pastelGreen,
  white,
  whiteGrid,
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
  title?:
    | string
    | {
        satsAndPrice?: string;
        mnavAndPrice?: string;
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
 * Creates standardized historical performance chart configurations
 * Returns two separate charts:
 * 1. Sats per share metrics and share price over time
 * 2. mNAV and share price over time
 *
 * @param config.sharePriceLabel - Optional label for the stock price series (defaults to "Share Price (USD)")
 * @param config.sharePriceAxisTitle - Optional title for the stock price axis (defaults to "Share Price (USD)")
 */
export function createHistoricalPerformanceCharts(
  config: HistoricalPerformanceConfig,
): ChartConfiguration[] {
  // Chart 1: Sats per share metrics and share price
  const satsAndPriceChart: ChartConfiguration = {
    type: "line",
    title:
      typeof config.title === "string"
        ? `${config.title} - Sats per Share`
        : config.title?.satsAndPrice || "Sats per Share",
    height: config.height || {
      default: 400,
      md: 550,
      lg: 650,
    },
    animation: false,
    datasets: [
      {
        label: config.primarySatsLabel,
        mapping: {
          x: config.dateColumn,
          y: config.primarySatsColumn,
        },
        borderColor: pastelBlue,
        backgroundColor: pastelBlue,
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "sats",
      },
      {
        label: config.secondarySatsLabel,
        mapping: {
          x: config.dateColumn,
          y: config.secondarySatsColumn,
        },
        borderColor: pastelGreen,
        backgroundColor: pastelGreen,
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "sats",
      },
      {
        label: config.sharePriceLabel || "Share Price (USD)",
        mapping: {
          x: config.dateColumn,
          y: config.sharePriceColumn,
        },
        borderColor: bitcoinOrange,
        backgroundColor: bitcoinOrange,
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "price",
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
      {
        id: "price",
        type: "logarithmic",
        position: "right",
        title: {
          display: true,
          text: config.sharePriceAxisTitle || "USD",
          color: bitcoinOrange,
        },
        ticks: {
          color: bitcoinOrange,
          maxTicksLimit: 8,
        },
        grid: {
          drawOnChartArea: false,
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

  // Chart 2: mNAV and share price
  const mnavAndPriceChart: ChartConfiguration = {
    type: "line",
    title:
      typeof config.title === "string"
        ? `${config.title} - mNAV vs Share Price`
        : config.title?.mnavAndPrice || "mNAV vs Share Price",
    height: config.height || {
      default: 400,
      md: 550,
      lg: 650,
    },
    animation: false,
    datasets: [
      {
        label: config.mnavLabel,
        mapping: {
          x: config.dateColumn,
          y: config.mnavColumn,
        },
        borderColor: emeraldGreen,
        backgroundColor: emeraldGreen,
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "mnav",
      },
      {
        label: config.sharePriceLabel || "Share Price (USD)",
        mapping: {
          x: config.dateColumn,
          y: config.sharePriceColumn,
        },
        borderColor: bitcoinOrange,
        backgroundColor: bitcoinOrange,
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "price",
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
        id: "mnav",
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "mNAV",
          color: emeraldGreen,
        },
        ticks: {
          color: emeraldGreen,
          maxTicksLimit: 8,
        },
        grid: {
          color: whiteGrid,
        },
        beginAtZero: true,
      },
      {
        id: "price",
        type: "logarithmic",
        position: "right",
        title: {
          display: true,
          text: config.sharePriceAxisTitle || "USD",
          color: bitcoinOrange,
        },
        ticks: {
          color: bitcoinOrange,
          maxTicksLimit: 8,
        },
        grid: {
          drawOnChartArea: false,
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
      annotation: {
        annotations: {
          mnavReference: {
            type: "line",
            yMin: 1,
            yMax: 1,
            borderColor: emeraldGreen,
            borderWidth: 1,
            borderDash: [3, 3],
          },
        },
      },
    },
  };

  return [satsAndPriceChart, mnavAndPriceChart];
}
