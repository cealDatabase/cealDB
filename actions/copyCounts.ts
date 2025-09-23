'use server';

import { copyRecords, ResourceType, CopyRecord } from "@/lib/copyRecords";

/**
 * Server Action: copyCounts
 * Runs on the server, calls lib/copyRecords to copy the counts data.
 * This is invoked from client components via the Next.js server-actions mechanism.
 * @throws Error with detailed message if records already exist or other errors occur
 */
export async function copyCounts(
  resource: ResourceType,
  targetYear: number,
  records: CopyRecord[],
): Promise<{ processed: number; alreadyExists?: boolean; existingCount?: number; message?: string }> {
  // Basic argument validation
  if (!Array.isArray(records) || typeof targetYear !== "number") {
    throw new Error("Invalid payload for copyCounts");
  }
  
  if (records.length === 0) {
    throw new Error("No records provided to copy");
  }
  
  try {
    const result = await copyRecords(resource, targetYear, records);
    return result;
  } catch (error: any) {
    // Re-throw with preserved error message for frontend handling
    throw new Error(error.message || "Failed to copy records");
  }
}
