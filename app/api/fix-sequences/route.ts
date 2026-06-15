// /app/api/fix-sequences/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { verifyJWTToken } from "@/lib/auth";

const CRITICAL_TABLES = [
  "List_AV",
  "List_AV_Counts", 
  "List_EBook",
  "List_EBook_Counts",
  "List_EJournal", 
  "List_EJournal_Counts"
];

async function resetSequenceFor(table: string) {
  try {
    // 1) get max(id)
    const [{ max_id }] = await db.$queryRawUnsafe(
      `SELECT COALESCE(MAX(id), 0) AS max_id FROM "${table}";`
    ) as Array<{ max_id: number }>;

    // 2) set sequence to max(id), mark as "already called"
    const sequenceValue = Number(max_id);
    const isCalled = sequenceValue > 0;
    const setValue = sequenceValue > 0 ? sequenceValue : 1;

    await db.$executeRawUnsafe(
      `SELECT setval(
         pg_get_serial_sequence('"${table}"','id'),
         ${setValue},
         ${isCalled}
       );`
    );

    return {
      table,
      maxId: sequenceValue,
      nextId: sequenceValue + 1,
      status: 'fixed'
    };
  } catch (error) {
    console.error(`Failed to fix sequence for ${table}:`, error);
    return {
      table,
      error: (error as Error).message,
      status: 'error'
    };
  }
}

export async function POST(req: Request) {
  try {
    // Require a valid signed-in session (this route mutates DB sequences)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken || !verifyJWTToken(sessionToken)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔧 Auto-fixing sequences for create pages...");
    
    const results = [];
    for (const table of CRITICAL_TABLES) {
      const result = await resetSequenceFor(table);
      results.push(result);
    }

    const errors = results.filter(r => r.status === 'error');
    const fixed = results.filter(r => r.status === 'fixed');

    console.log(`✅ Fixed ${fixed.length} sequences, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed.length} sequences`,
      results: fixed,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("❌ Sequence fix API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fix sequences",
        detail: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
