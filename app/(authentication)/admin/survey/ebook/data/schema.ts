import { z } from "zod"

export const listEBookSchema = z.object({
  id: z.number(),
  title: z.string(),
  sub_series_number: z.string().nullish(),
  publisher: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  updated_at: z.date().nullish(),
  subtitle: z.string().nullish(),
  cjk_title: z.string().nullish(),
  romanized_title: z.string().nullish(),
  data_source: z.string().nullish(),
  libraryyear: z.number().nullish(),
  is_global: z.boolean(),
  language: z.array(
    z.object({
      language_id: z.number(),
    })
  ),
})

export type listEBook = z.infer<typeof listEBookSchema>
