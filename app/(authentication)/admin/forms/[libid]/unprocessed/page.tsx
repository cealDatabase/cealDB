"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { UnprocessedInstructions } from "@/components/instructions/unprocessed"
import { Button } from "@/components/ui/button"
import { BookOpen, X, History } from "lucide-react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { ReusableFormField, ReusableNumberFormField } from "@/components/forms/ReusableFormField"
import { useFormStatusChecker } from "@/hooks/useFormStatusChecker"
import { getSurveyDates } from "@/lib/surveyDates"
import { formatSimpleDate } from "@/lib/dateFormatting"
import { PostCollectionWarning } from "@/components/forms/PostCollectionWarning"
import {
  FormWrapper,
  FormSection,
  LanguageFieldGroup,
  SubtotalDisplay,
  FormSubmitSection
} from "@/components/forms/shared"

const formSchema = z.object({
  // Entry ID (optional)
  entryid: z.string().optional(),

  // Unprocessed materials by language
  ubchinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ubjapanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ubkorean: z.number().min(0, { message: "Must be a non-negative number" }),
  ubnoncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  ubnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const UnprocessedForm = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ubchinese: 0,
      ubjapanese: 0,
      ubkorean: 0,
      ubnoncjk: 0,
      ubnotes: "",
    },
  })

  const { libraryYearStatus, isLoading, existingData, isReadOnly, canEdit, formPermission, isPrivilegedPostClosing } = useFormStatusChecker('/api/unprocessed/status')

  // Pre-populate form with existing data
  useEffect(() => {
    if (existingData) {
      Object.keys(existingData).forEach((key) => {
        if (key in form.getValues() && existingData[key] !== null && existingData[key] !== undefined) {
          form.setValue(key as keyof FormData, existingData[key])
        }
      })
    }
  }, [existingData, form])

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate total
  const unprocessedTotal = (watchedValues.ubchinese || 0) + 
                          (watchedValues.ubjapanese || 0) + 
                          (watchedValues.ubkorean || 0) + 
                          (watchedValues.ubnoncjk || 0)

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

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/unprocessed/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          finalSubmit: true,
          libid: Number(params.libid),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      const result = await response.json()
      setSuccessMessage('Unprocessed backlog materials form submitted successfully!')
      toast.success('Form submitted successfully!')
      
    } catch (error: any) {
      console.error('Form submission error:', error)
      setSuccessMessage(null);
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
      const response = await fetch('/api/unprocessed/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          libid: Number(params.libid),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save draft')
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
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
      isReadOnly={isReadOnly}
      readOnlyReason={formPermission?.reason}
    >
      {/* Unprocessed Backlog Materials */}
      <FormSection
        title="Unprocessed Backlog Materials"
        description="Enter the number of unprocessed materials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "ubchinese", label: "01. Unprocessed Chinese" },
            japanese: { name: "ubjapanese", label: "02. Unprocessed Japanese" },
            korean: { name: "ubkorean", label: "03. Unprocessed Korean" },
            noncjk: { name: "ubnoncjk", label: "04. Unprocessed Non-CJK" }
          }}
          useFloatNumbers={false}
          disabled={isReadOnly}
        />
        <SubtotalDisplay
          label="05. Unprocessed Total"
          value={unprocessedTotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information or comments about unprocessed materials."
      >
        <ReusableFormField
          control={form.control}
          name="ubnotes"
          label="06. Memo/Footnote for this form"
          placeholder="Enter any notes or footnotes..."
          type="textarea"
          disabled={isReadOnly}
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
  )
}

const UnprocessedPage = () => {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <Container>
        <AdminBreadcrumb libraryName="Library" />
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Unprocessed Backlog Materials
        </h1>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-md font-bold"
            size="lg"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? (
              <>
                <X className="h-4 w-4" />
                Hide Instructions
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                View Instructions
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 text-md font-bold"
            size="lg"
            onClick={() => window.open(window.location.pathname + '/past-years', '_blank')}
          >
            <History className="h-4 w-4" />
            View Data From Past 5 Years
          </Button>
        </div>

        <div className="flex gap-6 max-w-full">
          {/* Instructions Column - 1/3 width */}
          {showInstructions && (
            <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[80vh] sticky top-4">
              <UnprocessedInstructions />
            </div>
          )}

          {/* Form Column - 2/3 width when instructions shown, full width when hidden */}
          <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
            <UnprocessedForm />
          </div>
        </div>
      </Container>
    </>
  )
}

export default UnprocessedPage