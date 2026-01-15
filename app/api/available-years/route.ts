import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const years = await db.library_Year.findMany({
      select: {
        year: true,
      },
      distinct: ['year'],
      orderBy: {
        year: 'desc',
      },
      where: {
        year: {
          not: 1900,
        },
      },
    });

    const yearList = years.map((y: { year: number }) => y.year.toString());

    return NextResponse.json({
      success: true,
      years: yearList,
    });
  } catch (error) {
    console.error("Error fetching available years:", error);
    return NextResponse.json(
      { error: "Failed to fetch available years" },
      { status: 500 }
    );
  }
}
