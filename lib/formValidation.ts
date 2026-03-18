/**
 * Check if a form submission contains only zero or null/undefined values
 * Used to determine if a form should be considered as "participated"
 * Forms with all zeros are treated as non-participation
 */

export function isFormAllZeros(data: Record<string, any>): boolean {
  if (!data || typeof data !== 'object') {
    return true;
  }
  
  const numericFields = Object.entries(data).filter(([key, value]) => {
    // Skip non-numeric fields like notes, labels, IDs, etc.
    if (
      key === 'id' ||
      key === 'libraryyear' ||
      key === 'entryid' ||
      key.includes('notes') ||
      key.includes('label') ||
      key.includes('comment') ||
      value === null ||
      value === undefined
    ) {
      return false;
    }
    return typeof value === 'number' || !isNaN(parseFloat(value));
  });

  // If no numeric fields found, consider it invalid (all zeros)
  if (numericFields.length === 0) {
    return true;
  }

  // Check if all numeric fields are zero
  const allZeros = numericFields.every(([_, value]) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return numValue === 0 || isNaN(numValue);
  });

  return allZeros;
}

/**
 * Check if Other Holdings form has meaningful data
 */
export function hasValidOtherHoldingsData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Monographic Acquisitions form has meaningful data
 */
export function hasValidMonographicData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Volume Holdings form has meaningful data
 */
export function hasValidVolumeHoldingsData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Serials form has meaningful data
 */
export function hasValidSerialsData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Unprocessed Backlog form has meaningful data
 */
export function hasValidUnprocessedData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Fiscal Support form has meaningful data
 */
export function hasValidFiscalData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Personnel Support form has meaningful data
 */
export function hasValidPersonnelData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Public Services form has meaningful data
 */
export function hasValidPublicServicesData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Electronic form has meaningful data
 */
export function hasValidElectronicData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}

/**
 * Check if Electronic Books form has meaningful data
 */
export function hasValidElectronicBooksData(data: any): boolean {
  if (!data) return false;
  return !isFormAllZeros(data);
}
