"use client";

import React, { useRef } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line, Bar, Scatter, Bubble } from "react-chartjs-2";
import { ChartConfiguration, GoogleSheetData } from "@/config/types";

// Register Chart.js components
ChartJS.register(
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export interface GenericChartProps {
  data: GoogleSheetData;
  config: ChartConfiguration;
  title?: string;
}

export const GenericChart: React.FC<GenericChartProps> = ({
  data,
  config,
  title,
}) => {

  const chartRef = useRef<any>(null);

  // Function to parse date strings correctly
  const parseDate = (dateString: string) => {
    // Handle various date formats
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    }
    // Fallback to regular Date parsing
    return new Date(dateString);
  };

  // Function to process data value based on axis type
  const processValue = (value: string | number, axisType?: string) => {
    if (axisType === "time") {
      return parseDate(String(value));
    }
    return typeof value === "number" ? value : Number(value) || 0;
  };



  // Prepare datasets for Chart.js
  const chartData = {
    datasets: config.datasets.map((datasetConfig) => {
      const mappedData = data.rows
        .map((row) => {
          const xValue = row[datasetConfig.mapping.x];
          const yValue = row[datasetConfig.mapping.y];

          if (xValue === undefined || yValue === undefined) {
            return null;
          }

          // Find the axis configuration for this dataset
          const yAxis = config.axes?.find(
            (axis) => axis.id === datasetConfig.yAxisID,
          );
          const xAxis = config.axes?.find(
            (axis) => axis.position === "bottom" || axis.position === "top",
          );

          return {
            x: processValue(xValue, xAxis?.type),
            y: processValue(yValue, yAxis?.type),
          };
        })
        .filter((point) => point !== null);

      return {
        label: datasetConfig.label,
        data: mappedData,
        borderColor: datasetConfig.borderColor || "#f3991f",
        backgroundColor:
          datasetConfig.backgroundColor || "rgba(243, 153, 31, 0.2)",
        borderDash: datasetConfig.borderDash,
        tension: datasetConfig.tension ?? 0,
        pointRadius: datasetConfig.pointRadius ?? 4,
        pointHoverRadius: datasetConfig.pointHoverRadius ?? 6,
        yAxisID: datasetConfig.yAxisID,
        hidden: datasetConfig.hidden,
      };
    }),
  };

  // Watermark plugin
  const watermarkPlugin = {
    id: "watermark",
    afterDraw: (chart: any) => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        return;
      }

      if (!config.plugins?.watermark?.enabled) return;

      const ctx = chart.ctx;
      const chartArea = chart.chartArea;

      ctx.save();
      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      const text = config.plugins.watermark.text || "btctcs.com";
      const padding = 8;
      ctx.fillText(text, chartArea.right - padding, chartArea.bottom - padding);

      ctx.restore();
    },
  };

  // Build Chart.js options from configuration
  const options: ChartOptions<any> = {
    responsive: config.responsive ?? true,
    maintainAspectRatio: config.maintainAspectRatio ?? false,
    color: "#ffffff",
    animation: {
      duration: config.animation ? 750 : 0,
    },
    plugins: {
      legend: {
        display: config.plugins?.legend?.display ?? true,
        position: config.plugins?.legend?.position ?? "top",
        labels: {
          color: "#ffffff",
          usePointStyle: true,
          padding: 20,
        },
        onClick: (e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex!;
          const chart = legend.chart;
          const dataset = config.datasets[index];

          if (chart.isDatasetVisible(index)) {
            chart.hide(index);
            legendItem.hidden = true;
            // Hide corresponding y-axis if specified
            if (
              dataset?.yAxisID &&
              chart.options.scales &&
              chart.options.scales[dataset.yAxisID]
            ) {
              chart.options.scales[dataset.yAxisID].display = false;
            }
          } else {
            chart.show(index);
            legendItem.hidden = false;
            // Show corresponding y-axis if specified
            if (
              dataset?.yAxisID &&
              chart.options.scales &&
              chart.options.scales[dataset.yAxisID]
            ) {
              chart.options.scales[dataset.yAxisID].display = true;
            }
          }

          chart.update();
        },
      },
      title: {
        display: !!(config.title || title),
        text: config.title || title || "",
        color: "#ffffff",
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: config.plugins?.tooltip?.enabled ?? true,
        callbacks: {
          title: (tooltipItems: any[]) => {
            const item = tooltipItems[0];
            const xAxis = config.axes?.find(
              (axis) => axis.position === "bottom" || axis.position === "top",
            );

            if (xAxis?.type === "time") {
              const date = new Date(item.parsed.x);
              const year = date.getUTCFullYear();
              const month = String(date.getUTCMonth() + 1).padStart(2, "0");
              const day = String(date.getUTCDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }

            return String(item.parsed.x);
          },
          label: (context: any) => {
            const value = context.parsed.y;
            const metricName = context.dataset.label;
            return `${metricName}: ${typeof value === "number" ? value.toLocaleString() : value}`;
          },
        },
      },
    },
    scales: {},
  };

  // Add axis configurations
  if (config.axes) {
    config.axes.forEach((axis) => {
      options.scales![axis.id] = {
        type: axis.type,
        position: axis.position,
        title: axis.title
          ? {
              display: axis.title.display,
              text: axis.title.text,
              color: axis.title.color || "#ffffff",
            }
          : undefined,
        ticks: axis.ticks
          ? {
              color: axis.ticks.color || "#ffffff",
              callback: axis.ticks.callback
                ? new Function("value", `return ${axis.ticks.callback}(value)`)
                : undefined,
            }
          : {
              color: "#ffffff",
            },
        grid: {
          display: axis.grid?.display ?? true,
          color: axis.grid?.color || "rgba(255, 255, 255, 0.1)",
          drawOnChartArea: axis.grid?.drawOnChartArea ?? true,
        },
        beginAtZero: axis.beginAtZero,
        offset: axis.offset,
      };

      // Special handling for time axes
      if (axis.type === "time") {
        options.scales![axis.id] = {
          ...options.scales![axis.id],
          time: {
            unit: "day",
            displayFormats: {
              day: "MMM d",
            },
            parser: "yyyy-MM-dd",
            isoWeekday: true,
          },
          adapters: {
            date: {
              zone: "UTC",
            },
          },
        };
      }
    });
  }

  // Function to export chart as PNG
  const exportChartAsPNG = () => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const canvas = chart.canvas;

      const bgColor = "#1a1a1a";
      const newCanvas = document.createElement("canvas");
      const newCtx = newCanvas.getContext("2d");
      if (!newCtx) return;

      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;

      newCtx.fillStyle = bgColor;
      newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
      newCtx.drawImage(canvas, 0, 0);

      const url = newCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${(config.title || title || "chart").toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = url;
      link.click();
    }
  };

  // Select the appropriate chart component
  const ChartComponent = {
    line: Line,
    bar: Bar,
    scatter: Scatter,
    bubble: Bubble,
  }[config.type];

  const showExportButton = config.showExportButton ?? true;
  const height = config.height ?? 500;

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
      <div className="relative mb-6" style={{ height: `${height}px` }}>
        {/* Export Icon Button */}
        {showExportButton && (
          <div className="absolute top-0 right-0 z-10 hidden md:block">
            <button
              onClick={exportChartAsPNG}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Export as PNG"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="text-orange-500"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
            </button>
          </div>
        )}
        <ChartComponent
          ref={chartRef}
          data={chartData}
          options={options}
          plugins={config.plugins?.watermark?.enabled ? [watermarkPlugin] : []}
        />
      </div>


    </div>
  );
};
