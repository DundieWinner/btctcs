# Custom Chart Configuration Guide

This guide explains how to configure Google Sheets extractions to display custom Chart.js charts on company dashboards using JSON configuration.

## Overview

The dashboard can display fully customizable Chart.js charts when Google Sheets extractions are configured with a `chart` property. This system supports:

- **Multiple Chart Types**: Line, bar, scatter, bubble charts
- **Custom Data Mapping**: Map any columns to chart axes
- **Multiple Datasets**: Display multiple data series on one chart
- **Custom Styling**: Full control over colors, styles, and appearance
- **Multiple Axes**: Support for multiple Y-axes with different scales
- **Interactive Features**: Legend toggling, export, data tables

## Basic Configuration

To enable chart functionality, add a `chart` property to your Google Sheets extraction configuration:

```typescript
{
  id: "performance-chart",
  title: "Company Performance",
  description: "Interactive performance metrics",
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  ranges: ["Data!A:Z"],
  hasHeaders: true,
  chart: {
    type: "line",
    datasets: [
      {
        label: "Share Price",
        mapping: { x: "date", y: "sharePrice" },
        borderColor: "#ffffff",
        yAxisID: "y1"
      }
    ],
    axes: [
      {
        id: "x",
        type: "time",
        position: "bottom"
      },
      {
        id: "y1",
        type: "linear",
        position: "left"
      }
    ]
  }
}
```

## Chart Configuration Reference

### ChartConfiguration Interface

```typescript
// Responsive height configuration
interface ResponsiveHeight {
  default: number; // Default height in pixels
  sm?: number; // Small screens (640px+)
  md?: number; // Medium screens (768px+)
  lg?: number; // Large screens (1024px+)
  xl?: number; // Extra large screens (1280px+)
  "2xl"?: number; // 2X large screens (1536px+)
}

interface ChartConfiguration {
  type: 'line' | 'bar' | 'scatter' | 'bubble'; // Chart type
  title?: string; // Chart title (overrides extraction title)
  datasets: ChartDataset[]; // Dataset configurations
  axes?: ChartAxis[]; // Custom axis configurations
  height?: number | ResponsiveHeight; // Chart height in pixels (default: 500) or responsive configuration
  showExportButton?: boolean; // Show export button (default: true)
  showDataTable?: boolean; // Show expandable data table (default: true)
  animation?: boolean; // Enable animations (default: false)
  responsive?: boolean; // Responsive sizing (default: true)
  maintainAspectRatio?: boolean; // Maintain aspect ratio (default: false)
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
    };
    watermark?: {
      enabled?: boolean;
      text?: string;
    };
  };
}
```

### Dataset Configuration

```typescript
interface ChartDataset {
  label: string; // Dataset label
  mapping: ChartDataMapping; // How to map data columns
  borderColor?: string; // Line/border color
  backgroundColor?: string; // Fill/background color
  borderDash?: number[]; // Dash pattern for lines
  tension?: number; // Line tension (0 = straight lines)
  pointRadius?: number; // Point size
  pointHoverRadius?: number; // Point size on hover
  yAxisID?: string; // Which Y-axis to use
  hidden?: boolean; // Start hidden
}

interface ChartDataMapping {
  x: string; // Column name for X-axis data
  y: string; // Column name for Y-axis data
  label?: string; // Optional label override for this dataset
}
```

### Axis Configuration

```typescript
interface ChartAxis {
  id: string; // Unique axis ID
  type: 'linear' | 'logarithmic' | 'time' | 'category'; // Axis type
  position: 'left' | 'right' | 'top' | 'bottom'; // Axis position
  title?: {
    display: boolean;
    text: string;
    color?: string;
  };
  ticks?: {
    color?: string;
    callback?: string; // Function name for custom formatting
  };
  grid?: {
    display?: boolean;
    color?: string;
    drawOnChartArea?: boolean;
  };
  beginAtZero?: boolean;
  offset?: boolean;
}
```

## Responsive Height Configuration

Charts can be configured with responsive heights that adapt to different screen sizes using Tailwind CSS breakpoints:

### Fixed Height (Traditional)
```typescript
chart: {
  type: "line",
  height: 500, // Fixed 500px height on all screens
  // ... other config
}
```

### Responsive Height (Recommended)
```typescript
chart: {
  type: "line",
  height: {
    default: 350, // Mobile and small screens
    sm: 400,      // Small screens (640px+)
    md: 500,      // Medium screens (768px+)
    lg: 600,      // Large screens (1024px+)
    xl: 700,      // Extra large screens (1280px+)
    "2xl": 800,   // 2X large screens (1536px+)
  },
  // ... other config
}
```

### Responsive Height Examples

**Mobile-First Approach:**
```typescript
height: {
  default: 300, // Start small for mobile
  md: 450,      // Increase for tablets
  lg: 600,      // Full size for desktop
}
```

**Desktop-Optimized:**
```typescript
height: {
  default: 400, // Reasonable mobile size
  lg: 700,      // Large desktop charts
  xl: 800,      // Extra large for wide screens
}
```

**Compact Dashboard:**
```typescript
height: {
  default: 250, // Very compact for mobile
  sm: 300,      // Slightly larger for small tablets
  md: 350,      // Medium size for tablets
  lg: 400,      // Reasonable desktop size
}
```

### Benefits of Responsive Heights

- **Better Mobile Experience**: Smaller charts fit better on mobile screens
- **Optimized Desktop**: Larger charts take advantage of desktop screen space
- **Improved Readability**: Appropriate sizing for each device type
- **Consistent UX**: Charts scale naturally with the responsive design

## Complete Example

```typescript
{
  id: "comprehensive-chart",
  title: "Company Performance Metrics",
  description: "Multi-metric performance visualization",
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  ranges: ["Performance!A:Z"],
  hasHeaders: true,
  chart: {
    type: "line",
    title: "Performance Over Time",
    height: {
      default: 400, // Mobile
      md: 500,      // Tablet
      lg: 600,      // Desktop
      xl: 700,      // Large desktop
    },
    animation: false,
    datasets: [
      {
        label: "Share Price (£)",
        mapping: { x: "date", y: "sharePrice" },
        borderColor: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 3,
        yAxisID: "price"
      },
      {
        label: "BTC Holdings",
        mapping: { x: "date", y: "btcHeld" },
        borderColor: "#f3991f",
        backgroundColor: "rgba(243, 153, 31, 0.2)",
        pointRadius: 5,
        yAxisID: "btc"
      },
      {
        label: "Market Cap (M£)",
        mapping: { x: "date", y: "marketCap" },
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderDash: [10, 5],
        yAxisID: "marketcap"
      }
    ],
    axes: [
      {
        id: "x",
        type: "time",
        position: "bottom",
        title: {
          display: true,
          text: "Date",
          color: "#ffffff"
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)"
        }
      },
      {
        id: "price",
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Share Price (£)",
          color: "#ffffff"
        },
        ticks: {
          color: "#ffffff"
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)"
        }
      },
      {
        id: "btc",
        type: "logarithmic",
        position: "right",
        title: {
          display: true,
          text: "BTC Holdings",
          color: "#f3991f"
        },
        ticks: {
          color: "#f3991f"
        },
        grid: {
          drawOnChartArea: false
        }
      },
      {
        id: "marketcap",
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Market Cap (M£)",
          color: "#10b981"
        },
        ticks: {
          color: "#10b981"
        },
        grid: {
          drawOnChartArea: false
        },
        offset: true
      }
    ],
    plugins: {
      legend: {
        display: true,
        position: "top"
      },
      tooltip: {
        enabled: true
      },
      watermark: {
        enabled: true,
        text: "btctcs.com"
      }
    }
  }
}
```

## Chart Types

### Line Charts (`type: "line"`)
- Best for time series data
- Supports multiple datasets
- Configurable line styles and points

### Bar Charts (`type: "bar"`)
- Good for categorical data comparison
- Supports stacked bars
- Horizontal and vertical orientations

### Scatter Charts (`type: "scatter"`)
- Shows correlation between two variables
- Individual point styling
- Trend line support

### Bubble Charts (`type: "bubble"`)
- Three-dimensional data visualization
- Bubble size represents third dimension
- Advanced point configurations

## Data Mapping

The `mapping` property in each dataset defines how spreadsheet columns map to chart data:

```typescript
{
  label: "Revenue Growth",
  mapping: {
    x: "quarter",     // Column name for X-axis
    y: "revenue",     // Column name for Y-axis
    label: "Quarter"  // Optional: override point labels
  }
}
```

## Styling Options

### Colors
- Use hex colors: `"#f3991f"`
- Use RGB/RGBA: `"rgba(243, 153, 31, 0.2)"`
- Predefined colors: `"orange"`, `"white"`, etc.

### Line Styles
- Solid lines: No `borderDash`
- Dashed lines: `borderDash: [5, 5]`
- Dotted lines: `borderDash: [2, 2]`
- Custom patterns: `borderDash: [10, 5, 2, 5]`

### Point Styles
- `pointRadius`: Normal point size
- `pointHoverRadius`: Point size on hover
- `tension`: Line smoothness (0 = straight, 1 = very curved)

## Axis Types

### Linear (`type: "linear"`)
- Standard numeric scale
- Good for most numeric data
- Supports `beginAtZero` option

### Logarithmic (`type: "logarithmic"`)
- Logarithmic scale
- Good for data with wide value ranges
- Automatically handles zero/negative values

### Time (`type: "time"`)
- Time-based X-axis
- Automatic date parsing
- Configurable time units

### Category (`type: "category"`)
- Discrete categories
- String-based labels
- Good for categorical data

## Interactive Features

### Legend Control
- Click legend items to hide/show datasets
- Automatically hides corresponding axes
- Customizable position and styling

### Export Functionality
- PNG export with proper background
- Automatic watermark inclusion
- Custom filename based on chart title

### Data Table
- Expandable table showing raw data
- Sortable columns
- Responsive design

## Performance Tips

1. **Disable Animations**: Set `animation: false` for better performance
2. **Limit Data Points**: Use `maxRows` for large datasets
3. **Optimize Axes**: Only include necessary axes
4. **Cache Data**: Leverage 10-minute extraction caching

## Troubleshooting

### Chart Not Appearing
1. Verify `chart` property is properly configured
2. Check that column names in `mapping` match spreadsheet headers
3. Ensure data contains valid numeric values
4. Check browser console for errors

### Styling Issues
1. Use valid CSS color values
2. Check axis ID references in datasets
3. Verify axis positions don't conflict

### Data Issues
1. Ensure column names are exact matches
2. Check for empty or invalid data rows
3. Verify date formats for time axes (YYYY-MM-DD)
4. Confirm numeric columns contain numbers, not strings
