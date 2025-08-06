import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const formSchema = z.object({
  // Entry ID (optional)
  entryid: z.string().optional(),
  
  // Purchased Titles (matching Prisma field names)
  mapurchased_titles_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_titles_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_titles_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_titles_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Purchased Volumes
  mapurchased_volumes_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Non-Purchased Titles
  manonpurchased_titles_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Non-Purchased Volumes
  manonpurchased_volumes_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  manotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function MonographicForm() {

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryid: "",
      mapurchased_titles_chinese: 0,
      mapurchased_titles_japanese: 0,
      mapurchased_titles_korean: 0,
      mapurchased_titles_noncjk: 0,
      mapurchased_volumes_chinese: 0,
      mapurchased_volumes_japanese: 0,
      mapurchased_volumes_korean: 0,
      mapurchased_volumes_noncjk: 0,
      manonpurchased_titles_chinese: 0,
      manonpurchased_titles_japanese: 0,
      manonpurchased_titles_korean: 0,
      manonpurchased_titles_noncjk: 0,
      manonpurchased_volumes_chinese: 0,
      manonpurchased_volumes_japanese: 0,
      manonpurchased_volumes_korean: 0,
      manonpurchased_volumes_noncjk: 0,
      manotes: "",
    },
  })

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals and totals
  const purchasedTitlesSubtotal =
    watchedValues.mapurchased_titles_chinese +
    watchedValues.mapurchased_titles_japanese +
    watchedValues.mapurchased_titles_korean +
    watchedValues.mapurchased_titles_noncjk

  const purchasedVolumesSubtotal =
    watchedValues.mapurchased_volumes_chinese +
    watchedValues.mapurchased_volumes_japanese +
    watchedValues.mapurchased_volumes_korean +
    watchedValues.mapurchased_volumes_noncjk

  const nonPurchasedTitlesSubtotal =
    watchedValues.manonpurchased_titles_chinese +
    watchedValues.manonpurchased_titles_japanese +
    watchedValues.manonpurchased_titles_korean +
    watchedValues.manonpurchased_titles_noncjk

  const nonPurchasedVolumesSubtotal =
    watchedValues.manonpurchased_volumes_chinese +
    watchedValues.manonpurchased_volumes_japanese +
    watchedValues.manonpurchased_volumes_korean +
    watchedValues.manonpurchased_volumes_noncjk

  const titleTotal = purchasedTitlesSubtotal + nonPurchasedTitlesSubtotal
  const volumeTotal = purchasedVolumesSubtotal + nonPurchasedVolumesSubtotal

  const params = useParams()
  const router = useRouter()

  async function onSubmit(values: FormData) {
    try {
      // Calculate subtotals and totals for submission
      const submissionData = {
        ...values,
        mapurchased_titles_subtotal: purchasedTitlesSubtotal,
        mapurchased_volumes_subtotal: purchasedVolumesSubtotal,
        manonpurchased_titles_subtotal: nonPurchasedTitlesSubtotal,
        manonpurchased_volumes_subtotal: nonPurchasedVolumesSubtotal,
        matotal_titles: titleTotal,
        matotal_volumes: volumeTotal,
        libraryyear: Number(params.libid), // Get from URL params
      }

      const response = await fetch('/api/monographic/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      const result = await response.json()
      toast.success('Monographic acquisitions record created successfully!')
      
      // Optional: Reset form or redirect
      form.reset()
      
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Something went wrong')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Purchased Titles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Purchased Titles</CardTitle>
            <CardDescription>Enter the number of purchased titles by language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mapurchased_titles_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>01. Purchased Titles Chinese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapurchased_titles_japanese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>02. Purchased Titles Japanese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapurchased_titles_korean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>03. Purchased Titles Korean</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapurchased_titles_noncjk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>04. Purchased Titles Non-CJK</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>05. Purchased Titles Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{purchasedTitlesSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(01 + 02 + 03 + 04)</p>
            </div>
          </CardContent>
        </Card>

        {/* Purchased Volumes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Purchased Volumes</CardTitle>
            <CardDescription>Enter the number of purchased volumes by language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mapurchased_volumes_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>06. Purchased Volumes Chinese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapurchased_volumes_japanese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>07. Purchased Volumes Japanese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapurchased_volumes_korean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>08. Purchased Volumes Korean</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapurchased_volumes_noncjk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>09. Purchased Volumes Non-CJK</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>10. Purchased Volumes Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{purchasedVolumesSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(06 + 07 + 08 + 09)</p>
            </div>
          </CardContent>
        </Card>

        {/* Non-Purchased Titles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Non-Purchased Titles</CardTitle>
            <CardDescription>Enter the number of non-purchased titles by language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manonpurchased_titles_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>11. Non-Purchased Titles Chinese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manonpurchased_titles_japanese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>12. Non-Purchased Titles Japanese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manonpurchased_titles_korean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>13. Non-Purchased Titles Korean</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manonpurchased_titles_noncjk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>14. Non-Purchased Titles Non-CJK</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>15. Non-Purchased Titles Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{nonPurchasedTitlesSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(11 + 12 + 13 + 14)</p>
            </div>
          </CardContent>
        </Card>

        {/* Non-Purchased Volumes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Non-Purchased Volumes</CardTitle>
            <CardDescription>Enter the number of non-purchased volumes by language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manonpurchased_volumes_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>16. Non-Purchased Volumes Chinese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manonpurchased_volumes_japanese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>17. Non-Purchased Volumes Japanese</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manonpurchased_volumes_korean"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>18. Non-Purchased Volumes Korean</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manonpurchased_volumes_noncjk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>19. Non-Purchased Volumes Non-CJK</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                          field.onChange(value)
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            e.target.value = ''
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            field.onChange(0)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>20. Non-Purchased Volumes Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{nonPurchasedVolumesSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(16 + 17 + 18 + 19)</p>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Totals</CardTitle>
            <CardDescription>Calculated totals for all categories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold text-blue-900">
                <span>21. Title Total</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{titleTotal}</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">(05 + 15)</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold text-blue-900">
                <span>22. Volume Total</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{volumeTotal}</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">(10 + 20)</p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Notes</CardTitle>
            <CardDescription>Additional notes or comments about the library data.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="manotes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes or comments..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end mb-4">
          <Button type="submit">
            Submit Monographic Data
          </Button>
        </div>
      </form>
    </Form>
  )
}
