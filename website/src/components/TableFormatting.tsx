import React from "react";
import {
  type CellStyle,
  type ColumnFormat,
  type ConditionalStyle,
} from "@/config/types";

// Helper function to format cell values based on column configuration
export function formatCellValue(
  value: string | number,
  columnKey: string,
  columnFormats?: ColumnFormat[],
): string {
  const format = columnFormats?.find((f) => f.key === columnKey);
  if (!format) {
    return typeof value === "number"
      ? value.toLocaleString()
      : value?.toString() || "-";
  }

  // Handle custom formatter first
  if (format.customFormatter) {
    return format.customFormatter(value);
  }

  let formattedValue = value?.toString() || "-";

  // Handle different data types
  switch (format.type) {
    case "number":
      if (typeof value === "number") {
        const decimals = format.decimals ?? 0;
        const useThousands = format.thousandsSeparator ?? true;
        formattedValue = useThousands
          ? value.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          : value.toFixed(decimals);
      }
      break;

    case "currency":
      if (typeof value === "number") {
        const decimals = format.decimals ?? 2;
        formattedValue = value.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
      break;

    case "percentage":
      if (typeof value === "number") {
        const decimals = format.decimals ?? 1;
        formattedValue = (value * 100).toFixed(decimals) + "%";
      }
      break;

    case "date":
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            formattedValue = format.dateFormat
              ? formatDate(date, format.dateFormat)
              : date.toLocaleDateString();
          }
        } catch {
          // Keep original value if date parsing fails
        }
      }
      break;

    case "text":
    default:
      // Keep as string
      break;
  }

  // Apply prefix and suffix
  if (format.prefix) formattedValue = format.prefix + formattedValue;
  if (format.suffix) formattedValue = formattedValue + format.suffix;

  return formattedValue;
}

// Simple date formatter helper
function formatDate(date: Date, format: string): string {
  const map: { [key: string]: string } = {
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    dd: String(date.getDate()).padStart(2, "0"),
    yyyy: String(date.getFullYear()),
    yy: String(date.getFullYear()).slice(-2),
  };

  return format.replace(/MM|dd|yyyy|yy/g, (match) => map[match] || match);
}

// Helper function to get conditional styles for a cell
export function getConditionalStyles(
  value: string | number,
  columnKey: string,
  conditionalStyles?: ConditionalStyle[],
): React.CSSProperties {
  const styles: React.CSSProperties = {};

  const applicableStyles =
    conditionalStyles?.filter((cs) => cs.key === columnKey) || [];

  for (const conditionalStyle of applicableStyles) {
    let shouldApply = false;

    switch (conditionalStyle.condition) {
      case "positive":
        shouldApply = typeof value === "number" && value > 0;
        break;
      case "negative":
        shouldApply = typeof value === "number" && value < 0;
        break;
      case "zero":
        shouldApply = typeof value === "number" && value === 0;
        break;
      case "custom":
        shouldApply = conditionalStyle.customCondition
          ? conditionalStyle.customCondition(value)
          : false;
        break;
    }

    if (shouldApply) {
      if (conditionalStyle.style.backgroundColor) {
        styles.backgroundColor = conditionalStyle.style.backgroundColor;
      }
      if (conditionalStyle.style.textColor) {
        styles.color = conditionalStyle.style.textColor;
      }
      if (conditionalStyle.style.fontWeight) {
        styles.fontWeight = conditionalStyle.style.fontWeight;
      }
      if (conditionalStyle.style.fontStyle) {
        styles.fontStyle = conditionalStyle.style.fontStyle;
      }
    }
  }

  return styles;
}

// Helper function to get cell-specific styles
export function getCellStyles(
  rowIndex: number,
  columnKey: string,
  cellStyles?: CellStyle[],
): React.CSSProperties {
  const cellStyle = cellStyles?.find(
    (cs) => cs.row === rowIndex && cs.column === columnKey,
  );
  if (!cellStyle) return {};

  const styles: React.CSSProperties = {};
  if (cellStyle.style.backgroundColor)
    styles.backgroundColor = cellStyle.style.backgroundColor;
  if (cellStyle.style.textColor) styles.color = cellStyle.style.textColor;
  if (cellStyle.style.fontWeight)
    styles.fontWeight = cellStyle.style.fontWeight;
  if (cellStyle.style.fontStyle) styles.fontStyle = cellStyle.style.fontStyle;

  return styles;
}
