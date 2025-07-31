// Utilities for generating consistent company disclosure statements

/**
 * Common data source URLs and information for disclosures
 */
const DATA_SOURCES = {
  RAGNAR: {
    name: "@RoaringRagnar",
    url: "https://docs.google.com/spreadsheets/d/1hzlHsDwhcwRr3cPrZZBlavMU3mFda1CX6gVHJvURhzE/edit?gid=963629592#gid=963629592",
    displayName: "open-source Google Sheet",
  },
  BTCTCS: {
    name: "BTCTCs",
    url: "https://docs.google.com/spreadsheets/d/1tDNcdBkiQn8HJ-UkWDsKDlgeFwNa_ck3fiPPDtIVPlw/edit?gid=1527424383#gid=1527424383",
    displayName: "community-sheet",
  },
} as const;

/**
 * Disclosure generators for common data source combinations
 */
export const DISCLOSURES = {
  /**
   * Creates disclosure for companies using only Ragnar's data
   */
  ragnarOnly(): string {
    return `Data on this dashboard is sourced from ${DATA_SOURCES.RAGNAR.name}'s [${DATA_SOURCES.RAGNAR.displayName}](${DATA_SOURCES.RAGNAR.url}).`;
  },

  /**
   * Creates disclosure for companies using both Ragnar's and BTCTCS data
   */
  ragnarAndBtctcs(): string {
    return `Data on this dashboard is sourced from ${DATA_SOURCES.RAGNAR.name}'s [${DATA_SOURCES.RAGNAR.displayName}](${DATA_SOURCES.RAGNAR.url}) as well as ${DATA_SOURCES.BTCTCS.name}'s [${DATA_SOURCES.BTCTCS.displayName}](${DATA_SOURCES.BTCTCS.url}).`;
  },

  /**
   * Creates disclosure for companies using only BTCTCS data
   */
  btctcsOnly(): string {
    return `Data on this dashboard is sourced from ${DATA_SOURCES.BTCTCS.name}'s [${DATA_SOURCES.BTCTCS.displayName}](${DATA_SOURCES.BTCTCS.url}).`;
  },

  /**
   * Creates a custom disclosure with specified data sources
   * @param sources - Array of data source keys to include
   */
  custom(sources: ('ragnar' | 'btctcs')[]): string {
    if (sources.length === 0) {
      return "Data sources not specified.";
    }

    if (sources.length === 1) {
      return sources[0] === 'ragnar' ? this.ragnarOnly() : this.btctcsOnly();
    }

    // Multiple sources
    if (sources.includes('ragnar') && sources.includes('btctcs')) {
      return this.ragnarAndBtctcs();
    }

    return "Data sources not recognized.";
  },
} as const;
