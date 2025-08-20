import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { ReusableFormField } from "./ReusableFormField"
import { StatusMessage } from "./StatusMessage"
import { LoaderCircle } from "lucide-react"

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
  const [libraryYearStatus, setLibraryYearStatus] = useState<{
    exists: boolean;
    is_open_for_editing: boolean;
    is_active: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Check library year status on component mount
  useEffect(() => {
    const checkLibraryYearStatus = async () => {
      try {
        const response = await fetch(`/api/monographic/status/${params.libid}`);
        const data = await response.json();
        setLibraryYearStatus(data);
      } catch (error) {
        console.error('Failed to check library year status:', error);
        toast.error('Failed to check form availability');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.libid) {
      checkLibraryYearStatus();
    }
  }, [params.libid]);

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true);
      setSuccessMessage(null); // Clear any previous success message
      setErrorMessage(null); // Clear any previous error message

      // Calculate subtotals and totals for submission
      const submissionData = {
        ...values,
        mapurchased_titles_subtotal: purchasedTitlesSubtotal,
        mapurchased_volumes_subtotal: purchasedVolumesSubtotal,
        manonpurchased_titles_subtotal: nonPurchasedTitlesSubtotal,
        manonpurchased_volumes_subtotal: nonPurchasedVolumesSubtotal,
        matotal_titles: titleTotal,
        matotal_volumes: volumeTotal,
        libid: Number(params.libid), // Get library ID from URL params
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
        throw new Error(errorData.message || errorData.error || 'Failed to submit form')
      }

      const result = await response.json()
      toast.success('Monographic acquisitions record created successfully!')
      
      // Set success message for display near submit button
      setSuccessMessage(result.message || 'Monographic acquisitions record submitted successfully!');
      
      // Optional: Reset form or redirect
      form.reset()
      
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Something went wrong')
      setSuccessMessage(null); // Clear success message on error
      setErrorMessage(error.message || 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Checking form availability...</div>
      </div>
    );
  }

  // Show error message if library year doesn't exist or is not open for editing
  if (!libraryYearStatus?.exists || !libraryYearStatus?.is_open_for_editing) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Form Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{libraryYearStatus?.message}</p>
            <p className="text-sm text-red-600">
              Please contact the administrator to resolve this issue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
              <ReusableFormField
                control={form.control}
                name="mapurchased_titles_chinese"
                label="01. Purchased Titles Chinese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="mapurchased_titles_japanese"
                label="02. Purchased Titles Japanese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="mapurchased_titles_korean"
                label="03. Purchased Titles Korean"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="mapurchased_titles_noncjk"
                label="04. Purchased Titles Non-CJK"
                type="number"
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
              <ReusableFormField
                control={form.control}
                name="mapurchased_volumes_chinese"
                label="06. Purchased Volumes Chinese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="mapurchased_volumes_japanese"
                label="07. Purchased Volumes Japanese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="mapurchased_volumes_korean"
                label="08. Purchased Volumes Korean"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="mapurchased_volumes_noncjk"
                label="09. Purchased Volumes Non-CJK"
                type="number"
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
              <ReusableFormField
                control={form.control}
                name="manonpurchased_titles_chinese"
                label="11. Non-Purchased Titles Chinese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="manonpurchased_titles_japanese"
                label="12. Non-Purchased Titles Japanese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="manonpurchased_titles_korean"
                label="13. Non-Purchased Titles Korean"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="manonpurchased_titles_noncjk"
                label="14. Non-Purchased Titles Non-CJK"
                type="number"
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
              <ReusableFormField
                control={form.control}
                name="manonpurchased_volumes_chinese"
                label="16. Non-Purchased Volumes Chinese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="manonpurchased_volumes_japanese"
                label="17. Non-Purchased Volumes Japanese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="manonpurchased_volumes_korean"
                label="18. Non-Purchased Volumes Korean"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="manonpurchased_volumes_noncjk"
                label="19. Non-Purchased Volumes Non-CJK"
                type="number"
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
            <ReusableFormField
              control={form.control}
              name="manotes"
              label=""
              type="textarea"
              placeholder="Enter any additional notes or comments..."
            />
          </CardContent>
        </Card>

        <StatusMessage
          type="success"
          message={successMessage || ""}
          show={!!successMessage}
        />

        <StatusMessage
          type="error"
          message={errorMessage || ""}
          show={!!errorMessage}
        />

        <div className="flex justify-end mb-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Submitting...
              </>
            ) : (
              'Submit Monographic Data'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
