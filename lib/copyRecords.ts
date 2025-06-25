import db from "@/lib/db";

export type ResourceType = "av" | "ebook" | "ejournal";

export interface CopyRecord {
  listav_id: number;
  counts: number;
}

/**
 * Copy count records from any list_* table to the given target year.
 * The function upserts the counts row (creates if missing, updates otherwise)
 * and always sets `ishidden` to false and `updatedat` to current time.
 *
 * @param resource   type of resource ("av" | "ebook" | "ejournal")
 * @param targetYear year to copy into
 * @param records    array of {id, counts}
 */
export async function copyRecords(
  resource: ResourceType,
  targetYear: number,
  records: CopyRecord[],
) {
  // Resolve table names & fields per resource type
  let countsModel: any;
  let countsField: string;
  let listRefField: string; // field name for foreign key to parent list

  switch (resource) {
    case "av":
      countsModel = db.list_AV_Counts;
      countsField = "titles"; // domain-specific naming
      listRefField = "listav";
      break;
    case "ebook":
      countsModel = db.list_EBook_Counts;
      countsField = "titles";
      listRefField = "listebook";
      break;
    case "ejournal":
      countsModel = db.list_EJournal_Counts;
      countsField = "journals";
      listRefField = "listejournal";
      break;
    default:
      throw new Error(`Unsupported resource type: ${resource}`);
  }

  await Promise.all(
    records.map(async ({ listav_id, counts }) => {
      console.log("In CopyRecords: Processing record:", { listav_id, counts });
      const countVal = Number(counts) || 0;

      // First try to update an existing row (safer for concurrency)
      const updateRes = await countsModel.updateMany({
        where: {
          [listRefField]: Number(listav_id),
          year: targetYear,
        },
        data: {
          [countsField]: countVal,
          updatedat: new Date(),
          ishidden: false,
        },
      });

      if (updateRes.count === 0) {
        // No row for (list item, year) yet – attempt to create.
        console.log("In CopyRecords: Creating new record:", { listav_id, counts, targetYear });
        try {
          const maxId = await countsModel.findFirst({
            select: {
              id: true,
            },
            orderBy: {
              id: "desc",
            },
          });
          const newId = maxId?.id + 1 || 999;
          await countsModel.create({
            data: {
              id: newId,
              [listRefField]: Number(listav_id),
              [countsField]: countVal,
              year: targetYear,
              updatedat: new Date(),
              ishidden: false,
            },
          });
        } catch (err: any) {
          console.log("In CopyRecords: Create failed:", err);
          if ((err as any)?.code === "P2002") {
            // Someone else inserted the row in between – do the update now.
            console.warn("Unique constraint hit after create attempt; retrying update", { listav_id, targetYear });
            await countsModel.updateMany({
              where: {
                [listRefField]: Number(listav_id),
                year: targetYear,
              },
              data: {
                [countsField]: countVal,
                updatedat: new Date(),
                ishidden: false,
              },
            });
          } else {
            console.error("Failed to upsert counts record", err);
            throw err;
          }
        }
      }
    }),
  );
}
