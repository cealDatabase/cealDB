import db from "@/lib/db";

export type FormKey =
  | "monographic"
  | "volumeHoldings"
  | "serials"
  | "otherHoldings"
  | "unprocessed"
  | "fiscal"
  | "personnel"
  | "public-services"
  | "electronic"
  | "electronicBooks";

const fieldMap: Record<FormKey, string> = {
  monographic: "monographic_acquisitions",
  volumeHoldings: "volume_holdings",
  serials: "serials",
  otherHoldings: "other_holdings",
  unprocessed: "unprocessed_backlog_materials",
  fiscal: "fiscal_support",
  personnel: "personnel_support_fte",
  "public-services": "public_services",
  electronic: "electronic",
  electronicBooks: "electronic_books",
};

export async function markEntryStatus(libraryYearId: number, form: FormKey) {
  const field = fieldMap[form];
  if (!field) return;

  try {
    await db.entry_Status.upsert({
      where: { libraryyear: libraryYearId },
      update: { [field]: true } as any,
      create: { libraryyear: libraryYearId, [field]: true } as any,
    });
  } catch (error: any) {
    // Handle possible sequence drift on id causing P2002 unique constraint on (id)
    if (error?.code === 'P2002') {
      try {
        // Align the sequence with the current max(id) for Entry_Status
        await db.$executeRawUnsafe(
          'SELECT setval(pg_get_serial_sequence(' +
          "'\"Entry_Status\"', 'id'), COALESCE((SELECT MAX(id) FROM \"Entry_Status\"), 0))"
        );
        // Retry once after fixing sequence
        await db.entry_Status.upsert({
          where: { libraryyear: libraryYearId },
          update: { [field]: true } as any,
          create: { libraryyear: libraryYearId, [field]: true } as any,
        });
      } catch (inner: any) {
        throw inner;
      }
    } else {
      throw error;
    }
  }
}
