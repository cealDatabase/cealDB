import { NextResponse } from "next/server";
import db from "@/lib/db";

interface CopyRequestBody {
  targetYear: number;
  records: { id: number; counts: number }[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CopyRequestBody;
    const { targetYear, records } = body;

    if (!Array.isArray(records) || typeof targetYear !== "number") {
      return NextResponse.json(
        { error: "Invalid payload." },
        { status: 400 }
      );
    }

    await Promise.all(
      records.map(async ({ id, counts }) => {
        // Ensure we are working with numbers
        const listavId = Number(id);
        const titlesCount = Number(counts) || 0;

        // Check if a counts record already exists for this listav/year
        const existing = await db.list_AV_Counts.findFirst({
          where: {
            listav: listavId,
            year: targetYear,
          },
        });

        if (existing) {
          // Update titles if it already exists
          await db.list_AV_Counts.update({
            where: { id: existing.id },
            data: {
              titles: titlesCount,
              updatedat: new Date(),
              ishidden: false,
            },
          });
        } else {
          // Otherwise create a new record
          try {
            await db.list_AV_Counts.create({
              data: {
                listav: listavId,
                titles: titlesCount,
                year: targetYear,
                updatedat: new Date(),
                ishidden: false,
              },
            });
          } catch (err: any) {
            // Handle unique constraint race condition or schema uniqueness by falling back to update
            if (err?.code === "P2002") {
              await db.list_AV_Counts.updateMany({
                where: {
                  listav: listavId,
                  year: targetYear,
                },
                data: {
                  titles: titlesCount,
                  updatedat: new Date(),
                  ishidden: false,
                },
              });
            } else {
              throw err;
            }
          }
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Copy AV records error:", error);
    return NextResponse.json(
      { error: "Failed to copy AV records." },
      { status: 500 }
    );
  }
}
