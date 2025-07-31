import React from "react";
import {
  type CellStyle,
  type ColumnFormat,
  type ConditionalStyle,
  type GoogleSheetData,
  type TableStyle,
} from "@/config/types";
import {
  formatCellValue,
  getCellStyles,
  getConditionalStyles,
} from "./TableFormatting";

interface ProcessedExtraction {
  id: string;
  title: string;
  description?: string;
  data?: GoogleSheetData;
  hasHeaders?: boolean;

  // Formatting options
  columnFormats?: ColumnFormat[];
  conditionalStyles?: ConditionalStyle[];
  cellStyles?: CellStyle[];
  tableStyle?: TableStyle;

  // Display options
  maxRows?: number;
  sortBy?: {
    column: string;
    direction: "asc" | "desc";
  };
  hideColumns?: string[];
  columnOrder?: string[];
  columnWidths?: { [key: string]: string };
}

interface DataTableProps {
  extraction: ProcessedExtraction;
}

// Helper function to process and sort data
function processTableData(
  data: GoogleSheetData,
  extraction: ProcessedExtraction,
): { rows: { [key: string]: string | number }[]; columns: string[] } {
  let { rows } = data;

  // Apply sorting if specified
  if (extraction.sortBy) {
    rows = [...rows].sort((a, b) => {
      const aVal = a[extraction.sortBy!.column];
      const bVal = b[extraction.sortBy!.column];

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return extraction.sortBy!.direction === "desc" ? -comparison : comparison;
    });
  }

  // Apply row limit
  if (extraction.maxRows && extraction.maxRows > 0) {
    rows = rows.slice(0, extraction.maxRows);
  }

  // Determine column order
  let columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  // Apply custom column order if specified
  if (extraction.columnOrder) {
    const orderedColumns = extraction.columnOrder.filter((col) =>
      columns.includes(col),
    );
    const remainingColumns = columns.filter(
      (col) => !extraction.columnOrder!.includes(col),
    );
    columns = [...orderedColumns, ...remainingColumns];
  }

  // Filter out hidden columns
  if (extraction.hideColumns) {
    columns = columns.filter((col) => !extraction.hideColumns!.includes(col));
  }

  return { rows, columns };
}

export default function DataTable({ extraction }: DataTableProps) {
  if (!extraction.data) return null;

  const { rows, columns } = processTableData(extraction.data, extraction);

  // Default table styles
  const defaultTableStyle = {
    headerBackgroundColor: "rgb(31, 41, 55)", // bg-gray-800
    headerTextColor: "rgb(209, 213, 219)", // text-gray-300
    rowBackgroundColor: "rgb(3, 7, 18, 0.9)",
    alternateRowBackgroundColor: "rgb(17, 24, 39, 0.5)", // Slightly lighter
    borderColor: "rgb(55, 65, 81)", // border-gray-700
    textColor: "rgb(209, 213, 219)", // text-gray-300
  };

  // Merge with custom table styles
  const tableStyle = { ...defaultTableStyle, ...extraction.tableStyle };

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: tableStyle.rowBackgroundColor,
        borderColor: tableStyle.borderColor,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          {extraction.hasHeaders && rows.length > 0 && (
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: tableStyle.borderColor }}
              >
                {columns.map((header: string) => {
                  const width = extraction.columnWidths?.[header];

                  // Get text alignment from column format for header
                  const columnFormat = extraction.columnFormats?.find(
                    (f) => f.key === header,
                  );
                  const textAlign = columnFormat?.textAlign || "left";

                  return (
                    <th
                      key={header}
                      className="py-1 md:py-2 px-2 font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: tableStyle.headerBackgroundColor,
                        color: tableStyle.headerTextColor,
                        width: width || "auto",
                        textAlign: textAlign,
                      }}
                    >
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map(
              (row: { [key: string]: string | number }, rowIndex: number) => {
                const isAlternateRow = rowIndex % 2 === 1;
                const rowBgColor = isAlternateRow
                  ? tableStyle.alternateRowBackgroundColor
                  : tableStyle.rowBackgroundColor;

                return (
                  <tr
                    key={rowIndex}
                    className="border-b"
                    style={{
                      borderColor: tableStyle.borderColor,
                      backgroundColor: rowBgColor,
                    }}
                  >
                    {columns.map((columnKey: string) => {
                      const value = row[columnKey];
                      const formattedValue = formatCellValue(
                        value,
                        columnKey,
                        extraction.columnFormats,
                      );

                      // Combine all styles: conditional + cell-specific + table default
                      const conditionalStyles = getConditionalStyles(
                        value,
                        columnKey,
                        extraction.conditionalStyles,
                      );
                      const cellStyles = getCellStyles(
                        rowIndex,
                        columnKey,
                        extraction.cellStyles,
                      );
                      const width = extraction.columnWidths?.[columnKey];

                      // Get text alignment from column format
                      const columnFormat = extraction.columnFormats?.find(
                        (f) => f.key === columnKey,
                      );
                      const textAlign = columnFormat?.textAlign || "left";

                      const combinedStyles = {
                        ...conditionalStyles,
                        ...cellStyles,
                        color:
                          conditionalStyles.color ||
                          cellStyles.color ||
                          tableStyle.textColor,
                        backgroundColor:
                          conditionalStyles.backgroundColor ||
                          cellStyles.backgroundColor ||
                          rowBgColor,
                        fontWeight:
                          conditionalStyles.fontWeight ||
                          cellStyles.fontWeight ||
                          "normal",
                        fontStyle:
                          conditionalStyles.fontStyle ||
                          cellStyles.fontStyle ||
                          "normal",
                        width: width || "auto",
                        textAlign: textAlign,
                      };

                      return (
                        <td
                          key={columnKey}
                          className="py-1 px-2 whitespace-nowrap"
                          style={combinedStyles}
                        >
                          {formattedValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
