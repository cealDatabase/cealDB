import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First, fetch excluded years from Exclude_Year table
    const excludedYearsData = await prisma.exclude_Year.findMany({
      select: {
        exyear: true,
      },
    });
    
    // Extract years and add 1900 to the exclusion list
    const excludedYears = excludedYearsData.map(item => item.exyear);
    excludedYears.push(1900, 1965, 1972 ); // Always exclude 1900, 1965, and 1972
    
    // Get distinct years from Library_Year table where is_active is true
    const years = await prisma.library_Year.findMany({
      where: {
        is_active: true,
        year: {
          not: { in: excludedYears },  // Exclude years from database table + 1900
        }
      },
      select: {
        year: true,
      },
      distinct: ['year'],
      orderBy: {
        year: 'desc',
      },
    });

    const yearList = years.map(item => item.year);

    return NextResponse.json({
      success: true,
      years: yearList,
    });

  } catch (error) {
    console.error('Error fetching available years:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch available years",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
