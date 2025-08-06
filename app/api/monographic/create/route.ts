// /app/api/monographic/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Creating Monographic record with body:", body);

    const {
      entryid,
      mapurchased_titles_chinese,
      mapurchased_titles_japanese,
      mapurchased_titles_korean,
      mapurchased_titles_noncjk,
      mapurchased_titles_subtotal,
      mapurchased_volumes_chinese,
      mapurchased_volumes_japanese,
      mapurchased_volumes_korean,
      mapurchased_volumes_noncjk,
      mapurchased_volumes_subtotal,
      manonpurchased_titles_chinese,
      manonpurchased_titles_japanese,
      manonpurchased_titles_korean,
      manonpurchased_titles_noncjk,
      manonpurchased_titles_subtotal,
      manonpurchased_volumes_chinese,
      manonpurchased_volumes_japanese,
      manonpurchased_volumes_korean,
      manonpurchased_volumes_noncjk,
      manonpurchased_volumes_subtotal,
      matotal_titles,
      matotal_volumes,
      manotes,
      libraryyear, // should be a number
    } = body;

    // ✅ Validate required fields
    if (!libraryyear || isNaN(Number(libraryyear))) {
      return NextResponse.json(
        { error: "Missing or invalid libraryyear" },
        { status: 400 }
      );
    }

    // ✅ Optional: confirm related records exist
    const existingYear = await db.library_Year.findUnique({
      where: { id: Number(libraryyear) },
    });
    if (!existingYear) {
      return NextResponse.json(
        { error: "libraryyear ID does not exist" },
        { status: 404 }
      );
    }

    // ✅ Create monographic acquisitions record
    const newMonographic = await db.monographic_Acquisitions.create({
      data: {
        entryid: entryid || null,
        mapurchased_titles_chinese: Number(mapurchased_titles_chinese) || null,
        mapurchased_titles_japanese: Number(mapurchased_titles_japanese) || null,
        mapurchased_titles_korean: Number(mapurchased_titles_korean) || null,
        mapurchased_titles_noncjk: Number(mapurchased_titles_noncjk) || null,
        mapurchased_titles_subtotal: Number(mapurchased_titles_subtotal) || null,
        mapurchased_volumes_chinese: Number(mapurchased_volumes_chinese) || null,
        mapurchased_volumes_japanese: Number(mapurchased_volumes_japanese) || null,
        mapurchased_volumes_korean: Number(mapurchased_volumes_korean) || null,
        mapurchased_volumes_noncjk: Number(mapurchased_volumes_noncjk) || null,
        mapurchased_volumes_subtotal: Number(mapurchased_volumes_subtotal) || null,
        manonpurchased_titles_chinese: Number(manonpurchased_titles_chinese) || null,
        manonpurchased_titles_japanese: Number(manonpurchased_titles_japanese) || null,
        manonpurchased_titles_korean: Number(manonpurchased_titles_korean) || null,
        manonpurchased_titles_noncjk: Number(manonpurchased_titles_noncjk) || null,
        manonpurchased_titles_subtotal: Number(manonpurchased_titles_subtotal) || null,
        manonpurchased_volumes_chinese: Number(manonpurchased_volumes_chinese) || null,
        manonpurchased_volumes_japanese: Number(manonpurchased_volumes_japanese) || null,
        manonpurchased_volumes_korean: Number(manonpurchased_volumes_korean) || null,
        manonpurchased_volumes_noncjk: Number(manonpurchased_volumes_noncjk) || null,
        manonpurchased_volumes_subtotal: Number(manonpurchased_volumes_subtotal) || null,
        matotal_titles: Number(matotal_titles) || null,
        matotal_volumes: Number(matotal_volumes) || null,
        manotes: manotes || null,
        libraryyear: Number(libraryyear),
      },
    });

    // ✅ Return response
    return NextResponse.json({ 
      success: true, 
      data: newMonographic,
      message: "Monographic acquisitions record created successfully"
    });
  } catch (error: any) {
    console.error("API error (create monographic):", error);

    return NextResponse.json(
      { error: "Failed to create monographic record", detail: error?.message },
      { status: 500 }
    );
  }
}
