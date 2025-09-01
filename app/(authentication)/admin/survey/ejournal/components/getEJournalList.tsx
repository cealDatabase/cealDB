import {
  getListEJournalCountsByYear,
  getListEJournalByID,
  getLanguageIdByListEJournalId,
  getSubscriberIdByListEJournalId,
  getLibraryById,
  getLanguageById,
} from "@/data/fetchPrisma";
import { z } from "zod";
import { listEJournalSchema } from "../data/schema";

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

        sub_series_number: ej.sub_series_number,
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
