import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // adjust if your prisma path is different

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { id, title, counts, notes, publisher } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const updatedAV = await db.list_AV.update({
      where: { id },
      data: {
        title,
        notes,
        publisher,
      },
    });

    return NextResponse.json({ success: true, data: updatedAV });
  } catch (err) {
    console.error("Update Error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
