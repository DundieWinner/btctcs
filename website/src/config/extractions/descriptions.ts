// Utilities for generating consistent data source descriptions

/**
 * Creates a link with proper HTML attributes for external links
 */
function createLink(url: string, text: string): string {
  return `<a href='${url}' target='_blank' rel='noopener noreferrer'>${text}</a>`;
}

/**
 * Common data source URLs and information
 */
const DATA_SOURCES = {
  RAGNAR: {
    name: "@RoaringRagnar",
    twitterUrl: "https://x.com/RoaringRagnar",
    sheetUrl:
      "https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592",
    sheetName: "Google Sheet",
  },
  BTCTCS: {
    name: "BTCTC",
    sheetUrl:
      "https://docs.google.com/spreadsheets/d/1hyRTvjiXQbXU6UnPmZoRDF9Rs7vL8YYYfFsrqu6Jk8Q/edit?usp=sharing",
    sheetName: "community-sheet",
  },
} as const;

/**
 * Description generators for common data extraction patterns
 */
export const DESCRIPTIONS = {
  /**
   * Creates description for Ragnar comparison data
   */
  ragnarStats(): string {
    const ragnarLink = createLink(
      DATA_SOURCES.RAGNAR.twitterUrl,
      DATA_SOURCES.RAGNAR.name,
    );
    const sheetLink = createLink(
      DATA_SOURCES.RAGNAR.sheetUrl,
      DATA_SOURCES.RAGNAR.sheetName,
    );
    return `Data extracted from ${ragnarLink}'s open-source ${sheetLink}.`;
  },

  /**
   * Creates description for BTCTCS community sheet data
   */
  btctcsData(): string {
    const sheetLink = createLink(
      DATA_SOURCES.BTCTCS.sheetUrl,
      DATA_SOURCES.BTCTCS.sheetName,
    );
    return `Data extracted from ${DATA_SOURCES.BTCTCS.name}'s ${sheetLink}.`;
  },

  /**
   * Creates description for treasury actions data
   */
  treasuryActions(): string {
    return this.btctcsData();
  },

  /**
   * Creates description for Bitcoin price history data
   */
  bitcoinPriceHistory(): string {
    return "Complete Bitcoin price history with purchase events (all data, no date filtering)";
  },

  /**
   * Creates description for historical performance data
   */
  historicalPerformance(): string {
    return "Historical performance tracking of key financial metrics";
  },

  /**
   * Creates a custom description with data source attribution
   * @param customText - Custom description text
   * @param source - Data source ('ragnar' or 'btctcs')
   */
  custom(customText: string, source: "ragnar" | "btctcs"): string {
    const sourceAttribution =
      source === "ragnar" ? this.ragnarStats() : this.btctcsData();
    return `${customText}. ${sourceAttribution}`;
  },
} as const;

/**
 * Key statistic descriptions for common metrics used across companies
 */
export const KEY_STATISTIC_DESCRIPTIONS = {
  /**
   * Description for "Fwd Months to Cover mNAV" metric
   */
  forwardMonthsToCoverMnav(): string {
    return "The number of months it would take the company at its current trailing 30D bitcoin yield to close the gap between its current market capitalization and its Bitcoin net asset value.";
  },

  /**
   * Description for "Forward P/BYD" metric
   */
  forwardPByd(): string {
    return "P/BYD represents the number of years to earn back the existing mNAV premium if the trailing 30D yield were to hold. The forward metric is computed from Forward mNAV.";
  },

  /**
   * Description for "BTC Yield T30D" metric
   */
  btcYieldT30d(): string {
    return "The percent increase of Bitcoin per fully diluted share over the most-recent 30-day period.";
  },

  /**
   * Description for combined mNAV metrics
   */
  mnavCombined(): string {
    return "Computed by dividing enterprise value (market cap + debt - cash) by Bitcoin net asset value. Forward mNAV represents the metric as if fiat earmarked for Bitcoin purchases were converted to Bitcoin today.";
  },
} as const;

/**
 * Legacy function names for backward compatibility
 */
export const createRagnarDescription = DESCRIPTIONS.ragnarStats;
export const createBTCTCSDescription = DESCRIPTIONS.btctcsData;
