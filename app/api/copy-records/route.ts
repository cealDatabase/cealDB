import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResourceType, CopyRecord, RESOURCE_TYPES } from "@/lib/copyRecords";
import { logUserAction } from "@/lib/auditLogger";

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
      
      return NextResponse.json({
        error: "Duplicate records found",
        detail: `Records already exist for ${resource} in year ${targetYear}. Cannot copy existing records.`,
        duplicateRecords: duplicateIds,
        totalDuplicates: existingRecords.length
      }, { status: 409 }); // Conflict status
    }
    
    // Process each record with detailed logging
    const processedRecords = [];
    console.log(`/api/copy-records: No duplicates found. Starting to process ${records.length} records`);
    
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
        // Since we've already checked for duplicates, we can directly create new records
        const recordId = nextId++; // increment after use
        console.log(`/api/copy-records: Using ID ${recordId} for new record`);
        
        // Create with explicit ID
        const newRecord = await countsModel.create({
          data: {
            id: recordId,
            [listRefField]: idNum,
            [countsField]: val,
            year: yearNum,
            updatedat: new Date(),
            ishidden: false,
          },
        });
        
        console.log(`/api/copy-records: Successfully created record`, { 
          id: newRecord.id,
          [listRefField]: newRecord[listRefField],
          year: newRecord.year
        });
        
        processedRecords.push(newRecord);
      } catch (e: any) {
        console.error(`/api/copy-records: Error creating record for ${idNum}`, e);
        throw e;
      }
    }
    
    console.log(`/api/copy-records: Successfully processed ${processedRecords.length} records`);
    
    // Log successful copy operation
    await logUserAction(
      'CREATE',
      `List_${resource.charAt(0).toUpperCase() + resource.slice(1)}_Counts`,
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
    
    return NextResponse.json({ processed: processedRecords.length }, { status: 200 });
  } catch (error) {
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
