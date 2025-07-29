// Treasury Actions Processor for BLGV
// Extracts data from columns A (dates), B (descriptions), and D (BTC held)

export const blgvTreasuryProcessor = (
  rangeData: {
    range: string;
    majorDimension: string;
    values?: string[][];
  }[],
): { rows: { [key: string]: string | number }[] } => {
  const dataRange = rangeData[0]; // Single range with all data

  if (!dataRange || !dataRange.values) {
    return { rows: [] };
  }

  // Extract treasury actions from columns A (date), B (description), D (BTC held)
  const treasuryActions: { [key: string]: string | number }[] = [];

  for (let i = 0; i < dataRange.values.length; i++) {
    const row = dataRange.values[i];
    
    // Extract data from specific columns
    const date = row && row[0] ? String(row[0]).trim() : ""; // Column A
    const description = row && row[1] ? String(row[1]).trim() : ""; // Column B
    const btcHeld = row && row[3] ? String(row[3]).trim() : ""; // Column D (index 3)

    // Only include rows where we have at least a date and description
    if (date && description) {
      treasuryActions.push({
        Date: date,
        Description: description,
        "BTC Held": btcHeld || "-",
      });
    }
  }

  return {
    rows: treasuryActions,
  };
};
