'use server';

import { cookies } from "next/headers";
import { copyRecords, ResourceType, CopyRecord, CopyRecordsResult } from "@/lib/copyRecords";
import { requireRoles } from "@/lib/auth";

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
): Promise<CopyRecordsResult> {
  // Server actions are publicly callable, so authorize here as well as in the UI.
  if (!(await requireRoles(1, 3))) {
    throw new Error("Unauthorized: only Super Admin or E-Resource Editor can copy records");
  }

  // Basic argument validation
  if (!Array.isArray(records) || typeof targetYear !== "number") {
    throw new Error("Invalid payload for copyCounts");
  }
  
  if (records.length === 0) {
    throw new Error("No records provided to copy");
  }
  
  try {
    // The API route checks the session, so forward the caller's cookies.
    const result = await copyRecords(resource, targetYear, records, (await cookies()).toString());
    return result;
  } catch (error: any) {
    // Re-throw with preserved error message for frontend handling
    throw new Error(error.message || "Failed to copy records");
  }
}
