import { NextResponse } from "next/server";
import { copyRecords } from "@/lib/copyRecords";

export async function POST(req: Request) {
  try {
    const { targetYear, records } = await req.json();
    if (typeof targetYear !== "number" || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await copyRecords("ebook", targetYear, records);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Copy Ebook records error:", err);
    return NextResponse.json({ error: "Failed to copy Ebook records." }, { status: 500 });
  }
}
