import { z } from "zod"

export const listEBookSchema = z.object({
  id: z.number(),
  title: z.string(),
  counts: z.number(),
  cjk_title: z.string().nullish(),
  romanized_title: z.string().nullish(),
  subtitle: z.string().nullish(),
  sub_series_number: z.string().nullish(),
  publisher: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  data_source: z.string().nullish(),
  is_global: z.boolean(),
  libraryyear: z.number().nullish(),
  subscribers: z.array(z.string()),
  language: z.array(z.string()),
  updated_at: z.string().nullish(),
})

export type listEBook = z.infer<typeof listEBookSchema>
