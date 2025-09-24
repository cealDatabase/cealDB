// lib/sequenceFixer.ts
import db from "@/lib/db";

/**
 * Fix auto-increment sequence for a specific table
 * @param tableName - Name of the table to fix
 * @returns Promise<void>
 */
export async function fixSequenceForTable(tableName: string): Promise<void> {
  try {
    // Get max ID from the table
    const [{ max_id }] = await db.$queryRawUnsafe(
      `SELECT COALESCE(MAX(id), 0) AS max_id FROM "${tableName}";`
    ) as Array<{ max_id: number }>;

    // Set the sequence to max_id + 1
    const sequenceValue = Number(max_id);
    const isCalled = sequenceValue > 0;
    const setValue = sequenceValue > 0 ? sequenceValue : 1;

    await db.$executeRawUnsafe(
      `SELECT setval(
         pg_get_serial_sequence('"${tableName}"','id'),
         ${setValue},
         ${isCalled}
       );`
    );

    console.log(`✅ Fixed sequence for ${tableName}: next ID will be ${sequenceValue + 1}`);
  } catch (error) {
    console.error(`❌ Failed to fix sequence for ${tableName}:`, error);
    throw error;
  }
}

/**
 * Handle P2002 errors by attempting to fix sequences and retry
 * @param operation - The async operation to retry
 * @param tableName - The table name for sequence fixing
 * @param maxRetries - Maximum number of retries (default: 1)
 * @returns Promise<any>
 */
export async function handleP2002WithSequenceFix<T>(
  operation: () => Promise<T>,
  tableName: string,
  maxRetries: number = 1
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('id') && maxRetries > 0) {
      console.log(`🔧 P2002 ID conflict detected for ${tableName}, attempting sequence fix...`);
      
      try {
        await fixSequenceForTable(tableName);
        console.log(`🔄 Retrying operation after sequence fix...`);
        return await handleP2002WithSequenceFix(operation, tableName, maxRetries - 1);
      } catch (fixError) {
        console.error(`❌ Sequence fix failed for ${tableName}:`, fixError);
        throw error; // Throw original error if fix fails
      }
    }
    throw error; // Re-throw if not a fixable P2002 error
  }
}

/**
 * Common sequence tables mapping
 */
export const SEQUENCE_TABLES = {
  AV_COUNTS: 'List_AV_Counts',
  EBOOK_COUNTS: 'List_EBook_Counts', 
  EJOURNAL_COUNTS: 'List_EJournal_Counts',
  AV: 'List_AV',
  EBOOK: 'List_EBook',
  EJOURNAL: 'List_EJournal'
} as const;
