import { z } from "zod"

export const listEJournalSchema = z.object({
  id: z.number(),
  title: z.string(),
  counts: z.number(),
  sub_series_number: z.string().nullish(),
  publisher: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  updated_at: z.string().nullish(),
  subtitle: z.string().nullish(),
  series: z.string().nullish(),
  vendor: z.string().nullish(),
  cjk_title: z.string().nullish(),
  romanized_title: z.string().nullish(),
  data_source: z.string().nullish(),
  libraryyear: z.number().nullish(),
  is_global: z.boolean(),
  subscribers: z.array(z.string()),
  language: z.array(z.string()),
})

export type listEJournal = z.infer<typeof listEJournalSchema>
