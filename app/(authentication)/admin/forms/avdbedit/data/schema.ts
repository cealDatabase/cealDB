import { z } from "zod"

export const listAVSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  cjk_title: z.string().nullable(),
  romanized_title: z.string().nullable(),
  subtitle: z.string().nullable(),
  type: z.string(),
  publisher: z.string().nullable(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  data_source: z.string().nullable(),
  is_global: z.boolean().nullable(),
  libraryyear: z.number().nullable(),
  List_AV_Language: z.array(
    z.object({
      listav_id: z.number(),
      language_id: z.number(),
    }),
  ),
})

export type listAV = z.infer<typeof listAVSchema>
