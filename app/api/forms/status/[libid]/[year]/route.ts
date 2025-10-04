import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ libid: string; year: string }> }
) {
  try {
    const { libid, year } = await params;

    // Validate required fields
    if (!libid || isNaN(Number(libid)) || !year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID or year" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = Number(year);

    // Find Library_Year record for the library and year
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
      include: {
        Monographic_Acquisitions: true,
        Volume_Holdings: true,
        Serials: true,
        Other_Holdings: true,
        Unprocessed_Backlog_Materials: true,
        Fiscal_Support: true,
        Personnel_Support: true,
        Public_Services: true,
        Electronic: true,
        Electronic_Books: true,
      },
    });

    if (!libraryYear) {
      return NextResponse.json(
        { error: `Library year ${currentYear} not found for library ${libraryId}` },
        { status: 404 }
      );
    }

    // Map form names to their submission status and Library_Year closure status
    const formStatus = {
      isFormsClosed: !libraryYear.is_open_for_editing, // Forms are closed if not open for editing
      closingDate: libraryYear.closing_date,
      forms: {
        monographic: {
          submitted: !!libraryYear.Monographic_Acquisitions,
          recordId: libraryYear.Monographic_Acquisitions?.id || null,
        },
        volumeHoldings: {
          submitted: !!libraryYear.Volume_Holdings,
          recordId: libraryYear.Volume_Holdings?.id || null,
        },
        serials: {
          submitted: !!libraryYear.Serials,
          recordId: libraryYear.Serials?.id || null,
        },
        otherHoldings: {
          submitted: !!libraryYear.Other_Holdings,
          recordId: libraryYear.Other_Holdings?.id || null,
        },
        unprocessed: {
          submitted: !!libraryYear.Unprocessed_Backlog_Materials,
          recordId: libraryYear.Unprocessed_Backlog_Materials?.id || null,
        },
        fiscal: {
          submitted: !!libraryYear.Fiscal_Support,
          recordId: libraryYear.Fiscal_Support?.id || null,
        },
        personnel: {
          submitted: !!libraryYear.Personnel_Support,
          recordId: libraryYear.Personnel_Support?.id || null,
        },
        "public-services": {
          submitted: !!libraryYear.Public_Services,
          recordId: libraryYear.Public_Services?.id || null,
        },
        electronic: {
          submitted: !!libraryYear.Electronic,
          recordId: libraryYear.Electronic?.id || null,
        },
        electronicBooks: {
          submitted: !!libraryYear.Electronic_Books,
          recordId: libraryYear.Electronic_Books?.id || null,
        },
      },
    };

    // Count how many forms are available (open)
    const totalForms = Object.keys(formStatus.forms).length;
    const submittedCount = Object.values(formStatus.forms).filter(
      (form) => form.submitted
    ).length;

    return NextResponse.json({
      success: true,
      isFormsClosed: formStatus.isFormsClosed,
      closingDate: formStatus.closingDate,
      totalForms,
      submittedCount,
      availableCount: formStatus.isFormsClosed ? 0 : totalForms,
      forms: formStatus.forms,
    });

  } catch (error: any) {
    console.error("API error (get forms status):", error);

    return NextResponse.json(
      { error: "Failed to get forms status", detail: error?.message },
      { status: 500 }
    );
  }
}
