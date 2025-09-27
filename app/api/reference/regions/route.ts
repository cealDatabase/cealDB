import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const regions = await prisma.reflibraryregion.findMany({
      orderBy: {
        libraryregion: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: regions,
    });

  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch regions",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
