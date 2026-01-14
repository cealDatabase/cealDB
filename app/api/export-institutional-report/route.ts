import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import db from "@/lib/db";

interface FormData {
  [key: string]: any;
}

const FORM_TABLES = {
  monographic: "List_Monographic",
  volumeHoldings: "List_Volume_Holdings",
  serials: "List_Serials",
  otherHoldings: "List_Other_Holdings",
  unprocessed: "List_Unprocessed",
  fiscal: "List_Fiscal",
  personnel: "List_Personnel",
  publicServices: "List_Public_Services",
  electronic: "List_Electronic",
  electronicBooks: "List_Electronic_Books",
};

const FORM_NAMES = {
  monographic: "1. Monographic Acquisitions",
  volumeHoldings: "2. Physical Volume Holdings",
  serials: "3. Serial Titles",
  otherHoldings: "4. Holdings of Other Materials",
  unprocessed: "5. Unprocessed BackLog Materials",
  fiscal: "6. Fiscal Support",
  personnel: "7. Personnel Support",
  publicServices: "8. Public Services",
  electronic: "9. Electronic",
  electronicBooks: "10. Electronic Books",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { libraryId, years, forms } = body;

    if (!libraryId || !years || !forms || years.length === 0 || forms.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const library = await db.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) {
      return NextResponse.json(
        { error: "Library not found" },
        { status: 404 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CEAL Statistics Database";
    workbook.created = new Date();

    for (const formId of forms) {
      const tableName = FORM_TABLES[formId as keyof typeof FORM_TABLES];
      const formName = FORM_NAMES[formId as keyof typeof FORM_NAMES];

      if (!tableName) continue;

      const worksheet = workbook.addWorksheet(formName, {
        properties: { defaultColWidth: 20 },
      });

      const formData: FormData[] = [];

      for (const year of years) {
        const libraryYear = await db.library_Year.findFirst({
          where: {
            library: libraryId,
            year: parseInt(year),
          },
        });

        if (!libraryYear) continue;

        let data: any = null;

        switch (formId) {
          case "monographic":
            data = await db.monographic_Acquisitions.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "volumeHoldings":
            data = await db.volume_Holdings.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "serials":
            data = await db.serials.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "otherHoldings":
            data = await db.other_Holdings.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "unprocessed":
            data = await db.unprocessed_Backlog_Materials.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "fiscal":
            data = await db.fiscal_Support.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "personnel":
            data = await db.personnel_Support.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "publicServices":
            data = await db.public_Services.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "electronic":
            data = await db.electronic.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
          case "electronicBooks":
            data = await db.electronic_Books.findFirst({
              where: { libraryyear: libraryYear.id },
            });
            break;
        }

        if (data) {
          formData.push({ ...data, year });
        }
      }

      if (formData.length > 0) {
        const headers = Object.keys(formData[0]).filter(
          (key) => !["id", "libraryyear"].includes(key)
        );

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" },
        };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };

        formData.forEach((row) => {
          const rowData = headers.map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            return value;
          });
          worksheet.addRow(rowData);
        });

        worksheet.columns.forEach((column) => {
          let maxLength = 10;
          column.eachCell?.({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value?.toString() || "";
            maxLength = Math.max(maxLength, cellValue.length);
          });
          column.width = Math.min(maxLength + 2, 50);
        });
      } else {
        worksheet.addRow(["No data available for selected years"]);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `${library.library_name.replace(/[^a-z0-9]/gi, "_")}_Report_${years.join("-")}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating institutional report:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
