import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const formSchema = z.object({
  // Purchased Titles
  purchasedTitlesChinese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  purchasedTitlesJapanese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  purchasedTitlesKorean: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  purchasedTitlesNonCJK: z.coerce.number().min(0, { message: "Must be a non-negative number" }),

  // Purchased Volumes
  purchasedVolumesChinese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  purchasedVolumesJapanese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  purchasedVolumesKorean: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  purchasedVolumesNonCJK: z.coerce.number().min(0, { message: "Must be a non-negative number" }),

  // Non-Purchased Titles
  nonPurchasedTitlesChinese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  nonPurchasedTitlesJapanese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  nonPurchasedTitlesKorean: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  nonPurchasedTitlesNonCJK: z.coerce.number().min(0, { message: "Must be a non-negative number" }),

  // Non-Purchased Volumes
  nonPurchasedVolumesChinese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  nonPurchasedVolumesJapanese: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  nonPurchasedVolumesKorean: z.coerce.number().min(0, { message: "Must be a non-negative number" }),
  nonPurchasedVolumesNonCJK: z.coerce.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function MonographicForm() {

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      purchasedTitlesChinese: 0,
      purchasedTitlesJapanese: 0,
      purchasedTitlesKorean: 0,
      purchasedTitlesNonCJK: 0,
      purchasedVolumesChinese: 0,
      purchasedVolumesJapanese: 0,
      purchasedVolumesKorean: 0,
      purchasedVolumesNonCJK: 0,
      nonPurchasedTitlesChinese: 0,
      nonPurchasedTitlesJapanese: 0,
      nonPurchasedTitlesKorean: 0,
      nonPurchasedTitlesNonCJK: 0,
      nonPurchasedVolumesChinese: 0,
      nonPurchasedVolumesJapanese: 0,
      nonPurchasedVolumesKorean: 0,
      nonPurchasedVolumesNonCJK: 0,
      notes: "",
    },
  })

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals and totals
  const purchasedTitlesSubtotal =
    watchedValues.purchasedTitlesChinese +
    watchedValues.purchasedTitlesJapanese +
    watchedValues.purchasedTitlesKorean +
    watchedValues.purchasedTitlesNonCJK

  const purchasedVolumesSubtotal =
    watchedValues.purchasedVolumesChinese +
    watchedValues.purchasedVolumesJapanese +
    watchedValues.purchasedVolumesKorean +
    watchedValues.purchasedVolumesNonCJK

  const nonPurchasedTitlesSubtotal =
    watchedValues.nonPurchasedTitlesChinese +
    watchedValues.nonPurchasedTitlesJapanese +
    watchedValues.nonPurchasedTitlesKorean +
    watchedValues.nonPurchasedTitlesNonCJK

  const nonPurchasedVolumesSubtotal =
    watchedValues.nonPurchasedVolumesChinese +
    watchedValues.nonPurchasedVolumesJapanese +
    watchedValues.nonPurchasedVolumesKorean +
    watchedValues.nonPurchasedVolumesNonCJK

  const titleTotal = purchasedTitlesSubtotal + nonPurchasedTitlesSubtotal
  const volumeTotal = purchasedVolumesSubtotal + nonPurchasedVolumesSubtotal

  async function onSubmit(values: FormData) {

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(values)
      toast("Form submitted successfully")
    } catch (error) {
      toast("Something went wrong")
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
                name="purchasedTitlesChinese"
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
                name="purchasedTitlesJapanese"
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
                name="purchasedTitlesKorean"
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
                name="purchasedTitlesNonCJK"
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
                name="purchasedVolumesChinese"
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
                name="purchasedVolumesJapanese"
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
                name="purchasedVolumesKorean"
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
                name="purchasedVolumesNonCJK"
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
                name="nonPurchasedTitlesChinese"
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
                name="nonPurchasedTitlesJapanese"
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
                name="nonPurchasedTitlesKorean"
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
                name="nonPurchasedTitlesNonCJK"
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
                name="nonPurchasedVolumesChinese"
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
                name="nonPurchasedVolumesJapanese"
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
                name="nonPurchasedVolumesKorean"
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
                name="nonPurchasedVolumesNonCJK"
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
              name="notes"
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
