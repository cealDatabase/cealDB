import { z } from "zod"

export const listAVSchema = z.object({
  id: z.number(),
  title: z.string(),
  cjk_title: z.string().nullish(),
  romanized_title: z.string().nullish(),
  subtitle: z.string().nullish(),
  type: z.string(),
  publisher: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  data_source: z.string().nullish(),
  is_global: z.boolean(),
  libraryyear: z.number().nullish(),
  List_AV_Language: z.array(
    z.object({
      listav_id: z.number(),
      language_id: z.number(),
    })
  ),
})

export type listAV = z.infer<typeof listAVSchema>
