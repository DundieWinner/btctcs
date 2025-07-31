import { ChartConfiguration } from '../types';
import {
  bitcoinOrange,
  bitcoinOrangeLight,
  white,
  whiteGrid,
} from '../colors';

export interface BitcoinAcquisitionsConfig {
  dateColumn: string;
  priceColumn: string;
  purchaseColumn: string;
  title?: string;
  height?: number | {
    default: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
}

/**
 * Creates a standardized Bitcoin acquisitions chart configuration
 * Shows Bitcoin price history with purchase events overlaid as scatter points
 */
export function createBitcoinAcquisitionsChart(config: BitcoinAcquisitionsConfig): ChartConfiguration {
  return {
    type: "line",
    title: config.title || "Bitcoin Acquisitions",
    height: config.height || {
      default: 400,
      md: 550,
      lg: 650,
    },
    animation: false,
    datasets: [
      {
        label: "Bitcoin Price (USD)",
        mapping: { x: config.dateColumn, y: config.priceColumn },
        borderColor: bitcoinOrange,
        backgroundColor: bitcoinOrange,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: "btcPrice",
      },
      {
        label: "BTC Purchase",
        mapping: { 
          x: config.dateColumn, 
          y: config.purchaseColumn,
          yPosition: config.priceColumn, 
          filter: {
            column: config.purchaseColumn,
            condition: "nonzero"
          },
          pointSize: {
            column: config.purchaseColumn,
            minSize: 8,
            maxSize: 20,
            scale: "sqrt"
          }
        },
        borderColor: bitcoinOrange,
        backgroundColor: bitcoinOrangeLight,
        pointBackgroundColor: bitcoinOrange,
        pointBorderColor: bitcoinOrange,
        pointBorderWidth: 2,
        showLine: false,
        yAxisID: "btcPrice",
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
        id: "btcPrice",
        type: "logarithmic",
        position: "left",
        title: {
          display: true,
          text: "Bitcoin Price (USD)",
          color: bitcoinOrange,
        },
        ticks: {
          color: bitcoinOrange,
          callback: "(value) => '$' + value.toLocaleString()",
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