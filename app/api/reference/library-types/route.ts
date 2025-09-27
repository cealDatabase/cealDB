import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const types = await prisma.reflibrarytype.findMany({
      orderBy: {
        librarytype: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: types,
    });

  } catch (error) {
    console.error('Error fetching library types:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch library types",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
