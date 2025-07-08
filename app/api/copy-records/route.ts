import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ResourceType, CopyRecord, RESOURCE_TYPES } from "@/lib/copyRecords";

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
        // First try to update existing row
        console.log(`/api/copy-records: Attempting update for record ${idNum}`);
        const updateRes = await countsModel.updateMany({
          where: { [listRefField]: idNum, year: yearNum },
          data: { [countsField]: val, updatedat: new Date(), ishidden: false },
        });
        
        console.log(`/api/copy-records: Update result for ${idNum}`, { updated: updateRes.count });
        
        // If no row existed, create one
        if (updateRes.count === 0) {
          console.log(`/api/copy-records: No existing record found for ${idNum}, creating new`);
          
          try {
            // Use the pre-calculated nextId 
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
        } else {
          console.log(`/api/copy-records: Updated existing record for ${idNum}`);
          processedRecords.push({ id: idNum, updated: true });
        }
      } catch (e: any) {
        console.error(`/api/copy-records: Error processing record ${idNum}`, e);
        throw e;
      }
    }
    
    console.log(`/api/copy-records: Successfully processed ${processedRecords.length} records`);
    return NextResponse.json({ processed: processedRecords.length }, { status: 200 });
  } catch (error) {
    console.error("Error copying records:", error);
    return NextResponse.json(
      { error: "Error copying records" },
      { status: 500 }
    );
  }
}
