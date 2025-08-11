"use client";

import React, { useRef } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import { Bar, Bubble, Line, Scatter } from "react-chartjs-2";
import {
  ChartConfiguration,
  GoogleSheetData,
  ResponsiveHeight,
} from "@/config/types";

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
  annotationPlugin,
);

export interface GenericChartProps {
  data: GoogleSheetData;
  config: ChartConfiguration;
  title?: string;
}

// Function to handle responsive heights
function getResponsiveHeightStyles(
  height: number | ResponsiveHeight | undefined,
): {
  style?: React.CSSProperties;
  className?: string;
  cssId?: string;
} {
  if (typeof height === "number") {
    return { style: { height: `${height}px` } };
  }

  if (height && typeof height === "object") {
    // Generate a unique ID for this chart's responsive styles
    const cssId = `chart-${Math.random().toString(36).substr(2, 9)}`;

    return {
      style: { height: `${height.default}px` },
      className: cssId,
      cssId,
    };
  }

  // Default height
  return { style: { height: "500px" } };
}

// Function to generate responsive CSS for a chart
function generateResponsiveCSS(
  height: ResponsiveHeight,
  cssId: string,
): string {
  let css = ``;

  // Base height
  css += `.${cssId} { height: ${height.default}px !important; }`;

  // Responsive breakpoints
  if (height.sm) {
    css += `@media (min-width: 640px) { .${cssId} { height: ${height.sm}px !important; } }`;
  }
  if (height.md) {
    css += `@media (min-width: 768px) { .${cssId} { height: ${height.md}px !important; } }`;
  }
  if (height.lg) {
    css += `@media (min-width: 1024px) { .${cssId} { height: ${height.lg}px !important; } }`;
  }
  if (height.xl) {
    css += `@media (min-width: 1280px) { .${cssId} { height: ${height.xl}px !important; } }`;
  }
  if (height["2xl"]) {
    css += `@media (min-width: 1536px) { .${cssId} { height: ${height["2xl"]}px !important; } }`;
  }

  return css;
}

export const GenericChart: React.FC<GenericChartProps> = ({
  data,
  config,
  title,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

          // Apply filter if specified
          if (datasetConfig.mapping.filter) {
            const filterConfig = datasetConfig.mapping.filter;
            const filterValue = row[filterConfig.column];

            let shouldInclude = true;

            switch (filterConfig.condition) {
              case "nonzero":
                shouldInclude =
                  filterValue !== undefined &&
                  filterValue !== null &&
                  filterValue !== 0 &&
                  filterValue !== "0" &&
                  filterValue !== "";
                break;
              case "zero":
                shouldInclude =
                  filterValue === undefined ||
                  filterValue === null ||
                  filterValue === 0 ||
                  filterValue === "0" ||
                  filterValue === "";
                break;
              case "nonempty":
                shouldInclude =
                  filterValue !== undefined &&
                  filterValue !== null &&
                  filterValue !== "";
                break;
              case "empty":
                shouldInclude =
                  filterValue === undefined ||
                  filterValue === null ||
                  filterValue === "";
                break;
              case "greater":
                shouldInclude =
                  filterConfig.value !== undefined &&
                  Number(filterValue) > Number(filterConfig.value);
                break;
              case "less":
                shouldInclude =
                  filterConfig.value !== undefined &&
                  Number(filterValue) < Number(filterConfig.value);
                break;
              case "equals":
                shouldInclude = filterValue === filterConfig.value;
                break;
              case "custom":
                if (filterConfig.customFunction) {
                  try {
                    // Evaluate custom function (be careful with this in production)
                    const customFn = new Function(
                      "value",
                      "row",
                      filterConfig.customFunction,
                    );
                    shouldInclude = customFn(filterValue, row);
                  } catch (e) {
                    console.warn("Custom filter function failed:", e);
                    shouldInclude = true;
                  }
                }
                break;
            }

            if (!shouldInclude) {
              return null;
            }
          }

          // Find the axis configuration for this dataset
          const yAxis = config.axes?.find(
            (axis) => axis.id === datasetConfig.yAxisID,
          );
          const xAxis = config.axes?.find(
            (axis) => axis.position === "bottom" || axis.position === "top",
          );

          // Handle yPosition for different positioning vs tooltip values
          const yPositionValue = datasetConfig.mapping.yPosition
            ? row[datasetConfig.mapping.yPosition]
            : yValue;

          const dataPoint: {
            x: unknown;
            y: unknown;
            tooltipValue?: unknown;
            sizeValue?: number;
          } = {
            x: processValue(xValue, xAxis?.type),
            y: processValue(yPositionValue, yAxis?.type), // Use yPosition for chart positioning
            tooltipValue: yValue, // Store original y value for tooltip
          };

          // Add point size data if configured
          if (datasetConfig.mapping.pointSize) {
            const sizeValue = row[datasetConfig.mapping.pointSize.column];
            dataPoint.sizeValue = Number(sizeValue) || 0;
          }

          return dataPoint;
        })
        .filter((point) => point !== null);

      // Calculate dynamic point radii if pointSize is configured
      let pointRadii: number[] | number = datasetConfig.pointRadius ?? 4;
      let pointHoverRadii: number[] | number =
        datasetConfig.pointHoverRadius ?? 6;

      if (datasetConfig.mapping.pointSize && mappedData.length > 0) {
        const sizeConfig = datasetConfig.mapping.pointSize;
        const sizeValues = mappedData
          .map((point: { sizeValue?: number }) => point.sizeValue || 0)
          .filter((val) => val > 0);

        if (sizeValues.length > 0) {
          const minValue = Math.min(...sizeValues);
          const maxValue = Math.max(...sizeValues);

          pointRadii = mappedData.map((point: { sizeValue?: number }) => {
            const sizeValue = point.sizeValue || 0;
            if (sizeValue <= 0) return 0; // Hidden point

            let normalizedValue: number;
            if (maxValue === minValue) {
              normalizedValue = 1;
            } else {
              switch (sizeConfig.scale || "linear") {
                case "logarithmic":
                  normalizedValue =
                    (Math.log(sizeValue) - Math.log(minValue)) /
                    (Math.log(maxValue) - Math.log(minValue));
                  break;
                case "sqrt":
                  normalizedValue =
                    (Math.sqrt(sizeValue) - Math.sqrt(minValue)) /
                    (Math.sqrt(maxValue) - Math.sqrt(minValue));
                  break;
                default: // linear
                  normalizedValue =
                    (sizeValue - minValue) / (maxValue - minValue);
              }
            }

            return (
              sizeConfig.minSize +
              normalizedValue * (sizeConfig.maxSize - sizeConfig.minSize)
            );
          });

          pointHoverRadii = (pointRadii as number[]).map(
            (radius) => radius * 1.5,
          );
        }
      }

      const dataset = {
        label: datasetConfig.label,
        data: mappedData,
        borderColor: datasetConfig.borderColor || "#f3991f",
        backgroundColor:
          datasetConfig.backgroundColor || "rgba(243, 153, 31, 0.2)",
        borderDash: datasetConfig.borderDash,
        tension: datasetConfig.tension ?? 0,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        yAxisID: datasetConfig.yAxisID,
        hidden: datasetConfig.hidden,
      };

      // Add additional point styling if configured
      const datasetWithExtras = dataset as Record<string, unknown>;
      if (datasetConfig.pointBorderColor) {
        datasetWithExtras.pointBorderColor = datasetConfig.pointBorderColor;
      }
      if (datasetConfig.pointBorderWidth) {
        datasetWithExtras.pointBorderWidth = datasetConfig.pointBorderWidth;
      }
      if (datasetConfig.showLine === false) {
        datasetWithExtras.showLine = false;
      }

      return datasetWithExtras;
    }),
  };

  // Watermark plugin
  const watermarkPlugin = {
    id: "watermark",
    afterDraw: (chart: ChartJS) => {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      annotation: config.plugins?.annotation || undefined,
      tooltip: {
        enabled: config.plugins?.tooltip?.enabled ?? true,
        boxPadding: 4,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelColor: (context: any) => {
            const dataset = context.dataset;

            // Always use the dataset's configured colors
            return {
              borderColor: dataset.borderColor || "#f3991f",
              backgroundColor: dataset.borderColor || "#f3991f", // Use borderColor for both to ensure consistency
              borderWidth: 2,
            };
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            // Use tooltipValue if available (for purchase amounts), otherwise use chart position value
            const dataPoint = context.dataset.data[context.dataIndex];
            const value =
              dataPoint?.tooltipValue !== undefined
                ? dataPoint.tooltipValue
                : context.parsed.y;
            const metricName = context.dataset.label;

            // Format purchase amounts with BTC suffix and add proper spacing
            if (
              dataPoint?.tooltipValue !== undefined &&
              metricName.includes("Purchase")
            ) {
              return ` ${metricName}: ${typeof value === "number" ? value.toLocaleString() : value} BTC`;
            }

            return ` ${metricName}: ${typeof value === "number" ? value.toLocaleString() : value}`;
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
              maxTicksLimit: axis.ticks.maxTicksLimit,
              stepSize: axis.ticks.stepSize,
              precision: axis.ticks.precision,
              callback: axis.ticks.callback
                ? new Function(
                    "value",
                    `return (${axis.ticks.callback})(value)`,
                  )
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
  }[config.type] as React.ComponentType<{
    data: unknown;
    options: unknown;
    plugins?: unknown[];
    ref?: React.Ref<unknown>;
  }>;

  const showExportButton = config.showExportButton ?? true;
  const heightStyles = getResponsiveHeightStyles(config.height);

  // Generate responsive CSS if needed
  const responsiveCSS =
    heightStyles.cssId && typeof config.height === "object"
      ? generateResponsiveCSS(config.height, heightStyles.cssId)
      : null;

  return (
    <div className="bg-gray-900/50 rounded-lg p-2 md:p-4 mb-6">
      {/* Inject responsive CSS */}
      {responsiveCSS && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
      )}
      <div
        className={`relative mb-6 ${heightStyles.className || ""}`}
        style={heightStyles.style}
      >
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
