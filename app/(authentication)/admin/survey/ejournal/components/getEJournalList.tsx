import {
  getListEJournalCountsByYear,
  getListEJournalByID,
  getLanguageIdByListEJournalId,
  getSubscriberIdByListEJournalId,
  getLibraryById,
  getLanguageById,
  getLibYearByLibIdAndYear,
} from "@/data/fetchPrisma";
import { z } from "zod";
import { listEJournalSchema } from "../data/schema";
import db from "@/lib/db";

/** Extend base schema so we keep per-year fields */
// ⬇️ extend: keep legacy `counts` but make it optional + default
const listEJournalRowSchema = listEJournalSchema.extend({
  counts: z.number().optional().default(0),
  journals: z.number().nullable().optional(),
  dbs: z.number().nullable().optional(),
});

const getEJournalListByYear = async (userSelectedYear: number) => {
  // counts rows: expect listejournal, journals, dbs
  const counts = await getListEJournalCountsByYear(userSelectedYear);

  // Map eJournalId -> { journals, dbs }
  const idToCounts = new Map<number, { journals: number; dbs: number }>();
  counts?.forEach((c: any) => {
    if (c?.listejournal != null) {
      idToCounts.set(c.listejournal, {
        journals: Number.isFinite(c.journals) ? Number(c.journals) : 0,
        dbs: Number.isFinite(c.dbs) ? Number(c.dbs) : 0,
      });
    }
  });

  const ids = [...idToCounts.keys()];
  if (ids.length === 0) return [];

  const outputArray: any[] = [];

  await Promise.all(
    ids.map(async (ejId) => {
      const ej = await getListEJournalByID(ejId);
      if (!ej) return;

      // languages → labels
      const langIds = await getLanguageIdByListEJournalId(ejId);
      const languageArray =
        (
          await Promise.all(
            (langIds ?? []).map(async (id: number) => await getLanguageById(id))
          )
        )
          ?.map((lang) => lang?.short)
          .filter(Boolean) ?? [];

      // subscribers → names
      const subIds = await getSubscriberIdByListEJournalId(
        ejId,
        userSelectedYear
      );
      const subscriberLibraryNames = await Promise.all(
        (subIds ?? []).map(async (subscriberId) => {
          if (subscriberId != null) {
            const library = await getLibraryById(subscriberId);
            return library?.library_name
              ? `- ${library.library_name.trim()} `
              : null;
          }
          return null;
        })
      );
      const uniqueSubscriberLibraryNames = Array.from(
        new Set(subscriberLibraryNames.filter(Boolean))
      ).sort();

      const c = idToCounts.get(ejId);

      outputArray.push({
        id: ejId,
        title: ej.title,

        // ⬇️ per-year fields
        journals: c?.journals ?? 0,
        dbs: c?.dbs ?? 0,

        // ⬅️ keep legacy field so existing Zod/table code is happy
        counts: c?.journals ?? 0,

        publisher: ej.publisher,
        description: ej.description,
        notes: ej.notes,
        updated_at: ej.updated_at.toDateString(),
        subtitle: ej.subtitle,
        series: ej.series,
        vendor: ej.vendor,
        cjk_title: ej.cjk_title,
        romanized_title: ej.romanized_title,
        data_source: ej.data_source,
        libraryyear: ej.libraryyear,
        is_global: ej.is_global,
        subscribers: uniqueSubscriberLibraryNames,
        language: languageArray,
      });
    })
  );

  // de-dupe by id (keeps your original intent, but type-safe)
  const groupedRecords = Array.from(
    new Map<number, (typeof outputArray)[number]>(
      outputArray.map((item) => [item.id as number, item])
    ).values()
  );

  return groupedRecords;
};

export async function GetEJournalList(userSelectedYear: number) {
  const data = await getEJournalListByYear(userSelectedYear);
  // Use the extended schema so journals/dbs are preserved
  return z.array(listEJournalRowSchema).parse(data || []);
}

// Extended schema with user selections
const listEJournalWithSelectionSchema = listEJournalRowSchema.extend({
  is_selected: z.boolean().optional(),
  custom_count: z.number().nullable().optional(),
});

export type listEJournalWithSelection = z.infer<typeof listEJournalWithSelectionSchema>;

/**
 * Get EJournal list with user selections for a specific library
 */
export async function GetEJournalListWithUserSelections(
  userSelectedYear: number,
  libraryId: number
) {
  // Get library_year record and extract id
  const libraryYearRecords = await getLibYearByLibIdAndYear(libraryId, userSelectedYear);
  const libraryYearId = libraryYearRecords && libraryYearRecords.length > 0 
    ? libraryYearRecords[0].id 
    : null;
  
  // Get base EJournal list
  const baseData = await getEJournalListByYear(userSelectedYear);
  
  // Get user selections if libraryYear exists
  let userSelections: Map<number, { is_selected: boolean; custom_count: number | null }> = new Map();
  
  if (libraryYearId) {
    const selections = await db.libraryYear_ListEJournal.findMany({
      where: { libraryyear_id: libraryYearId },
      select: {
        listejournal_id: true,
        is_selected: true,
        custom_count: true,
      },
    });
    
    selections.forEach((sel) => {
      userSelections.set(sel.listejournal_id, {
        is_selected: sel.is_selected ?? false,
        custom_count: sel.custom_count,
      });
    });
  }
  
  // Merge user selections with base data
  const mergedData = baseData.map((item) => {
    const selection = userSelections.get(item.id);
    return {
      ...item,
      is_selected: selection?.is_selected ?? false,
      custom_count: selection?.custom_count ?? null,
    };
  });

  // Dedup global-vs-library-specific twins for this user's library so the
  // user only sees one row per resource. Carry over selection state.
  let displayData = mergedData;
  if (libraryYearId) {
    const groupKey = (it: any) =>
      `${(it.title ?? "").toLowerCase()}_${(it.publisher ?? "").toLowerCase()}_${(it.subtitle ?? "").toLowerCase()}_${(it.series ?? "").toLowerCase()}`;
    const groups = new Map<string, typeof mergedData>();
    for (const item of mergedData) {
      const k = groupKey(item);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(item);
    }
    const kept: typeof mergedData = [];
    for (const group of groups.values()) {
      if (group.length === 1) {
        kept.push(group[0]);
        continue;
      }
      const mine = group.find(
        (g: any) => g.libraryyear === libraryYearId && g.is_global === false
      );
      if (mine) {
        const twinWithState = group.find(
          (g: any) => g !== mine && (g.is_selected || g.custom_count != null)
        );
        if (twinWithState) {
          (mine as any).is_selected = (mine as any).is_selected || (twinWithState as any).is_selected;
          if ((mine as any).custom_count == null) {
            (mine as any).custom_count = (twinWithState as any).custom_count;
          }
        }
        kept.push(mine);
      } else {
        kept.push(...group);
      }
    }
    displayData = kept;
  }

  return z.array(listEJournalWithSelectionSchema).parse(displayData || []);
}
