import { string, z } from "zod"

export const listAVSchema = z.object({
  id: z.number(),
  title: z.string(),
  counts: z.number(),
  cjk_title: z.string().nullish(),
  romanized_title: z.string().nullish(),
  subtitle: z.string().nullish(),
  type: z.string().toLowerCase().nullish(),
  publisher: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  data_source: z.string().nullish(),
  is_global: z.boolean(),
  libraryyear: z.number().nullish(),
  subscribers: z.array(z.string()),
  language: z.array(
    z.object({
      language_id: z.number(),
    })
  ),
})

export type listAV = z.infer<typeof listAVSchema>
