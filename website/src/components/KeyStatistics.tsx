"use client";

import { KeyStatistic } from "@/config/types";
import { useState } from "react";
import { HiInformationCircle } from "react-icons/hi2";
import { btctcsOrange, darkBackground, grayText } from "@/config/colors";

interface KeyStatisticsProps {
  keyStatistics: KeyStatistic[];
}

export default function KeyStatistics({ keyStatistics }: KeyStatisticsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  if (!keyStatistics || keyStatistics.length === 0) return null;

  const openDialog = (title: string, description: string) => {
    setDialogContent({ title, description });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogContent(null);
  };

  // Sort by order (lower numbers first), then by id for consistency
  const sortedStats = [...keyStatistics].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-4 mb-8">
        {sortedStats.map((stat) => {
          const defaultStyle = {
            backgroundColor: darkBackground,
            textColor: grayText,
            accentColor: btctcsOrange, // Orange accent
          };

          const style = { ...defaultStyle, ...stat.style };

          // Format the value with prefix/suffix/unit
          let displayValue = stat.value.toString();
          if (stat.prefix) displayValue = stat.prefix + displayValue;
          if (stat.suffix) displayValue = displayValue + stat.suffix;
          if (stat.unit && !stat.suffix)
            displayValue = displayValue + " " + stat.unit;

          return (
            <div
              key={stat.id}
              className="rounded-lg border border-gray-700 px-3 md:px-4 py-2 md:py-3"
              style={{ backgroundColor: style.backgroundColor }}
            >
              <div className="grid grid-cols-1 gap-2 relative">
                <div
                  className="text-sm font-medium"
                  style={{ color: style.textColor }}
                >
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="absolute top-0 right-0">
                    {/* Mobile: Clickable info icon */}
                    <button
                      className="md:hidden text-gray-400 hover:text-gray-300 transition-colors p-1"
                      onClick={() => openDialog(stat.label, stat.description!)}
                      aria-label={`Information about ${stat.label}`}
                    >
                      <HiInformationCircle className="w-4 h-4" />
                    </button>

                    {/* Desktop: Hover popover */}
                    <div
                      className="hidden md:block text-gray-400 hover:text-gray-300 transition-colors p-1 cursor-help"
                      onMouseEnter={() => setHoveredStat(stat.id)}
                      onMouseLeave={() => setHoveredStat(null)}
                    >
                      <HiInformationCircle className="w-4 h-4" />

                      {/* Popover */}
                      {hoveredStat === stat.id && (
                        <div className="absolute right-0 top-6 z-50 w-64 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                          <div className="text-xs font-medium text-gray-200 mb-1">
                            {stat.label}
                          </div>
                          <div className="text-xs text-gray-300 leading-relaxed">
                            {stat.description}
                          </div>
                          {/* Arrow pointing up */}
                          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 border-l border-t border-gray-600 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`text-xl md:text-2xl xl:text-3xl font-bold`}
                style={{ color: style.accentColor }}
              >
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Dialog */}
      {dialogOpen && dialogContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeDialog}
          />

          {/* Dialog Content */}
          <div className="relative bg-gray-900 rounded-xl border border-gray-700 max-w-sm w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {dialogContent.title}
              </h3>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                aria-label="Close dialog"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {dialogContent.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
