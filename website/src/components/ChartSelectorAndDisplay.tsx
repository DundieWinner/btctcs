"use client";

import React, { useState } from "react";
import { GenericChart } from "@/components/GenericChart";
import { type ProcessedExtraction } from "@/services/googleSheets";

interface ChartSelectorAndDisplayProps {
  chartExtractions: Array<{
    extraction: ProcessedExtraction;
    config: any;
    chartIndex: number;
  }>;
}

export default function ChartSelectorAndDisplay({
  chartExtractions,
}: ChartSelectorAndDisplayProps) {
  const [selectedChartIndex, setSelectedChartIndex] = useState(0);

  if (chartExtractions.length === 0) {
    return null;
  }

  const selectedChart = chartExtractions[selectedChartIndex];

  return (
    <div className="space-y-4">
      {/* Horizontal Chart Selector */}
      {chartExtractions.length > 1 && (
        <div className="w-full">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
            {chartExtractions.map(
              ({ extraction, config, chartIndex }, index) => {
                const chartTitle =
                  config.title ||
                  `${extraction.title} - Chart ${chartIndex + 1}`;
                const isSelected = index === selectedChartIndex;

                return (
                  <button
                    key={`${extraction.id}-selector-${chartIndex}`}
                    onClick={() => setSelectedChartIndex(index)}
                    className={`
                    flex-shrink-0 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium
                    ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                    }
                  `}
                  >
                    {chartTitle}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Selected Chart Display */}
      <div className="w-full">
        <GenericChart
          key={`${selectedChart.extraction.id}-chart-${selectedChart.chartIndex}`}
          data={selectedChart.extraction.data!}
          config={selectedChart.config}
          title={
            selectedChart.config.title ||
            `${selectedChart.extraction.title} - Chart ${selectedChart.chartIndex + 1}`
          }
        />
      </div>
    </div>
  );
}
