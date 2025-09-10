import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ReusableFormField, ReusableNumberFormField } from "./ReusableFormField"
import { useFormStatusChecker } from "@/hooks/useFormStatusChecker"
import {
  FormWrapper,
  FormSection,
  LanguageFieldGroup,
  SubtotalDisplay,
  FormSubmitSection
} from "./shared"

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  // Use the reusable hook for status checking
  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/volumeHoldings/status')

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

  // Load previous year data and ebook volume data on component mount
  useEffect(() => {

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

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
    >
      {/* Physical Volume Numbers from Last Year */}
      <FormSection
        title="Physical Volume Numbers from Last Year"
        description="The value for 01-05 are obtained from CEAL database, if available. New joined libraries please contact CEAL admin at https://ceal-db.vercel.app/help"
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "vhprevious_year_chinese", label: "01. Previous Chinese", disabled: true },
            japanese: { name: "vhprevious_year_japanese", label: "02. Previous Japanese", disabled: true },
            korean: { name: "vhprevious_year_korean", label: "03. Previous Korean", disabled: true },
            noncjk: { name: "vhprevious_year_noncjk", label: "04. Previous Non-CJK", disabled: true }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="05. Previous Subtotal"
          value={previousYearSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Physical Volumes Added This Year */}
      <FormSection
        title="Physical Volumes Added This Year"
        description="Enter the number of physical volumes added this year by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "vhadded_gross_chinese", label: "06. Added Chinese" },
            japanese: { name: "vhadded_gross_japanese", label: "07. Added Japanese" },
            korean: { name: "vhadded_gross_korean", label: "08. Added Korean" },
            noncjk: { name: "vhadded_gross_noncjk", label: "09. Added Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="10. Added Subtotal"
          value={addedGrossSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* Physical Volumes Withdrawn This Year */}
      <FormSection
        title="Physical Volumes Withdrawn This Year"
        description="Enter the number of physical volumes withdrawn by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "vhwithdrawn_chinese", label: "11. Withdrawn Chinese" },
            japanese: { name: "vhwithdrawn_japanese", label: "12. Withdrawn Japanese" },
            korean: { name: "vhwithdrawn_korean", label: "13. Withdrawn Korean" },
            noncjk: { name: "vhwithdrawn_noncjk", label: "14. Withdrawn Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="15. Withdrawn Subtotal"
          value={withdrawnSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* Total Physical Volume Holdings */}
      <FormSection
        title="Total Physical Volume Holdings"
      >
        <SubtotalDisplay
          label="16. Grand Total (Physical Vols)"
          value={grandTotal}
          formula="05 + 10 - 15"
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
      </FormSection>


      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional notes or comments about the library data."
      >
        <ReusableFormField
          control={form.control}
          name="vhnotes"
          label=""
          type="textarea"
          placeholder="Enter any additional notes or comments..."
        />
      </FormSection>

      {/* TODO: need to add db query to calculate Electronic Books Purchased Volume Total
          Then added value from 16 to calculate the WHOLE GRAND TOTAL
          */}
      {/* Total Electronic Books Purchased Volume Holdings */}
      <FormSection
        title="Grand Total Volume Holdings"
      >
        <SubtotalDisplay
          label="Electronic Books Purchased Volume Total"
          value={0}
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
        <SubtotalDisplay
          label="Grand Total Volume Holdings"
          value={0}
          formula="Automatically calculated; including purchased E-Books"
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Volume Holdings Data"
      />
    </FormWrapper>
  )
}
