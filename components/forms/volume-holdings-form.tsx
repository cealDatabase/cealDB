import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ReusableFormField, ReusableNumberFormField } from "./ReusableFormField"
import { useFormStatusChecker } from "@/hooks/useFormStatusChecker"
import { getSurveyDates } from "@/lib/surveyDates"
import { formatSimpleDate } from "@/lib/dateFormatting"
import { PostCollectionWarning } from "./PostCollectionWarning"
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher"
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
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [ebookVolumesTotal, setEbookVolumesTotal] = useState(0)
  const params = useParams()

  // Use the reusable hook for status checking
  const { libraryYearStatus, isLoading, existingData, isReadOnly, canEdit, formPermission, isPrivilegedPostClosing } = useFormStatusChecker('/api/volumeHoldings/status')

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

  const physicalGrandTotal = previousYearSubtotal + addedGrossSubtotal - withdrawnSubtotal
  const overallGrandTotal = physicalGrandTotal + ebookVolumesTotal

  const closingDateText = (() => {
    if (!libraryYearStatus) return null
    const year = (libraryYearStatus as any).year || new Date().getFullYear()
    const close = (libraryYearStatus as any).libraryYear?.closing_date as any
    if (close) {
      const d = typeof close === 'string' ? new Date(close) : close
      if (!isNaN(d?.getTime?.() ?? NaN)) {
        return formatSimpleDate(d)
      }
    }
    const dates = getSurveyDates(year)
    return formatSimpleDate(dates.closingDate)
  })()

  // Pre-populate form with existing data
  useEffect(() => {
    if (existingData) {
      Object.keys(existingData).forEach((key) => {
        if (key in form.getValues() && existingData[key] !== null && existingData[key] !== undefined) {
          // Parse numeric values to prevent string concatenation in calculations
          const isTextField = key === 'entryid' || key === 'vhnotes'
          const value = isTextField 
            ? existingData[key] 
            : (typeof existingData[key] === 'number' ? existingData[key] : parseFloat(existingData[key]) || 0)
          form.setValue(key as keyof FormData, value)
        }
      })
    }
  }, [existingData, form])

  // Load previous year data on component mount
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
            // Calculate ending balance for each language from last year's data
            // Formula: Previous + Added - Withdrawn = Ending Balance
            const chineseEnding = (previousData.vhprevious_year_chinese || 0) + 
                                  (previousData.vhadded_gross_chinese || 0) - 
                                  (previousData.vhwithdrawn_chinese || 0);
            
            const japaneseEnding = (previousData.vhprevious_year_japanese || 0) + 
                                   (previousData.vhadded_gross_japanese || 0) - 
                                   (previousData.vhwithdrawn_japanese || 0);
            
            const koreanEnding = (previousData.vhprevious_year_korean || 0) + 
                                 (previousData.vhadded_gross_korean || 0) - 
                                 (previousData.vhwithdrawn_korean || 0);
            
            const noncjkEnding = (previousData.vhprevious_year_noncjk || 0) + 
                                 (previousData.vhadded_gross_noncjk || 0) - 
                                 (previousData.vhwithdrawn_noncjk || 0);

            // Auto-fill fields 01-04 with last year's ending balance by language
            form.setValue('vhprevious_year_chinese', chineseEnding);
            form.setValue('vhprevious_year_japanese', japaneseEnding);
            form.setValue('vhprevious_year_korean', koreanEnding);
            form.setValue('vhprevious_year_noncjk', noncjkEnding);
          }
        } else {
          // No previous year data - leave fields at 0 (default)
          console.log('No previous year data found, using default values (0)');
        }
      } catch (error) {
        console.log('Error loading previous year data:', error);
        // On error, leave fields at 0 (default)
      }
    };

    if (params.libid) {
      loadPreviousYearData();
    }
  }, [params.libid, form]);

  // Load Electronic Books Purchased Volume Total from Form 10 (Electronic Books)
  useEffect(() => {
    const loadEBookVolumes = async () => {
      try {
        const libraryId = Number(params.libid);
        const currentYear = new Date().getFullYear();

        const response = await fetch(`/api/electronic-books/purchased-volumes/${libraryId}/${currentYear}`);
        if (response.ok) {
          const data = await response.json();
          const total = data.total || 0;
          setEbookVolumesTotal(total);
          console.log('E-Book Purchased Volumes total loaded:', total);
        } else {
          console.log('No E-Book purchased volumes data found');
          setEbookVolumesTotal(0);
        }
      } catch (error) {
        console.log('Error loading E-Book purchased volumes:', error);
        setEbookVolumesTotal(0);
      }
    };

    if (params.libid) {
      loadEBookVolumes();
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
        vhprevious_year_subtotal: previousYearSubtotal,
        vhadded_gross_subtotal: addedGrossSubtotal,
        vhwithdrawn_subtotal: withdrawnSubtotal,
        vhgrandtotal: physicalGrandTotal,
        libid: Number(params.libid), // Get library ID from URL params
        finalSubmit: true,
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

    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Something went wrong')
      setSuccessMessage(null); // Clear success message on error
      setErrorMessage(error.message || 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      setIsSavingDraft(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      const values = form.getValues()
      const submissionData = {
        ...values,
        vhprevious_year_subtotal: previousYearSubtotal,
        vhadded_gross_subtotal: addedGrossSubtotal,
        vhwithdrawn_subtotal: withdrawnSubtotal,
        vhgrandtotal: physicalGrandTotal,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/volumeHoldings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to save draft')
      }

      toast.success('Draft saved successfully!')
      setSuccessMessage('Draft saved successfully! You can continue editing or submit when ready.')
      
    } catch (error: any) {
      console.error('Draft save error:', error)
      toast.error(error.message || 'Failed to save draft')
      setSuccessMessage(null)
      setErrorMessage(error.message || 'An error occurred while saving the draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  return (
    <>
      <InstitutionSwitcher 
        currentYear={libraryYearStatus?.year}
      />
      <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
      isReadOnly={isReadOnly}
      readOnlyReason={formPermission?.reason}
    >
      {/* Physical Volume Numbers from Last Year */}
      <FormSection
        title="Physical Volume Numbers from Last Year"
        description="The value for 01-05 are obtained from CEAL Statistics Database, if available. New joined libraries please contact CEAL admin at https://ceal-db.vercel.app/help"
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
          disabled={isReadOnly}
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
          disabled={isReadOnly}
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
          value={physicalGrandTotal}
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
          disabled={isReadOnly}
        />
      </FormSection>

      {/* Grand Total Volume Holdings */}
      <FormSection
        title="Grand Total Volume Holdings"
      >
        <SubtotalDisplay
          label="Electronic Books Purchased Volume Total"
          value={ebookVolumesTotal}
          formula={`Pull the number from Line 20 (Subtotal - Total) under "Purchased Volumes" in Form 10 Electronic Books.`}
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
        <SubtotalDisplay
          label="Grand Total Volume Holdings"
          value={overallGrandTotal}
          formula={`Physical (${physicalGrandTotal}) + E-Books (${ebookVolumesTotal})`}
          className="bg-green-50 p-4 rounded-lg border-2 border-green-300"
          valueClassName="bg-green-300 px-3 py-1 rounded font-bold"
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit"
        onSaveDraft={handleSaveDraft}
        isReadOnly={isReadOnly}
      />
      {isPrivilegedPostClosing ? (
        <PostCollectionWarning className="mt-4" />
      ) : (
        <p className="text-muted-foreground text-xs text-right translate-y-[-20px]">You can keep editing this form until {closingDateText}</p>
      )}
    </FormWrapper>
    </>
  )
}
