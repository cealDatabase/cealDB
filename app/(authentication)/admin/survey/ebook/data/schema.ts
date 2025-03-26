import { title } from "process"
import { z } from "zod"

export const listAVSchema = z.object({
  id: z.number(),
  type: z.string().toLowerCase().nullish(),
  title: z.string(),
  cjk_title: z.string().nullish(),
  romanized_title: z.string().nullish(),
  subtitle: z.string().nullish(),
  publisher: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  data_source: z.string().nullish(),
  updated_at: z.date().nullish(),
  is_global: z.boolean(),
  libraryyear: z.number().nullish(),
  language: z.array(
    z.object({
      language_id: z.number(),
    })
  ),
})

export type listAV = z.infer<typeof listAVSchema>

export const listEbookSchema = z.object({
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

export type listEbook = z.infer<typeof listEbookSchema>
