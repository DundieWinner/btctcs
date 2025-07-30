import React from "react";
import DataTable from "./DataTable";
import {
  type CellStyle,
  type ColumnFormat,
  type ConditionalStyle,
  type GoogleSheetData,
  type KeyStatistic,
  type TableStyle,
} from "@/config/types";

interface ProcessedExtraction {
  id: string;
  title: string;
  description?: string;
  data?: GoogleSheetData;
  keyStatistics?: KeyStatistic[];
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

interface GoogleSheetsSectionProps {
  extractions: ProcessedExtraction[];
  className?: string;
}

export default function GoogleSheetsSection({
  extractions,
  className,
}: GoogleSheetsSectionProps) {
  if (extractions.length === 0) return null;

  return (
    <div className={`space-y-8 ${className || ""}`}>
      {extractions.map((extraction) => (
        <div key={extraction.id} className="">
          <div className="mb-4">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "rgb(249, 115, 22)" }}
            >
              {extraction.title}
            </h2>
            {extraction.description && (
              <p
                className="text-gray-400 text-sm [&_a]:text-orange-500 [&_a]:underline [&_a:hover]:text-orange-400 [&_a]:transition-colors"
                dangerouslySetInnerHTML={{ __html: extraction.description }}
              />
            )}
          </div>

          {/* Render table data if available */}
          <DataTable extraction={extraction} />
        </div>
      ))}
    </div>
  );
}
