import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const prisma = db;

interface QuickViewData {
  id: number;
  library_name: string;
  grand_total_materials: number | null;
  chn_volumes: number | null;
  jpn_volumes: number | null;
  kor_volumes: number | null;
  total_physical: number | null;
  volumes_added: number | null;
  ebook_total: number | null;
  vol_total: number | null;
  serial_titles: number | null;
  other_materials_pct: number | null;
  personnel_support: number | null;
}

// Helper function to safely add nullable numbers
function sumNullable(...values: (number | null | undefined)[]): number | null {
  const validValues = values.filter(
    (v): v is number => v !== null && v !== undefined && !isNaN(v),
  );
  if (validValues.length === 0) return null;
  return validValues.reduce((sum, v) => sum + v, 0);
}

/**
 * GET /api/statistics/quickview?year=2024
 * Fetches aggregated quick view data for all institutions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam) : 2024;
    const institutionsParam = searchParams.get("institutions");
    const institutionIds = institutionsParam
      ? institutionsParam
          .split(",")
          .map((id) => parseInt(id))
          .filter(Boolean)
      : [];

    // Fetch all libraries with their data for the specified year
    const libraries = await prisma.library.findMany({
      where:
        institutionIds.length > 0 ? { id: { in: institutionIds } } : undefined,
      select: {
        id: true,
        library_name: true,
        Library_Year: {
          where: {
            year: year,
          },
          select: {
            id: true,
            Volume_Holdings: {
              select: {
                vhprevious_year_chinese: true,
                vhprevious_year_japanese: true,
                vhprevious_year_korean: true,
                vhprevious_year_noncjk: true,
                vhadded_gross_chinese: true,
                vhadded_gross_japanese: true,
                vhadded_gross_korean: true,
                vhadded_gross_noncjk: true,
                vhadded_gross_subtotal: true,
                vhgrandtotal: true,
              },
            },
            Electronic_Books: {
              select: {
                ebooks_total_volumes: true,
              },
            },
            Serials: {
              select: {
                sgrandtotal: true,
                s_egrandtotal: true,
                spurchased_chinese: true,
                spurchased_japanese: true,
                spurchased_korean: true,
                spurchased_noncjk: true,
                snonpurchased_chinese: true,
                snonpurchased_japanese: true,
                snonpurchased_korean: true,
                snonpurchased_noncjk: true,
              },
            },
            Other_Holdings: {
              select: {
                ohgrandtotal: true,
              },
            },
            Personnel_Support: {
              select: {
                psftotal: true,
              },
            },
          },
        },
      },
      orderBy: {
        library_name: "asc",
      },
    });

    // Transform data into quick view format
    const quickViewData: QuickViewData[] = libraries.map((library) => {
      const libYear = library.Library_Year[0];

      if (!libYear) {
        // Return empty row if no data for this year
        return {
          id: library.id,
          library_name: library.library_name,
          grand_total_materials: null,
          chn_volumes: null,
          jpn_volumes: null,
          kor_volumes: null,
          total_physical: null,
          volumes_added: null,
          ebook_total: null,
          vol_total: null,
          serial_titles: null,
          other_materials_pct: null,
          personnel_support: null,
        };
      }

      const volumeHoldings = libYear.Volume_Holdings;
      const electronicBooks = libYear.Electronic_Books;
      const serials = libYear.Serials;
      const otherHoldings = libYear.Other_Holdings;
      const personnel = libYear.Personnel_Support;

      // Calculate derived values from Volume_Holdings
      // Previous year + added = current year holdings
      const chnVolumes = sumNullable(
        volumeHoldings?.vhprevious_year_chinese,
        volumeHoldings?.vhadded_gross_chinese,
      );
      const jpnVolumes = sumNullable(
        volumeHoldings?.vhprevious_year_japanese,
        volumeHoldings?.vhadded_gross_japanese,
      );
      const korVolumes = sumNullable(
        volumeHoldings?.vhprevious_year_korean,
        volumeHoldings?.vhadded_gross_korean,
      );

      // Use vhgrandtotal as the total physical volumes held
      const totalPhysical = volumeHoldings?.vhgrandtotal ?? null;
      const volumesAdded = volumeHoldings?.vhadded_gross_subtotal ?? null;
      const ebookTotal = electronicBooks?.ebooks_total_volumes ?? null;

      // Vol. Total = physical + e-books
      const volTotal = sumNullable(totalPhysical, ebookTotal);

      // Grand Total Materials = physical volumes + e-books + other materials
      const otherMaterials = otherHoldings?.ohgrandtotal ?? 0;
      const grandTotalMaterials =
        totalPhysical !== null
          ? (totalPhysical || 0) + (ebookTotal || 0) + otherMaterials
          : null;

      // Calculate other materials percentage
      let otherMaterialsPct: number | null = null;
      if (
        grandTotalMaterials !== null &&
        grandTotalMaterials > 0 &&
        otherMaterials > 0
      ) {
        otherMaterialsPct = (otherMaterials / grandTotalMaterials) * 100;
      }

      // Calculate total serial titles (print + electronic)
      const serialTotal = sumNullable(
        serials?.sgrandtotal,
        serials?.s_egrandtotal,
      );

      return {
        id: library.id,
        library_name: library.library_name,
        grand_total_materials: grandTotalMaterials,
        chn_volumes: chnVolumes,
        jpn_volumes: jpnVolumes,
        kor_volumes: korVolumes,
        total_physical: totalPhysical,
        volumes_added: volumesAdded,
        ebook_total: ebookTotal,
        vol_total: volTotal,
        serial_titles: serialTotal,
        other_materials_pct: otherMaterialsPct,
        personnel_support: personnel?.psftotal ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: quickViewData,
      year,
      count: quickViewData.length,
    });
  } catch (error) {
    console.error("Error fetching quick view data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quick view data",
      },
      { status: 500 },
    );
  }
  // Don't disconnect - using singleton pattern
}
