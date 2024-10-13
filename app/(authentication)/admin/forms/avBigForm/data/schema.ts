import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const listAVSchema = z.object({
  id: z.number(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
  type: z.string(),
  title: z.string().nullable(),
  cjk_title: z.string().nullable(),
  romanized_title: z.string().nullable(),
  subtitle: z.string().nullable(),
  publisher: z.string().nullable(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  data_source: z.string().nullable(),
  updated_at: z.date(),
  is_global: z.boolean().nullable(),
  libraryyear: z.number().nullable(),
  Library_Year: z.object({
    id: z.number(),
    library: z.number().nullable(),
    is_open_for_editing: z.boolean().nullable(),
    admin_notes: z.string().nullable(),
    year: z.number(),
    updated_at: z.date(),
    is_active: z.boolean().nullable(),
  }).nullable(),
  LibraryYear_ListAV: z.array(z.object({
    libraryyear_id: z.number(),
    listav_id: z.number(),
  })).nullable(),
  List_AV_Counts: z.object({
    id: z.number(),
    titles: z.number().nullable(),
    year: z.number().nullable(),
    updatedat: z.date(),
    ishidden: z.boolean().nullable(),
  }).nullable(),
  List_AV_Language: z.array(z.object({
    listav_id: z.number(),
    language_id: z.number(),
  })).nullable(),
})

export type listAV = z.infer<typeof listAVSchema>
