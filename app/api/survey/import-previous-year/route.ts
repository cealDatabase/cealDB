/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma model names are selected from the validated RESOURCE_CONFIG allow-list. */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { logUserAction } from "@/lib/auditLogger";

type Resource = "av" | "ebook" | "ejournal";

type ResourceConfig = {
  listModel: "list_AV" | "list_EBook" | "list_EJournal";
  countModel: "list_AV_Counts" | "list_EBook_Counts" | "list_EJournal_Counts";
  countRelation: "List_AV_Counts" | "List_EBook_Counts" | "List_EJournal_Counts";
  languageRelation: "List_AV_Language" | "List_EBook_Language" | "List_EJournal_Language";
  languageModel: "list_AV_Language" | "list_EBook_Language" | "list_EJournal_Language";
  listRelation: "List_AV" | "List_EBook" | "List_EJournal";
  listReference: "listav" | "listebook" | "listejournal";
  languageReference: "listav_id" | "listebook_id" | "listejournal_id";
  fields: string[];
  countFields: string[];
  path: "avdb" | "ebook" | "ejournal";
};

const RESOURCE_CONFIG: Record<Resource, ResourceConfig> = {
  av: {
    listModel: "list_AV",
    countModel: "list_AV_Counts",
    countRelation: "List_AV_Counts",
    languageRelation: "List_AV_Language",
    languageModel: "list_AV_Language",
    listRelation: "List_AV",
    listReference: "listav",
    languageReference: "listav_id",
    fields: ["type", "title", "cjk_title", "romanized_title", "subtitle", "publisher", "description", "notes", "data_source"],
    countFields: ["titles", "ishidden"],
    path: "avdb",
  },
  ebook: {
    listModel: "list_EBook",
    countModel: "list_EBook_Counts",
    countRelation: "List_EBook_Counts",
    languageRelation: "List_EBook_Language",
    languageModel: "list_EBook_Language",
    listRelation: "List_EBook",
    listReference: "listebook",
    languageReference: "listebook_id",
    fields: ["title", "sub_series_number", "publisher", "description", "notes", "subtitle", "cjk_title", "romanized_title", "data_source"],
    countFields: ["titles", "volumes", "chapters", "ishidden"],
    path: "ebook",
  },
  ejournal: {
    listModel: "list_EJournal",
    countModel: "list_EJournal_Counts",
    countRelation: "List_EJournal_Counts",
    languageRelation: "List_EJournal_Language",
    languageModel: "list_EJournal_Language",
    listRelation: "List_EJournal",
    listReference: "listejournal",
    languageReference: "listejournal_id",
    fields: ["title", "sub_series_number", "publisher", "description", "notes", "subtitle", "series", "vendor", "cjk_title", "romanized_title", "data_source"],
    countFields: ["journals", "dbs", "ishidden"],
    path: "ejournal",
  },
};

const pick = (source: Record<string, unknown>, fields: string[]) =>
  Object.fromEntries(fields.map((field) => [field, source[field] ?? null]));

// Imports the previous year's catalogue into the selected year. Global entries
// retain their shared catalogue row; institution-created entries receive a new
// row belonging to that institution's target Library_Year.
export async function POST(request: Request) {
  if (!(await requireRoles(1, 3))) {
    return NextResponse.json({ error: "Only Super Admin and E-Resource Editor can import entries." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const resource = body.resource as Resource;
    const targetYear = Number(body.targetYear);
    const config = RESOURCE_CONFIG[resource];

    if (!config) {
      return NextResponse.json({ error: "Invalid resource." }, { status: 400 });
    }
    if (!Number.isInteger(targetYear) || targetYear < 1) {
      return NextResponse.json({ error: "targetYear must be a valid year." }, { status: 400 });
    }

    const sourceYear = targetYear - 1;
    const result = await db.$transaction(async (tx) => {
      const listModel = (tx as any)[config.listModel];
      const countModel = (tx as any)[config.countModel];
      const sourceEntries = await listModel.findMany({
        where: {
          OR: [{ is_global: true }, { libraryyear: { not: null } }],
          [config.countRelation]: { some: { year: sourceYear } },
        },
        include: {
          [config.countRelation]: { where: { year: sourceYear } },
          [config.languageRelation]: true,
          Library_Year: { select: { library: true } },
        },
      });

      const targetLibraryYears = new Map<number, number>();
      let globalCreated = 0;
      let localCreated = 0;
      let skipped = 0;

      for (const entry of sourceEntries as Record<string, any>[]) {
        const sourceCount = entry[config.countRelation][0];
        if (!sourceCount) continue;

        if (entry.is_global === true) {
          const exists = await countModel.findFirst({
            where: { [config.listReference]: entry.id, year: targetYear },
            select: { id: true },
          });
          if (exists) {
            skipped++;
            continue;
          }
          await countModel.create({
            data: {
              [config.listReference]: entry.id,
              year: targetYear,
              updatedat: new Date(),
              ...pick(sourceCount, config.countFields),
            },
          });
          globalCreated++;
          continue;
        }

        const libraryId = entry.Library_Year?.library;
        if (!libraryId) {
          skipped++;
          continue;
        }

        let targetLibraryYearId = targetLibraryYears.get(libraryId);
        if (!targetLibraryYearId) {
          const existingLibraryYear = await tx.library_Year.findFirst({
            where: { library: libraryId, year: targetYear },
            select: { id: true },
          });
          targetLibraryYearId = existingLibraryYear?.id ?? (
            await tx.library_Year.create({
              data: {
                library: libraryId,
                year: targetYear,
                updated_at: new Date(),
                is_active: true,
                is_open_for_editing: false,
              },
              select: { id: true },
            })
          ).id;
          targetLibraryYears.set(libraryId, targetLibraryYearId);
        }

        // There is no source-id column on the legacy catalogue tables.  The
        // target institution plus the full catalogue identity is therefore
        // used as the idempotency key, so a second click does not clone rows.
        const identity = pick(entry, config.fields);
        const existing = await listModel.findFirst({
          where: { libraryyear: targetLibraryYearId, is_global: false, ...identity },
          select: { id: true },
        });
        if (existing) {
          skipped++;
          continue;
        }

        const newEntry = await listModel.create({
          data: {
            ...identity,
            is_global: false,
            libraryyear: targetLibraryYearId,
            updated_at: new Date(),
          },
          select: { id: true },
        });
        await countModel.create({
          data: {
            [config.listReference]: newEntry.id,
            year: targetYear,
            updatedat: new Date(),
            ...pick(sourceCount, config.countFields),
          },
        });
        const languages = entry[config.languageRelation] as Record<string, any>[];
        if (languages.length) {
          await (tx as any)[config.languageModel].createMany({
            data: languages.map((language) => ({
              [config.languageReference]: newEntry.id,
              language_id: language.language_id,
            })),
            skipDuplicates: true,
          });
        }
        await (tx as any)[`libraryYear_${config.listModel === "list_AV" ? "ListAV" : config.listModel === "list_EBook" ? "ListEBook" : "ListEJournal"}`].create({
          // This Prisma 7 client requires both sides of the junction row as
          // relation connects; its scalar foreign-key input is not enabled.
          data: {
            Library_Year: { connect: { id: targetLibraryYearId } },
            [config.listRelation]: { connect: { id: newEntry.id } },
          },
        });
        localCreated++;
      }

      return { globalCreated, localCreated, skipped, sourceEntries: sourceEntries.length };
    }, {
      // A yearly catalogue can contain hundreds of entries, each with counts,
      // languages, and (for local entries) an institution relation. Prisma's
      // default interactive-transaction budget is only five seconds.
      maxWait: 10_000,
      timeout: 120_000,
    });

    await logUserAction("IMPORT", config.listModel, String(targetYear), undefined, {
      resource,
      sourceYear,
      targetYear,
      ...result,
    }, true, undefined, request);
    revalidatePath(`/admin/survey/${config.path}/${targetYear}`);

    return NextResponse.json({ success: true, sourceYear, targetYear, ...result });
  } catch (error: any) {
    console.error("Previous-year catalogue import failed:", error);
    return NextResponse.json({ error: "Could not import the previous year's entries.", detail: error?.message }, { status: 500 });
  }
}
