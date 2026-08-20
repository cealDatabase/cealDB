import { NextRequest, NextResponse } from "next/server";
import { getUsersWithRoles } from "@/data/fetchPrisma";
import { isSuperAdminDb } from "@/lib/auth";
import { logAuditEvent } from "@/lib/auditLogger";

// GET - Export the full user roster as CSV (Super Admin only).
//
// Authorization deliberately uses isSuperAdminDb() rather than the `role`
// cookie. That cookie is unsigned and therefore forgeable, so it must never
// gate a bulk PII export. isSuperAdminDb() verifies the signed `session` JWT
// and re-checks Users_Roles in the database.
export async function GET(request: NextRequest) {
  try {
    if (!(await isSuperAdminDb())) {
      return NextResponse.json(
        { error: "Unauthorized. Super admin access required." },
        { status: 403 }
      );
    }

    const users = await getUsersWithRoles();

    if (!users) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const headers = [
      "First Name",
      "Last Name",
      "Institution",
      "Email",
      "Role",
    ];

    // Escape CSV fields: wrap in quotes when the value contains a comma,
    // quote, or newline, and double any embedded quotes.
    const escapeCSV = (field: any): string => {
      if (field === null || field === undefined) return "";
      const str = String(field);
      if (str.includes('"') || str.includes(",") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.join(",")];

    for (const user of users) {
      const institutions = (user.User_Library ?? [])
        .map((ul) => ul.Library?.library_name)
        .filter(Boolean)
        .join("; ");

      const roles = (user.User_Roles ?? [])
        .map((ur) => ur.Role?.name)
        .filter(Boolean)
        .join("; ");

      csvRows.push(
        [
          escapeCSV(user.firstname),
          escapeCSV(user.lastname),
          escapeCSV(institutions),
          escapeCSV(user.username),
          escapeCSV(roles),
        ].join(",")
      );
    }

    // Encode as UTF-8 bytes with explicit BOM so Excel always opens CJK
    // institution names correctly.
    const csvString = csvRows.join("\n");
    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csvString);
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const csvContent = new Uint8Array(bom.length + csvBytes.length);
    csvContent.set(bom, 0);
    csvContent.set(csvBytes, bom.length);

    const date = new Date().toISOString().split("T")[0];
    const filename = `CEAL_User_Roster_${date}.csv`;

    await logAuditEvent(
      {
        action: "EXPORT",
        tableName: "User Roster CSV",
        newValues: { format: "csv", recordCount: users.length },
        success: true,
      },
      request
    );

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user roster:", error);
    return NextResponse.json(
      { error: "Failed to export user roster" },
      { status: 500 }
    );
  }
}
