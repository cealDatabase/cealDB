'use server';

import { copyRecords, ResourceType, CopyRecord } from "@/lib/copyRecords";

/**
 * Server Action: copyCounts
 * Runs on the server, calls lib/copyRecords to copy the counts data.
 * This is invoked from client components via the Next.js server-actions mechanism.
 */
export async function copyCounts(
  resource: ResourceType,
  targetYear: number,
  records: CopyRecord[],
) {
  // Basic argument validation
  if (!Array.isArray(records) || typeof targetYear !== "number") {
    throw new Error("Invalid payload for copyCounts");
  }
  await copyRecords(resource, targetYear, records);
}
