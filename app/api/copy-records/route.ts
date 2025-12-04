import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResourceType, CopyRecord, RESOURCE_TYPES } from "@/lib/copyRecords";
import { logUserAction } from "@/lib/auditLogger";
import { fixSequenceForTable } from "@/lib/sequenceFixer";

// POST /api/copy-records
// Expects JSON body: { resource: "av"|"ebook"|"ejournal", targetYear: number, records: Array<{id:number, counts:number}> }
// Returns JSON { processed: <number> } or error message
export async function POST(request: Request) {
  try {
    console.log("/api/copy-records: Start processing request");
    
    // Parse and type-check the request
    const body = await request.json();
    const resource = body.resource as ResourceType;
    const targetYear = Number(body.targetYear);
    const records = Array.isArray(body.records) ? body.records : [];
    
    console.log("/api/copy-records: Request parsed", { resource, targetYear, recordCount: records.length });
    
    // Validate inputs
    if (!RESOURCE_TYPES.includes(resource)) {
      console.log("/api/copy-records: Invalid resource type", { resource });
      return NextResponse.json(
        { error: `Invalid resource type: ${resource}` },
        { status: 400 }
      );
    }
    
    if (!targetYear || isNaN(targetYear)) {
      console.log("/api/copy-records: Invalid year", { targetYear });
      return NextResponse.json(
        { error: "Missing or invalid targetYear" },
        { status: 400 }
      );
    }
    
    if (records.length === 0) {
      console.log("/api/copy-records: No records provided");
      return NextResponse.json(
        { error: "No records provided" },
        { status: 400 }
      );
    }

    // map models
    let countsModel: any;
    let countsField = "";
    let listRefField = "";
    switch (resource) {
      case "av":
        countsModel = db.list_AV_Counts;
        countsField = "titles";
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
        return NextResponse.json({ error: "unsupported resource" }, { status: 400 });
    }
    
    console.log(`/api/copy-records: Using model for ${resource}`, { 
      modelType: resource,
      countsField,
      listRefField
    });

    // First, check for existing records to prevent duplicates
    console.log(`/api/copy-records: Checking for existing records in target year ${targetYear}`);
    const recordIds = records.map((r: CopyRecord) => Number(r.id));
    
    const existingRecords = await countsModel.findMany({
      where: {
        [listRefField]: { in: recordIds },
        year: targetYear
      },
      select: {
        [listRefField]: true,
        year: true,
        id: true
      }
    });
    
    if (existingRecords.length > 0) {
      const duplicateIds = existingRecords.map((r: any) => r[listRefField]);
      console.log(`/api/copy-records: Found ${existingRecords.length} existing records`, { duplicateIds });
      
      // Check if ALL requested records already exist
      const allRecordsExist = recordIds.every((id: number) => duplicateIds.includes(id));
      
      if (allRecordsExist) {
        // All records already exist - this is success, not an error
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          processed: 0,
          existingCount: existingRecords.length,
          message: `All ${existingRecords.length} record(s) already exist for ${resource} in year ${targetYear}. No copying needed.`,
          duplicateRecords: duplicateIds
        }, { status: 200 });
      } else {
        // Some records exist, some don't - filter out existing records and copy only new ones
        const newRecordIds = recordIds.filter((id: number) => !duplicateIds.includes(id));
        const newRecords = records.filter((r: CopyRecord) => !duplicateIds.includes(Number(r.id)));
        
        console.log(`/api/copy-records: Partial duplicates found. Processing ${newRecords.length} new records, skipping ${duplicateIds.length} existing ones`);
        
        // Store info about partial operation for response
        const isPartialCopy = true;
        const skippedCount = duplicateIds.length;
        const originalRequestCount = recordIds.length;
        
        // Continue processing with filtered records
        return await processRecords(newRecords, resource, targetYear, countsModel, countsField, listRefField, request, isPartialCopy, skippedCount, originalRequestCount);
      }
    }
    
    // Process all records (no duplicates found)
    return await processRecords(records, resource, targetYear, countsModel, countsField, listRefField, request, false, 0, records.length);
  } catch (error: any) {
    console.error("Error in copy-records API:", error);
    return NextResponse.json(
      { error: "Error copying records", detail: error.message },
      { status: 500 }
    );
  }
}

async function processRecords(
  records: CopyRecord[], 
  resource: ResourceType, 
  targetYear: number, 
  countsModel: any, 
  countsField: string, 
  listRefField: string, 
  request: Request,
  isPartialCopy: boolean = false,
  skippedCount: number = 0,
  originalRequestCount: number = 0
) {
  try {
    // Process each record with detailed logging
    const processedRecords = [];
    console.log(`/api/copy-records: Starting to process ${records.length} records`);
    
    // Get the max ID once before processing any records
    let nextId: number;
    try {
      const maxRow = await countsModel.findFirst({
        select: { id: true },
        orderBy: { id: 'desc' },
      });
      nextId = (maxRow?.id || 0) + 1;
      console.log(`/api/copy-records: Starting with ID ${nextId} for new records`);
    } catch (e) {
      console.error('/api/copy-records: Error finding max ID', e);
      throw e;
    }
    
    for (const { id, counts } of records) {
      const idNum = Number(id);
      const val = Number(counts) || 0;
      const yearNum = Number(targetYear);
      
      console.log(`/api/copy-records: Processing record`, { id: idNum, counts: val, year: yearNum });
      
      try {
        // Fetch the original record to get ALL field values
        const originalRecord = await countsModel.findFirst({
          where: {
            [listRefField]: idNum,
            year: { not: yearNum } // Get from a different year
          },
          orderBy: {
            year: 'desc' // Get most recent version
          }
        });
        
        if (!originalRecord) {
          console.warn(`/api/copy-records: No original record found for ${listRefField}=${idNum}. Creating with count only.`);
        }
        
        // Since we've already checked for duplicates, we can directly create new records
        const recordId = nextId++; // increment after use
        console.log(`/api/copy-records: Using ID ${recordId} for new record`);
        
        // Build data object with ALL fields from original record (excluding id, year, updatedat)
        const dataToCreate: any = {
          id: recordId,
          [listRefField]: idNum,
          [countsField]: val, // Use the count from the request (user may have modified it)
          year: yearNum,
          updatedat: new Date(),
          ishidden: originalRecord?.ishidden ?? false,
        };
        
        // Copy additional fields based on resource type
        if (originalRecord) {
          if (resource === 'ebook') {
            // Copy volumes and chapters
            dataToCreate.volumes = originalRecord.volumes ?? null;
            dataToCreate.chapters = originalRecord.chapters ?? null;
          } else if (resource === 'ejournal') {
            // Copy databases
            dataToCreate.dbs = originalRecord.dbs ?? null;
          }
          // AV only has titles, no additional fields to copy
        }
        
        console.log(`/api/copy-records: Creating record with data`, dataToCreate);
        
        // Create with explicit ID
        const newRecord = await countsModel.create({
          data: dataToCreate,
        });
        
        console.log(`/api/copy-records: Successfully created record`, { 
          id: newRecord.id,
          [listRefField]: newRecord[listRefField],
          year: newRecord.year,
          allFields: newRecord
        });
        
        // 🆕 Copy language associations for this record
        if (resource === 'av') {
          const existingLanguages = await db.list_AV_Language.findMany({
            where: { listav_id: idNum }
          });
          
          if (existingLanguages.length > 0) {
            console.log(`/api/copy-records: Copying ${existingLanguages.length} language associations for AV ${idNum}`);
            await db.list_AV_Language.createMany({
              data: existingLanguages.map(lang => ({
                listav_id: idNum,
                language_id: lang.language_id
              })),
              skipDuplicates: true
            });
          }
        } else if (resource === 'ebook') {
          const existingLanguages = await db.list_EBook_Language.findMany({
            where: { listebook_id: idNum }
          });
          
          if (existingLanguages.length > 0) {
            console.log(`/api/copy-records: Copying ${existingLanguages.length} language associations for EBook ${idNum}`);
            await db.list_EBook_Language.createMany({
              data: existingLanguages.map(lang => ({
                listebook_id: idNum,
                language_id: lang.language_id
              })),
              skipDuplicates: true
            });
          }
        } else if (resource === 'ejournal') {
          const existingLanguages = await db.list_EJournal_Language.findMany({
            where: { listejournal_id: idNum }
          });
          
          if (existingLanguages.length > 0) {
            console.log(`/api/copy-records: Copying ${existingLanguages.length} language associations for EJournal ${idNum}`);
            await db.list_EJournal_Language.createMany({
              data: existingLanguages.map(lang => ({
                listejournal_id: idNum,
                language_id: lang.language_id
              })),
              skipDuplicates: true
            });
          }
        }
        
        processedRecords.push(newRecord);
      } catch (e: any) {
        console.error(`/api/copy-records: Error creating record for ${idNum}`, e);
        throw e;
      }
    }
    
    console.log(`/api/copy-records: Successfully processed ${processedRecords.length} records`);
    
    // Map resource to correct table name (case-sensitive)
    let tableName: string;
    switch (resource) {
      case "av":
        tableName = "List_AV_Counts";
        break;
      case "ebook":
        tableName = "List_EBook_Counts";
        break;
      case "ejournal":
        tableName = "List_EJournal_Counts";
        break;
      default:
        tableName = `List_${resource}_Counts`;
    }
    
    // 🔧 FIX SEQUENCES after manual ID insertion
    if (processedRecords.length > 0) {
      console.log(`/api/copy-records: Fixing sequence for ${tableName} after copy operation`);
      
      try {
        await fixSequenceForTable(tableName);
        console.log(`/api/copy-records: ✅ Sequence fixed for ${tableName}`);
      } catch (seqError) {
        console.error(`/api/copy-records: ❌ Failed to fix sequence for ${tableName}:`, seqError);
        // Don't fail the whole operation for sequence fix errors
      }
    }
    
    // Log successful copy operation
    await logUserAction(
      'CREATE',
      tableName, // Use the same corrected table name
      undefined, // recordId
      undefined, // oldValues
      { 
        resource, 
        targetYear, 
        processedCount: processedRecords.length,
        records: records.map((r: CopyRecord) => ({ id: r.id, counts: r.counts }))
      },
      true, // success
      undefined, // errorMessage
      request
    );
    
    // Return appropriate response based on whether this was a partial copy
    if (isPartialCopy) {
      return NextResponse.json({ 
        processed: processedRecords.length,
        isPartialCopy: true,
        skippedCount: skippedCount,
        totalRequested: originalRequestCount,
        message: `Partial copy completed: ${processedRecords.length} new record(s) copied, ${skippedCount} already existed in year ${targetYear}.`
      }, { status: 200 });
    } else {
      return NextResponse.json({ processed: processedRecords.length }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error copying records:", error);
    
    // Log failed copy operation
    await logUserAction(
      'CREATE',
      'copy_records_operation',
      undefined, // recordId
      undefined, // oldValues
      undefined, // newValues
      false, // success
      error instanceof Error ? error.message : 'Unknown error',
      request
    );
    
    return NextResponse.json(
      { error: "Error copying records" },
      { status: 500 }
    );
  }
}
