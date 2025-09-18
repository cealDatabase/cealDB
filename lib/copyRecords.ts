export const RESOURCE_TYPES = ["av", "ebook", "ejournal"] as const;
export type ResourceType = typeof RESOURCE_TYPES[number];

export interface CopyRecord {
  id: number;
  counts: number;
}

export interface CopyRecordsResult {
  processed: number;
}

export interface CopyRecordsError {
  error: string;
  detail: string;
  duplicateRecords?: number[];
  totalDuplicates?: number;
}

/**
 * Copies count records from an existing year to a target year
 * Used by the admin UI to easily copy library stats between years
 * @param resource Type of resource (av, ebook, ejournal)
 * @param targetYear Target year to copy counts to
 * @param records Array of {id, counts} to copy
 * @returns Object with count of processed records
 * @throws Error with detailed information if duplicates are found or other errors occur
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
    const baseUrl = typeof window === "undefined" ? (
      process.env.NODE_ENV !== "production" 
        ? "http://localhost:3000" 
        : "https://cealstats.org"
    ) : "";
    const resp = await fetch(`${baseUrl}/api/copy-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, targetYear, records }),
    });
    
    if (!resp.ok) {
      try {
        const errorData: CopyRecordsError = await resp.json();
        
        // Handle duplicate records error with detailed information
        if (resp.status === 409 && errorData.duplicateRecords) {
          const duplicateList = errorData.duplicateRecords.join(', ');
          throw new Error(
            `Cannot copy records: ${errorData.totalDuplicates} duplicate record(s) already exist for ${resource} in year ${targetYear}. ` +
            `Duplicate record IDs: ${duplicateList}. Please choose a different target year or remove existing records first.`
          );
        }
        
        // Handle other API errors
        throw new Error(errorData.detail || errorData.error || `API error: ${resp.status}`);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const errorText = await resp.text();
        throw new Error(`API error: ${resp.status} - ${errorText}`);
      }
    }
    
    const result = await resp.json();
    return result;
  } catch (err: any) {
    console.error("In CopyRecords: API call failed:", err);
    throw err;
  }
}
