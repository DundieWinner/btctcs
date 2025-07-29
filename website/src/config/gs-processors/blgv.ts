import { GoogleSheetData } from "@/config/types";

export const blgvTreasuryActionsProcessor = (
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): GoogleSheetData => {
  const dataRange = rangeData[0]; // Single range with all data

  if (!dataRange || !dataRange.values) {
    return { rows: [] };
  }

  // Extract treasury actions from columns A-D and E, F, G, H, K, L
  const treasuryActions: { [key: string]: string | number }[] = [];

  for (let i = 1; i < dataRange.values.length; i++) {
    const row = dataRange.values[i];

    // Extract data from specific columns
    const date = row && row[0] ? String(row[0]).trim() : ""; // Column A
    const description = row && row[1] ? String(row[1]).trim() : ""; // Column B
    const changeRaw = row && row[2] ? String(row[2]).trim() : ""; // Column C (index 2)
    const btcHeld = row && row[3] ? String(row[3]).trim() : ""; // Column D (index 3)
    const estCADBalance = row && row[5] ? String(row[5]).trim() : ""; // Column F (index 5)
    const debtCAD = row && row[7] ? String(row[7]).trim() : ""; // Column H (index 7)
    const fdShareCount = row && row[11] ? String(row[11]).trim() : ""; // Column L (index 11)
    const satsPerFDShare = row && row[13] ? String(row[13]).trim() : ""; // Column N (index 13)
    const satsEquityPerFDShare = row && row[15] ? String(row[15]).trim() : ""; // Column P (index 15)

    // Helper function to convert to number with better parsing
    const convertToNumber = (value: string, columnName?: string): number | string => {
      if (!value || value === "") {
        return "-";
      }
      
      // Clean the value - remove commas, currency symbols, and extra spaces
      let cleanValue = value.toString().trim();
      cleanValue = cleanValue.replace(/[,$]/g, ''); // Remove commas and dollar signs
      cleanValue = cleanValue.replace(/\s+/g, ''); // Remove all whitespace
      
      // Handle negative values in parentheses (accounting format)
      if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
        cleanValue = '-' + cleanValue.slice(1, -1);
      }
      
      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed)) {
        // Debug logging to help identify issues
        if (columnName) {
          console.log(`${columnName}: "${value}" -> "${cleanValue}" -> ${parsed}`);
        }
        return parsed;
      }
      
      // If parsing failed, log for debugging
      if (columnName) {
        console.log(`${columnName}: Failed to parse "${value}" (cleaned: "${cleanValue}")`);
      }
      return "-";
    };

    // Convert all numerical values with debugging
    const changeInBTC = convertToNumber(changeRaw, "Change in BTC");
    const btcHeldValue = convertToNumber(btcHeld, "BTC Held");
    const estCADBalanceValue = convertToNumber(estCADBalance, "Est. CAD Balance");
    const debtCADValue = convertToNumber(debtCAD, "Debt (CAD)");
    const fdShareCountValue = convertToNumber(fdShareCount, "FD Share Count");
    const satsPerFDShareValue = convertToNumber(satsPerFDShare, "Sats / FD Share");
    const satsEquityPerFDShareValue = convertToNumber(satsEquityPerFDShare, "Sats Equity / FD Share");
    
    // Debug log the raw values to understand what we're getting
    if (i === 1) { // Log first data row for debugging
      console.log('Raw values from sheet:', {
        date,
        description,
        changeRaw,
        btcHeld,
        estCADBalance: `"${estCADBalance}"`,
        debtCAD: `"${debtCAD}"`,
        fdShareCount: `"${fdShareCount}"`,
        satsPerFDShare: `"${satsPerFDShare}"`,
        satsEquityPerFDShare: `"${satsEquityPerFDShare}"`,
        rowLength: row?.length || 0
      });
    }

    // Only include rows where we have at least a date and description
    if (date && description) {
      treasuryActions.push({
        Date: date,
        Description: description,
        "Change in BTC": changeInBTC,
        "BTC Held": btcHeldValue,
        "Est. CAD Balance": estCADBalanceValue,
        "Debt (CAD)": debtCADValue,
        "FD Share Count": fdShareCountValue,
        "Sats / FD Share": satsPerFDShareValue,
        "Sats Equity / FD Share": satsEquityPerFDShareValue,
      });
    }
  }

  return {
    rows: treasuryActions,
  };
};
