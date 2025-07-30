import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
  TimeSeriesScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  TimeScale,
  TimeSeriesScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export interface Announcement {
  date: string;
  type: string;
  btcHeld: number;
  sharesOutstanding: number;
  gbpHeld?: number;
}

export interface PriceHistoryRecord {
  date: string;
  sharePrice: number;
  bitcoinPrice: number;
}

export interface CompanyPerformanceChartProps {
  announcements: Announcement[];
  priceHistory: PriceHistoryRecord[];
}

export const CompanyPerformanceChart: React.FC<CompanyPerformanceChartProps> = ({
  announcements,
  priceHistory,
}) => {
  const [showTable, setShowTable] = React.useState(false);
  const chartRef = useRef<any>(null);

  // Filter to only BTC purchase announcements
  const btcPurchaseAnnouncements = announcements
    .filter((announcement) => announcement.type === 'btc-purchase')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Sats Per Share for each announcement
  const calculateSatsPerShare = (btcHeld: number, sharesOutstanding: number) => {
    const totalSats = btcHeld * 100000000;
    return Math.round(sharesOutstanding > 0 ? totalSats / sharesOutstanding : 0);
  };

  // Function to parse date strings correctly
  const parseDate = (dateString: string) => {
    // Parse the date and ensure it's treated as UTC
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  // Function to get Bitcoin price for a given date
  const getBitcoinPriceForDate = (date: string) => {
    const priceRecord = priceHistory.find((record) => record.date === date);
    return priceRecord ? priceRecord.bitcoinPrice : 77800; // fallback price
  };

  // Helper function to get the most recent announcement data for a given date
  const getAnnouncementDataForDate = (targetDate: string) => {
    // Find the most recent announcement on or before the target date
    const sortedAnnouncements = btcPurchaseAnnouncements
      .filter((announcement) => announcement.date <= targetDate)
      .sort((a, b) => b.date.localeCompare(a.date));

    return sortedAnnouncements[0] || null;
  };

  // Helper function to get the most recent GBP balance for a given date
  const getGbpBalanceForDate = (targetDate: string) => {
    // Find the most recent announcement with GBP balance on or before the target date
    const sortedAnnouncements = btcPurchaseAnnouncements
      .filter(
        (announcement) =>
          announcement.date <= targetDate && announcement.gbpHeld !== undefined,
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    return sortedAnnouncements[0]?.gbpHeld || 0;
  };

  // Calculate adjusted mNAV for a given date using price history data
  const calculateAdjustedMNAVForDate = (priceRecord: PriceHistoryRecord) => {
    const announcementData = getAnnouncementDataForDate(priceRecord.date);
    if (!announcementData) return null;

    // Use shares outstanding from the most recent announcement for this date
    // This ensures we use the correct shares outstanding value for each day
    const sharesOutstanding = announcementData.sharesOutstanding;

    // Use GBP balance from the most recent announcement available for this date
    const gbpBalance = getGbpBalanceForDate(priceRecord.date);

    const marketCap = (priceRecord.sharePrice * sharesOutstanding) / 100; // Convert pence to pounds
    const bitcoinValueInGBP = announcementData.btcHeld * priceRecord.bitcoinPrice;
    const adjustedMNAV = marketCap / (bitcoinValueInGBP + gbpBalance);
    return adjustedMNAV;
  };

  // Prepare data for the chart
  const chartData = {
    datasets: [
      {
        label: 'Sats Per Share',
        data: btcPurchaseAnnouncements.map((a) => ({
          x: parseDate(a.date),
          y: calculateSatsPerShare(a.btcHeld, a.sharesOutstanding),
        })),
        borderColor: '#f3991f',
        backgroundColor: 'rgba(243, 153, 31, 0.2)',
        tension: 0, // Set to 0 for straight lines
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y',
      },
      {
        label: 'Share Price (pence)',
        data: priceHistory.map((record) => ({
          x: parseDate(record.date),
          y: record.sharePrice,
        })),
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderDash: [5, 5],
        tension: 0, // Set to 0 for straight lines
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
      {
        label: 'Adjusted mNAV',
        data: priceHistory
          .map((record) => {
            const adjustedMNAV = calculateAdjustedMNAVForDate(record);
            return adjustedMNAV !== null
              ? {
                  x: parseDate(record.date),
                  y: adjustedMNAV,
                }
              : null;
          })
          .filter((point): point is { x: Date; y: number } => point !== null),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderDash: [10, 5],
        tension: 0, // Set to 0 for straight lines
        pointRadius: 2, // Smaller points since there are more data points
        pointHoverRadius: 4,
        yAxisID: 'y2',
      },
    ],
  };

  // Watermark plugin for chart area (hidden on mobile)
  const watermarkPlugin = {
    id: 'watermark',
    afterDraw: (chart: any) => {
      // Skip watermark on mobile devices (screen width < 768px)
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return;
      }

      const ctx = chart.ctx;
      const chartArea = chart.chartArea;

      ctx.save();
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const text = 'btctcs.com';
      const padding = 8;
      ctx.fillText(text, chartArea.right - padding, chartArea.bottom - padding);

      ctx.restore();
    },
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#ffffff', // Set default text color to white
    animation: {
      duration: 0, // Disable all animations
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff', // Legend text color
          usePointStyle: true,
          padding: 20,
        },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.datasetIndex!;
          const chart = legend.chart;

          // Map dataset index to y-axis ID
          const yAxisMap = {
            0: 'y', // Sats Per Share
            1: 'y1', // Share Price
            2: 'y2', // Adjusted mNAV
          };

          const yAxisId = yAxisMap[index as keyof typeof yAxisMap];

          if (chart.isDatasetVisible(index)) {
            chart.hide(index);
            legendItem.hidden = true;
            // Hide corresponding y-axis
            if (yAxisId && chart.options.scales && chart.options.scales[yAxisId]) {
              chart.options.scales[yAxisId].display = false;
            }
          } else {
            chart.show(index);
            legendItem.hidden = false;
            // Show corresponding y-axis
            if (yAxisId && chart.options.scales && chart.options.scales[yAxisId]) {
              chart.options.scales[yAxisId].display = true;
            }
          }

          chart.update();
        },
      },
      title: {
        display: true,
        text: 'Company Performance Metrics',
        color: '#ffffff', // Title text color
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            // Format the date correctly in the tooltip
            const item = tooltipItems[0];
            const date = new Date(item.parsed.x);

            // Format as YYYY-MM-DD to match the original data format
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
          },
          label: (context) => {
            const value = context.parsed.y;
            const metricName = context.dataset.label;
            if (metricName === 'Adjusted mNAV') {
              return `${metricName}: ${value.toFixed(2)}x`;
            }
            return `${metricName}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'logarithmic',
        position: 'left',
        title: {
          display: true,
          text: 'Satoshis Per Share',
          color: '#f3991f',
        },
        ticks: {
          color: '#f3991f',
          callback: function (value) {
            return value.toLocaleString();
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y1: {
        type: 'logarithmic',
        position: 'right',
        title: {
          display: true,
          text: 'Share Price (pence)',
          color: '#ffffff',
        },
        ticks: {
          color: '#ffffff',
          callback: function (value) {
            return value.toLocaleString();
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Adjusted mNAV (x)',
          color: '#10b981',
        },
        ticks: {
          color: '#10b981',
          callback: function (value) {
            return Math.round(Number(value)) + 'x';
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        offset: true,
      },
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d',
          },
          parser: 'yyyy-MM-dd',
          isoWeekday: true,
        },
        adapters: {
          date: {
            zone: 'UTC', // Force UTC timezone
          },
        },
        title: {
          display: true,
          text: 'Date',
          color: '#ffffff',
        },
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // Prepare table data by combining all chart data points
  const tableData = priceHistory
    .map((priceRecord) => {
      const announcementData = getAnnouncementDataForDate(priceRecord.date);

      // If no announcement data is available for this date, we can't calculate metrics
      if (!announcementData) {
        return {
          date: priceRecord.date,
          sharePrice: priceRecord.sharePrice,
          sharesOutstanding: null,
          marketCap: null,
          btcHeld: null,
          bitcoinPrice: priceRecord.bitcoinPrice,
          bitcoinValue: null,
          gbpBalance: 0,
          navValue: null,
          adjustedMNAV: null,
          satsPerShare: null,
          hasAnnouncementData: false,
        };
      }

      // Use the shares outstanding from the most recent announcement for this date
      const sharesOutstanding = announcementData.sharesOutstanding;

      const adjustedMNAV = calculateAdjustedMNAVForDate(priceRecord);
      const satsPerShare = calculateSatsPerShare(
        announcementData.btcHeld,
        sharesOutstanding,
      );

      // Get the GBP balance for this specific date
      const gbpBalance = getGbpBalanceForDate(priceRecord.date);

      // Calculate all constituent pieces using the correct shares outstanding for this date
      const marketCap = (priceRecord.sharePrice * sharesOutstanding) / 100; // Convert pence to pounds
      const bitcoinValue = announcementData.btcHeld * priceRecord.bitcoinPrice;
      const navValue = bitcoinValue + gbpBalance;

      return {
        date: priceRecord.date,
        sharePrice: priceRecord.sharePrice,
        sharesOutstanding: sharesOutstanding,
        marketCap,
        btcHeld: announcementData.btcHeld,
        bitcoinPrice: priceRecord.bitcoinPrice,
        bitcoinValue,
        gbpBalance,
        navValue,
        adjustedMNAV,
        satsPerShare,
        hasAnnouncementData: true,
      };
    })
    .reverse(); // Show most recent first

  // Format GBP values with shorthand
  const formatGBP = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) {
      return `£${(value / 1_000_000).toFixed(2)}M`;
    } else if (absValue >= 1_000) {
      return `£${(value / 1_000).toFixed(1)}K`;
    }
    return `£${value.toLocaleString()}`;
  };

  // Function to export chart as PNG with background color
  const exportChartAsPNG = () => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const canvas = chart.canvas;

      // Get the background color from CSS variable or use fallback
      const bgColor = '#1a1a1a'; // fallback color

      // Create a new canvas with background
      const newCanvas = document.createElement('canvas');
      const newCtx = newCanvas.getContext('2d');
      if (!newCtx) return;

      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;

      // Fill the background
      newCtx.fillStyle = bgColor;
      newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);

      // Draw the chart on top
      newCtx.drawImage(canvas, 0, 0);

      // Create download link
      const url = newCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'company-performance-chart.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className='bg-gray-900/50 rounded-lg p-4 mb-6'>
      <div className='relative h-[500px] mb-6'>
        {/* Export Icon Button - hidden on mobile */}
        <div className='absolute top-0 right-0 z-10 hidden md:block'>
          <button
            onClick={exportChartAsPNG}
            className='p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors'
            title='Export as PNG'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              fill='currentColor'
              viewBox='0 0 16 16'
              className='text-orange-500'
            >
              <path d='M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z' />
              <path d='M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z' />
            </svg>
          </button>
        </div>
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
          plugins={[watermarkPlugin]}
        />
      </div>

      {/* Toggle Button */}
      <div className='mb-4 text-center'>
        <button
          onClick={() => setShowTable(!showTable)}
          className='w-full md:w-auto px-4 py-2 text-sm font-medium text-orange-500 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors'
        >
          {showTable ? 'Hide Chart Data' : 'Show Chart Data'}
        </button>
      </div>

      {/* Data Table */}
      {showTable && (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-gray-900/50 rounded-lg overflow-hidden'>
            <thead className='bg-gray-800 text-left'>
              <tr>
                <th className='px-4 py-3 text-sm font-medium whitespace-nowrap'>Date</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>
                  Share Price (p)
                </th>
                <th className='px-4 py-3 text-sm font-medium text-right'>
                  Shares Outstanding
                </th>
                <th className='px-4 py-3 text-sm font-medium text-right'>Market Cap</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>BTC Held</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>BTC Price</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>BTC Value</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>GBP Balance</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>NAV Value</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>Adj mNAV</th>
                <th className='px-4 py-3 text-sm font-medium text-right'>Sats/Share</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-800'>
              {tableData.map((row, index) => (
                <tr
                  key={row.date}
                  className='hover:bg-gray-800 transition-colors'
                >
                  <td className='px-4 py-3 text-sm whitespace-nowrap'>{row.date}</td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {row.sharePrice.toFixed(2)}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {row.sharesOutstanding != null
                      ? row.sharesOutstanding.toLocaleString()
                      : '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {row.marketCap ? formatGBP(row.marketCap) : '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {row.btcHeld ? row.btcHeld.toFixed(4) : '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    £{row.bitcoinPrice.toLocaleString()}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {row.bitcoinValue ? formatGBP(row.bitcoinValue) : '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {formatGBP(row.gbpBalance)}
                  </td>
                  <td className='px-4 py-3 text-sm text-right'>
                    {row.navValue ? formatGBP(row.navValue) : '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-right text-emerald-500 font-semibold'>
                    {row.adjustedMNAV ? `${row.adjustedMNAV.toFixed(2)}x` : '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-right text-orange-500'>
                    {row.satsPerShare ? row.satsPerShare.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
