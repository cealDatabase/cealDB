/**
 * Filters subscriptions to prevent duplicate counting when a library has both
 * global and library-specific versions of the same record.
 * 
 * When a member edits a global record, they create a library-specific copy.
 * Both subscriptions remain in the database, but we should only count the
 * library-specific version to avoid duplicate counts in imports.
 */

interface RecordWithIdentifier {
  id: number;
  title: string | null;
  is_global: boolean | null;
  [key: string]: any;
}

/**
 * Filter records to prefer library-specific over global
 * @param records - Array of records from subscription junction table
 * @param identifierKeys - Keys to use for grouping duplicates (e.g., ['title', 'type'])
 * @returns Filtered array with library-specific records preferred
 */
export function filterPreferLibrarySpecific<T extends RecordWithIdentifier>(
  records: T[],
  identifierKeys: string[] = ['title']
): T[] {
  // Group by unique identifier
  const recordsByIdentifier = new Map<string, T[]>();
  
  records.forEach((record) => {
    // Create identifier from specified keys
    const identifier = identifierKeys
      .map(key => String(record[key] || '').toLowerCase())
      .join('_');
    
    if (!recordsByIdentifier.has(identifier)) {
      recordsByIdentifier.set(identifier, []);
    }
    recordsByIdentifier.get(identifier)!.push(record);
  });
  
  // For each group, prefer library-specific over global
  const filtered = Array.from(recordsByIdentifier.values()).map((group) => {
    // If there's a library-specific record (is_global = false), use that
    const librarySpecific = group.find(record => !record.is_global);
    return librarySpecific || group[0]; // fallback to first if all are global
  });
  
  return filtered;
}

/**
 * Filter AV records by title + type
 */
export function filterAVSubscriptions<T extends RecordWithIdentifier & { type: string | null }>(
  records: T[]
): T[] {
  return filterPreferLibrarySpecific(records, ['title', 'type']);
}

/**
 * Filter EBook records by title + publisher
 */
export function filterEBookSubscriptions<T extends RecordWithIdentifier & { publisher: string | null }>(
  records: T[]
): T[] {
  return filterPreferLibrarySpecific(records, ['title', 'publisher']);
}

/**
 * Filter EJournal records by title + publisher
 */
export function filterEJournalSubscriptions<T extends RecordWithIdentifier & { publisher: string | null }>(
  records: T[]
): T[] {
  return filterPreferLibrarySpecific(records, ['title', 'publisher']);
}
