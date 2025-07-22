export const RESOURCE_TYPES = ["av", "ebook", "ejournal"] as const;
export type ResourceType = typeof RESOURCE_TYPES[number];

export interface CopyRecord {
  id: number;
  counts: number;
}

/**
 * Copies count records from an existing year to a target year
 * Used by the admin UI to easily copy library stats between years
 * @param resource Type of resource (av, ebook, ejournal)
 * @param targetYear Target year to copy counts to
 * @param records Array of {id, counts} to copy
 * @returns Object with count of processed records
 */
export async function copyRecords(
  resource: ResourceType,
  targetYear: number,
  records: CopyRecord[],
): Promise<{ processed: number }> {
  // Validate input
  if (!Array.isArray(records) || records.length === 0) return { processed: 0 };
  if (!targetYear) throw new Error("Target year required");
  if (!RESOURCE_TYPES.includes(resource)) {
    throw new Error(`Unsupported resource type: ${resource}`);
  }

  try {
    console.log(`In CopyRecords: Processing ${records.length} records for ${resource} year ${targetYear}`);
    
    // Call API route with all records at once instead of one by one
    const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" : "";
    const resp = await fetch(`${baseUrl}/api/copy-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, targetYear, records }),
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`API error: ${resp.status} - ${errorText}`);
    }
    
    const result = await resp.json();
    return result;
  } catch (err: any) {
    console.error("In CopyRecords: API call failed:", err);
    throw err;
  }
}
