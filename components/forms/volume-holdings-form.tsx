import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { ReusableFormField, ReusableNumberFormField } from "./ReusableFormField"
import { StatusMessage } from "./StatusMessage"
import { LoaderCircle } from "lucide-react"

const formSchema = z.object({
  // Entry ID (optional)
  entryid: z.string().optional(),

  // Previous Year Holdings
  vhprevious_year_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  vhprevious_year_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  vhprevious_year_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  vhprevious_year_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Added Gross Holdings
  vhadded_gross_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  vhadded_gross_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  vhadded_gross_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  vhadded_gross_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Withdrawn Holdings
  vhwithdrawn_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  vhwithdrawn_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  vhwithdrawn_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  vhwithdrawn_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  vhnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function VolumeHoldingsForm() {
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
      vhprevious_year_chinese: 0,
      vhprevious_year_japanese: 0,
      vhprevious_year_korean: 0,
      vhprevious_year_noncjk: 0,
      vhadded_gross_chinese: 0,
      vhadded_gross_japanese: 0,
      vhadded_gross_korean: 0,
      vhadded_gross_noncjk: 0,
      vhwithdrawn_chinese: 0,
      vhwithdrawn_japanese: 0,
      vhwithdrawn_korean: 0,
      vhwithdrawn_noncjk: 0,
      vhnotes: "",
    },
  })

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals and totals
  const previousYearSubtotal =
    watchedValues.vhprevious_year_chinese +
    watchedValues.vhprevious_year_japanese +
    watchedValues.vhprevious_year_korean +
    watchedValues.vhprevious_year_noncjk

  const addedGrossSubtotal =
    watchedValues.vhadded_gross_chinese +
    watchedValues.vhadded_gross_japanese +
    watchedValues.vhadded_gross_korean +
    watchedValues.vhadded_gross_noncjk

  const withdrawnSubtotal =
    watchedValues.vhwithdrawn_chinese +
    watchedValues.vhwithdrawn_japanese +
    watchedValues.vhwithdrawn_korean +
    watchedValues.vhwithdrawn_noncjk

  const grandTotal = previousYearSubtotal + addedGrossSubtotal - withdrawnSubtotal

  const params = useParams()
  const router = useRouter()

  // Check library year status and load previous year data on component mount
  useEffect(() => {
    const checkLibraryYearStatus = async () => {
      try {
        const response = await fetch(`/api/volumeHoldings/status/${params.libid}`);
        const data = await response.json();
        setLibraryYearStatus(data);
      } catch (error) {
        console.error('Failed to check library year status:', error);
        toast.error('Failed to check form availability');
      } finally {
        setIsLoading(false);
      }
    };

    const loadPreviousYearData = async () => {
      try {
        const libraryId = Number(params.libid);
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const response = await fetch(`/api/volumeHoldings/previousYear/${libraryId}/${previousYear}`);
        if (response.ok) {
          const previousData = await response.json();
          if (previousData) {
            // Auto-fill fields 01-05 with previous year's grand total data
            form.setValue('vhprevious_year_chinese', previousData.vhgrandtotal || 0);
            form.setValue('vhprevious_year_japanese', previousData.vhgrandtotal || 0);
            form.setValue('vhprevious_year_korean', previousData.vhgrandtotal || 0);
            form.setValue('vhprevious_year_noncjk', previousData.vhgrandtotal || 0);
          }
        }
      } catch (error) {
        console.log('No previous year data available:', error);
      }
    };

    const loadEbookVolumeData = async () => {
      try {
        const libraryId = Number(params.libid);
        const currentYear = new Date().getFullYear();

        const response = await fetch(`/api/volumeHoldings/ebookVolumeData/${libraryId}/${currentYear}`);
        if (response.ok) {
          const ebookData = await response.json();
          if (ebookData) {
            // Auto-fill fields 01-05 with previous year's grand total data
            form.setValue('vhprevious_year_chinese', ebookData.vhgrandtotal || 0);
            form.setValue('vhprevious_year_japanese', ebookData.vhgrandtotal || 0);
          }
        }
      } catch (error) {
        console.log('No ebook volume data available:', error);
      }
    };

    if (params.libid) {
      checkLibraryYearStatus();
      loadPreviousYearData();
      loadEbookVolumeData();
    }
  }, [params.libid, form]);

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true);
      setSuccessMessage(null); // Clear any previous success message
      setErrorMessage(null); // Clear any previous error message

      // Calculate subtotals and totals for submission
      const submissionData = {
        ...values,
        vhprevious_year_subtotal: previousYearSubtotal,
        vhadded_gross_subtotal: addedGrossSubtotal,
        vhwithdrawn_subtotal: withdrawnSubtotal,
        vhgrandtotal: grandTotal,
        libid: Number(params.libid), // Get library ID from URL params
      }

      const response = await fetch('/api/volumeHoldings/create', {
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
      toast.success('Volume holdings record created successfully!')

      // Set success message for display near submit button
      setSuccessMessage(result.message || 'Volume holdings record submitted successfully!');

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
        {/* Physical Volume Numbers from Last Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Physical Volume Numbers from Last Year</CardTitle>
            <CardDescription>The value for 01-05 are obtained from CEAL database, if available. New libraries please fill out 01-05.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReusableNumberFormField
                control={form.control}
                name="vhprevious_year_chinese"
                label="01. Previous Chinese"
                type="number"
                disabled={!libraryYearStatus?.is_open_for_editing}
                useFloat={true}
              />
              <ReusableNumberFormField
                control={form.control}
                name="vhprevious_year_japanese"
                label="02. Previous Japanese"
                type="number"
                disabled={!libraryYearStatus?.is_open_for_editing}
                useFloat={true}
              />
              <ReusableNumberFormField
                control={form.control}
                name="vhprevious_year_korean"
                label="03. Previous Korean"
                type="number"
                disabled={!libraryYearStatus?.is_open_for_editing}
                useFloat={true}
              />
              <ReusableNumberFormField
                control={form.control}
                name="vhprevious_year_noncjk"
                label="04. Previous Non-CJK"
                type="number"
                disabled={!libraryYearStatus?.is_open_for_editing}
                useFloat={true}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>05. Previous Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{previousYearSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(01 + 02 + 03 + 04)</p>
            </div>
          </CardContent>
        </Card>

        {/* Physical Volumes Added This Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Physical Volumes Added This Year</CardTitle>
            <CardDescription>Enter the number of physical volumes added this year by language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReusableFormField
                control={form.control}
                name="vhadded_gross_chinese"
                label="06. Added Chinese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="vhadded_gross_japanese"
                label="07. Added Japanese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="vhadded_gross_korean"
                label="08. Added Korean"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="vhadded_gross_noncjk"
                label="09. Added Non-CJK"
                type="number"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>10. Added Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{addedGrossSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(06 + 07 + 08 + 09)</p>
            </div>
          </CardContent>
        </Card>

        {/* Physical Volumes Withdrawn This Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Physical Volumes Withdrawn This Year</CardTitle>
            <CardDescription>Enter the number of physical volumes withdrawn by language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReusableFormField
                control={form.control}
                name="vhwithdrawn_chinese"
                label="11. Withdrawn Chinese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="vhwithdrawn_japanese"
                label="12. Withdrawn Japanese"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="vhwithdrawn_korean"
                label="13. Withdrawn Korean"
                type="number"
              />
              <ReusableFormField
                control={form.control}
                name="vhwithdrawn_noncjk"
                label="14. Withdrawn Non-CJK"
                type="number"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold">
                <span>15. Withdrawn Subtotal</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{withdrawnSubtotal}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">(11 + 12 + 13 + 14)</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Physical Volume Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Total Physical Volume Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold text-blue-900">
                <span>16. Grand Total (Physical Vols)</span>
                <span className="bg-blue-200 px-3 py-1 rounded">{grandTotal}</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">(05 + 10 - 15)</p>
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
              name="vhnotes"
              label=""
              type="textarea"
              placeholder="Enter any additional notes or comments..."
            />
          </CardContent>
        </Card>

        {/* TODO: need to add db query to calculate Electronic Books Purchased Volume Total
            Then added value from 16 to calculate the WHOLE GRAND TOTAL
            */}
        {/* Total Electronic Books Purchased Volume Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-sky-600 font-bold">Grand Total Volume Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold text-blue-900">
                <span>Electronic Books Purchased Volume Total</span>
                <span className="bg-blue-200 px-3 py-1 rounded">0</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center font-semibold text-blue-900">
                <span>Grand Total Volume Holdings</span>
                <span className="bg-blue-200 px-3 py-1 rounded">0</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">(Automatically calculated; including purchased E-Books)</p>
            </div>
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
              'Submit Volume Holdings Data'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
