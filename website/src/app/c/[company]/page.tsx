import Link from "next/link";
import Image from "next/image";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ImageBoard from "@/components/ImageGallery";
import { companies, getCompanyById } from "@/config/companies";
import {
  type GoogleSheetData,
  type GoogleSheetExtraction,
  type ColumnFormat,
  type ConditionalStyle,
  type CellStyle,
  type TableStyle,
  type KeyStatistic,
  type ProcessorResult,
} from "@/config/types";
import { baseUrl } from "@/config/environment";
import {
  googleSheetsApiKey,
  s3AccessKey,
  s3Secret,
} from "@/config/environment-be";

// Processed extraction result
interface ProcessedExtraction {
  id: string;
  title: string;
  description?: string;
  data?: GoogleSheetData; // Now optional since processor might only return keyStatistics
  keyStatistics?: KeyStatistic[]; // Key statistics for dashboard display
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

// Revalidate this page every 10 minutes (600 seconds)
export const revalidate = 600;

// Helper function to format cell values based on column configuration
function formatCellValue(
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
        } catch (e) {
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
function getConditionalStyles(
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
function getCellStyles(
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

// Helper function to render Google Sheets data sections
// Component to render key statistics cards
function renderKeyStatistics(keyStatistics: KeyStatistic[]) {
  if (!keyStatistics || keyStatistics.length === 0) return null;

  // Sort by order (lower numbers first), then by id for consistency
  const sortedStats = [...keyStatistics].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {sortedStats.map((stat) => {
        const defaultStyle = {
          backgroundColor: "rgb(3, 7, 18, 0.9)",
          textColor: "rgb(209, 213, 219)",
          accentColor: "rgb(249, 115, 22)", // Orange accent
        };
        
        const style = { ...defaultStyle, ...stat.style };
        
        // Format the value with prefix/suffix/unit
        let displayValue = stat.value.toString();
        if (stat.prefix) displayValue = stat.prefix + displayValue;
        if (stat.suffix) displayValue = displayValue + stat.suffix;
        if (stat.unit && !stat.suffix) displayValue = displayValue + " " + stat.unit;

        return (
          <div
            key={stat.id}
            className="rounded-lg border border-gray-700 p-6"
            style={{ backgroundColor: style.backgroundColor }}
          >
            <div className="text-sm font-medium mb-2" style={{ color: style.textColor }}>
              {stat.label}
            </div>
            <div 
              className="text-3xl font-bold mb-2" 
              style={{ color: style.accentColor }}
            >
              {displayValue}
            </div>
            {stat.description && (
              <div className="text-xs" style={{ color: style.textColor }}>
                {stat.link ? (
                  <a
                    href={stat.link.url}
                    target={stat.link.external !== false ? "_blank" : "_self"}
                    rel={stat.link.external !== false ? "noopener noreferrer" : undefined}
                    className="text-orange-500 hover:text-orange-400 underline transition-colors"
                  >
                    {stat.link.text || stat.description}
                  </a>
                ) : (
                  stat.description
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderGoogleSheetsData(
  extractions: ProcessedExtraction[],
  className?: string,
) {
  if (extractions.length === 0) return null;

  return (
    <div className={`space-y-8 ${className || ""}`}>
      {extractions.map((extraction) => {
        // Only process table data if extraction has data
        const tableData = extraction.data ? processTableData(extraction.data, extraction) : null;
        const { rows, columns } = tableData || { rows: [], columns: [] };

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
            {extraction.data && (
              <div
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: tableStyle.rowBackgroundColor,
                  borderColor: tableStyle.borderColor,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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
                                className="px-2 py-2 font-semibold whitespace-nowrap"
                                style={{
                                  backgroundColor:
                                    tableStyle.headerBackgroundColor,
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
                        (
                          row: { [key: string]: string | number },
                          rowIndex: number,
                        ) => {
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
                                const width =
                                  extraction.columnWidths?.[columnKey];

                                // Get text alignment from column format
                                const columnFormat =
                                  extraction.columnFormats?.find(
                                    (f) => f.key === columnKey,
                                  );
                                const textAlign =
                                  columnFormat?.textAlign || "left";

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
                                    className="px-2 py-2 whitespace-nowrap"
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
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CompanyPageProps {
  params: Promise<{
    company: string;
  }>;
}

// Generate metadata for each company page
export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { company } = await params;
  const companyData = getCompanyById(company);

  // Fetch the first image for the feature image
  let featureImage: string | undefined;
  try {
    const images = await fetchCompanyImages(company);
    featureImage = images.length > 0 ? images[0] : undefined;
  } catch (error) {
    console.error("Error fetching images for metadata:", error);
    featureImage = undefined;
  }

  if (!companyData) {
    const baseMetadata = {
      title: `${company.toUpperCase()} - BTCTCs`,
      description: `Bitcoin treasury charts and data for ${company.toUpperCase()}`,
    };

    if (featureImage) {
      return {
        ...baseMetadata,
        openGraph: {
          ...baseMetadata,
          type: "website",
          siteName: "BTCTCs",
          url: `${baseUrl}/c/${company}`,
          images: [{ url: featureImage }],
        },
        twitter: {
          card: "summary_large_image",
          ...baseMetadata,
          images: [featureImage],
        },
      };
    }

    return baseMetadata;
  }

  const curatorNames = companyData.curators.map((c) => c.name).join(", ");
  const title = `${companyData.emoji} ${companyData.name} - BTCTCs`;
  const description = `Bitcoin treasury charts and analytics for ${companyData.name}. ${companyData.description || ""} Curated by ${curatorNames}.`;

  const baseMetadata = {
    title,
    description,
    keywords: [
      "bitcoin",
      "treasury",
      "charts",
      "analytics",
      companyData.name.toLowerCase(),
      "btc",
      "cryptocurrency",
      "corporate treasury",
    ],
  };

  if (featureImage) {
    return {
      ...baseMetadata,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "BTCTCs",
        url: `${baseUrl}/c/${company}`,
        images: [{ url: featureImage }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [featureImage],
      },
    };
  }

  return {
    ...baseMetadata,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "BTCTCs",
      url: `${baseUrl}/c/${company}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Configure S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "nyc3",
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3Secret,
  },
});

// Function to fetch images from DigitalOcean Spaces
const fetchCompanyImages = async (companyId: string): Promise<string[]> => {
  const baseUrl = "https://btctcs.nyc3.cdn.digitaloceanspaces.com";

  try {
    const command = new ListObjectsV2Command({
      Bucket: "btctcs",
      Prefix: `charts/${companyId}/`,
      MaxKeys: 100,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      console.log(`No objects found for company: ${companyId}`);
      return [];
    }

    // Filter for image files and create full URLs
    const imageUrls = response.Contents.filter((obj) => {
      const key = obj.Key || "";
      return (
        key.match(/\.(png|jpg|jpeg|gif|webp)$/i) && obj.Size && obj.Size > 0
      );
    })
      .map((obj) => `${baseUrl}/${obj.Key}`)
      .sort(); // Sort alphabetically

    console.log(`Found ${imageUrls.length} images for company: ${companyId}`);
    return imageUrls;
  } catch (error) {
    console.error("Error fetching images from S3:", error);

    // If S3 credentials are not configured, return placeholder images
    if (!s3AccessKey || !s3Secret) {
      console.warn(
        "DigitalOcean Spaces credentials not configured. Using placeholder images.",
      );
      return [
        `https://via.placeholder.com/400x300/1f2937/f97316?text=${companyId.toUpperCase()}+Chart+1`,
        `https://via.placeholder.com/400x300/1f2937/f97316?text=${companyId.toUpperCase()}+Chart+2`,
        `https://via.placeholder.com/400x300/1f2937/f97316?text=${companyId.toUpperCase()}+Chart+3`,
      ];
    }

    throw error;
  }
};

// Function to fetch multiple ranges from a single Google Sheet using batchGet
async function fetchGoogleSheetDataBatch(
  spreadsheetId: string,
  ranges: string[],
): Promise<
  {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[]
> {
  try {
    // Build the batchGet URL with multiple ranges
    const rangeParams = ranges
      .map((range) => `ranges=${encodeURIComponent(range)}`)
      .join("&");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangeParams}&key=${googleSheetsApiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    } as RequestInit & { next: { revalidate: number } });

    if (!response.ok) {
      console.error(
        `Google Sheets batchGet API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const batchResponse: {
      spreadsheetId: string;
      valueRanges: {
        range: string;
        majorDimension: string;
        values?: string[][];
      }[];
    } = await response.json();

    // Return valueRanges as-is from the fetch
    return batchResponse.valueRanges;
  } catch (error) {
    console.error("Error fetching Google Sheet batch data:", error);
    return [];
  }
}

// Function to process multiple Google Sheet extractions using batchGet
async function processGoogleSheetExtractions(
  extractions: GoogleSheetExtraction[],
): Promise<ProcessedExtraction[]> {
  if (extractions.length === 0) {
    return [];
  }

  const results: ProcessedExtraction[] = [];

  // Process each extraction individually (each extraction = one batchGet call)
  for (const extraction of extractions) {
    try {
      // Fetch all ranges for this extraction in a single batchGet call
      const batchData = await fetchGoogleSheetDataBatch(
        extraction.spreadsheetId,
        extraction.ranges,
      );

      // Apply processor if provided, otherwise use the first range data
      let processedData: GoogleSheetData | undefined;
      let keyStatistics: KeyStatistic[] | undefined;
      
      if (extraction.processor) {
        const result = extraction.processor(batchData);
        
        // Handle both old (GoogleSheetData) and new (ProcessorResult) return types
        if ('rows' in result) {
          // Old format: direct GoogleSheetData
          processedData = result;
        } else {
          // New format: ProcessorResult
          processedData = result.data;
          keyStatistics = result.keyStatistics;
        }
      } else {
        // Default behavior: use first range data if no processor
        const firstRangeData = batchData[0];
        if (!firstRangeData || !firstRangeData.values) {
          processedData = { rows: [] };
        } else {
          // Convert raw valueRange to GoogleSheetData format
          const rows: { [key: string]: string | number }[] = [];
          for (let i = 0; i < firstRangeData.values.length; i++) {
            const row: { [key: string]: string | number } = {};
            const rowData = firstRangeData.values[i];

            rowData.forEach((value: string, index: number) => {
              // Try to convert to number if it looks like a number
              const numValue = parseFloat(value);
              row[`col_${index}`] =
                !isNaN(numValue) && value !== "" ? numValue : value;
            });

            rows.push(row);
          }
          processedData = { rows };
        }
      }

      results.push({
        id: extraction.id,
        title: extraction.title,
        description: extraction.description,
        data: processedData,
        keyStatistics: keyStatistics,
        hasHeaders: extraction.hasHeaders,

        // Pass through all formatting options
        columnFormats: extraction.columnFormats,
        conditionalStyles: extraction.conditionalStyles,
        cellStyles: extraction.cellStyles,
        tableStyle: extraction.tableStyle,

        // Pass through display options
        maxRows: extraction.maxRows,
        sortBy: extraction.sortBy,
        hideColumns: extraction.hideColumns,
        columnOrder: extraction.columnOrder,
        columnWidths: extraction.columnWidths,
      });
    } catch (error) {
      console.error(`Error processing extraction ${extraction.id}:`, error);
    }
  }

  return results;
}

// Loading component
function LoadingDashboard({ companyName }: { companyName: string }) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: "rgb(249, 115, 22)" }}
            ></div>
            <p className="text-gray-300">Loading {companyName} dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main dashboard component
async function CompanyDashboard({ company }: { company: string }) {
  const companyData = getCompanyById(company);
  const companyName = companyData?.name || company;

  try {
    // Fetch both S3 images and Google Sheets data
    const images = await fetchCompanyImages(company);

    // Check if this company has Google Sheets configuration
    let extractedData: ProcessedExtraction[] = [];

    if (companyData?.googleSheet?.extractions) {
      extractedData = await processGoogleSheetExtractions(
        companyData.googleSheet.extractions,
      );
    }

    // Separate extractions by render location
    const topExtractions = extractedData.filter((extraction) => {
      const config = companyData?.googleSheet?.extractions.find(
        (e) => e.id === extraction.id,
      );
      return !config?.renderLocation || config.renderLocation === "top";
    });

    const sidebarExtractions = extractedData.filter((extraction) => {
      const config = companyData?.googleSheet?.extractions.find(
        (e) => e.id === extraction.id,
      );
      return config?.renderLocation === "sidebar";
    });

    const bottomExtractions = extractedData.filter((extraction) => {
      const config = companyData?.googleSheet?.extractions.find(
        (e) => e.id === extraction.id,
      );
      return config?.renderLocation === "bottom";
    });

    return (
      <div className="min-h-screen p-3 sm:py-8">
        <div className="max-w-[115rem] mx-auto px-2 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <nav className="flex items-center space-x-2 text-md text-gray-400">
                <Link
                  href="/"
                  className="hover:text-orange-500 transition-colors"
                >
                  Home
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-gray-300 font-medium">
                  {companyData?.emoji} {companyName}
                </span>
              </nav>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-6xl font-bold"
              style={{ color: "rgb(249, 115, 22)" }}
            >
              {companyData?.emoji} {companyName}
            </h1>
          </header>

          {/* Key Statistics from all extractions */}
          {(() => {
            // Collect all key statistics from all extractions
            const allKeyStatistics: KeyStatistic[] = [];
            extractedData.forEach((extraction) => {
              if (extraction.keyStatistics) {
                allKeyStatistics.push(...extraction.keyStatistics);
              }
            });
            
            return allKeyStatistics.length > 0 ? renderKeyStatistics(allKeyStatistics) : null;
          })()}

          {/* Top Google Sheets Data */}
          {topExtractions.length > 0 && (
            <div className="mb-6 sm:mb-8">
              {renderGoogleSheetsData(topExtractions)}
            </div>
          )}

          {/* Main Content Area with Responsive Layout */}
          <div
            className={
              "flex flex-col xl:flex-row gap-6 lg:gap-8"
            }
          >
            {/* Main Content */}
            <div className={"flex-1"}>
              {/* Images Swiper */}
              <ImageBoard images={images} companyName={companyName} />
            </div>

            {/* Sidebar - Responsive */}
            <div className="w-full xl:w-96 2xl:w-130 flex-shrink-0 flex flex-col gap-6">
              {sidebarExtractions.length > 0 &&
                renderGoogleSheetsData(sidebarExtractions)}
              {/* Curators */}
              {companyData?.curators && companyData.curators.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="text-gray-400 text-sm items-center">
                    Curators:
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {companyData.curators.map((curator, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-gray-300">{curator.name}</span>
                        <div className="flex gap-1">
                          <Link
                            href={`https://github.com/${curator.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                            title={`${curator.name} on GitHub`}
                          >
                            GitHub
                          </Link>
                          {curator.x && (
                            <>
                              <span className="text-gray-500">•</span>
                              <Link
                                href={`https://x.com/${curator.x}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-500 hover:text-orange-400 transition-colors"
                                title={`${curator.name} on X`}
                              >
                                X
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Google Sheets Data */}
          {bottomExtractions.length > 0 && (
            <div className="mt-6 sm:mt-8">
              {renderGoogleSheetsData(bottomExtractions)}
            </div>
          )}

          {/* Company Navigation Grid */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-800">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-2">
                Explore Other Companies
              </h2>
              <p className="text-gray-400">
                Navigate to other Bitcoin treasury companies
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies
                  .filter((c) => c.id !== company)
                  .map((company) => (
                    <li key={company.id}>
                      <Link
                        href={`/c/${company.id}`}
                        className="flex items-center p-4 rounded-lg border border-gray-700 hover:border-orange-500 hover:bg-gray-800/30 transition-all duration-200 group"
                        style={{ backgroundColor: "rgb(3, 7, 18, 0.5)" }}
                      >
                        <span className="mr-3 text-2xl group-hover:scale-110 transition-transform duration-200">
                          {company.emoji}
                        </span>
                        <div className="flex-1">
                          <span className="text-lg text-gray-300 group-hover:text-orange-500 transition-colors duration-200">
                            {company.name}
                          </span>
                          {company.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {company.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CompanyDashboard:", error);

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: "rgb(249, 115, 22)" }}
            >
              Error Loading Dashboard
            </h1>
            <p className="text-red-400 mb-4">
              Failed to load images for {companyName}. Please check your S3
              configuration.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors hover:bg-orange-600"
              style={{ backgroundColor: "rgb(249, 115, 22)", color: "white" }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { company } = await params;
  const companyName = company.toUpperCase();

  return (
    <>
      <Suspense fallback={<LoadingDashboard companyName={companyName} />}>
        <CompanyDashboard company={company} />
      </Suspense>
      <Footer />
    </>
  );
}
