import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ReusableFormField } from "./ReusableFormField"
import { useFormStatusChecker } from "@/hooks/useFormStatusChecker"
import {
  FormWrapper,
  FormSection,
  FormSubmitSection
} from "./shared"

const formSchema = z.object({
  // Simplified totals (no language breakdown) - matching the reference design
  pspresentations_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentation_participants_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  psreference_transactions_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  pstotal_circulations_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_filled_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_unfilled_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_filled_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_unfilled_subtotal: z.number().min(0, { message: "Must be a non-negative number" }),
  psnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function PublicServicesForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pspresentations_subtotal: 0,
      pspresentation_participants_subtotal: 0,
      psreference_transactions_subtotal: 0,
      pstotal_circulations_subtotal: 0,
      pslending_requests_filled_subtotal: 0,
      pslending_requests_unfilled_subtotal: 0,
      psborrowing_requests_filled_subtotal: 0,
      psborrowing_requests_unfilled_subtotal: 0,
      psnotes: "",
    },
  })

  const { libraryYearStatus, isLoading, existingData } = useFormStatusChecker('/api/public-services/status')

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

  // No calculations needed - direct user input for totals

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const submissionData = {
        ...values,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/public-services/create', {
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
      setSuccessMessage('Public services form submitted successfully!')
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
      const submissionData = {
        ...values,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/public-services/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
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
    >
      {/* Presentations Section */}
      <FormSection
        title="Presentations"
        description="Count total class sessions, orientations, tours, and bibliographic instruction sessions."
      >
        <ReusableFormField
          control={form.control}
          name="pspresentations_subtotal"
          label="01. Presentations"
          placeholder="Enter total number of presentations"
          type="number"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
        <ReusableFormField
          control={form.control}
          name="pspresentation_participants_subtotal"
          label="02. Presentation Participants"
          placeholder="Enter total number of participants"
          type="number"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      {/* Reference Transactions Section */}
      <FormSection
        title="Reference Transactions"
        description="Information contacts where staff provide knowledge, recommendations, or instruction."
      >
        <ReusableFormField
          control={form.control}
          name="psreference_transactions_subtotal"
          label="03. Reference Transactions"
          placeholder="Enter total reference transactions"
          type="number"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      {/* Total Circulations Section */}
      <FormSection
        title="Total Circulations"
        description="Enter total circulation count."
      >
        <ReusableFormField
          control={form.control}
          name="pstotal_circulations_subtotal"
          label="04. Total Circulations"
          placeholder="Enter total circulations"
          type="number"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      {/* Inter-Library Loan Requests Section */}
      <FormSection
        title="Inter-Library Loan Requests"
        description="Report requests to/from other libraries, both filled and unfilled."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableFormField
            control={form.control}
            name="pslending_requests_filled_subtotal"
            label="05. Lending Requests Filled"
            placeholder="Enter filled lending requests"
            type="number"
            disabled={!libraryYearStatus?.is_open_for_editing}
          />
          <ReusableFormField
            control={form.control}
            name="pslending_requests_unfilled_subtotal"
            label="06. Lending Requests Unfilled"
            placeholder="Enter unfilled lending requests"
            type="number"
            disabled={!libraryYearStatus?.is_open_for_editing}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableFormField
            control={form.control}
            name="psborrowing_requests_filled_subtotal"
            label="07. Borrowing Requests Filled"
            placeholder="Enter filled borrowing requests"
            type="number"
            disabled={!libraryYearStatus?.is_open_for_editing}
          />
          <ReusableFormField
            control={form.control}
            name="psborrowing_requests_unfilled_subtotal"
            label="08. Borrowing Requests Unfilled"
            placeholder="Enter unfilled borrowing requests"
            type="number"
            disabled={!libraryYearStatus?.is_open_for_editing}
          />
        </div>
      </FormSection>

      {/* Notes Section */}
      <FormSection
        title="Notes"
        description="Additional information or comments about public services."
      >
        <ReusableFormField
          control={form.control}
          name="psnotes"
          label="09. Memo/Footnote for this form"
          placeholder="Enter any notes, footnotes, or additional information..."
          type="textarea"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Public Services Data"
        onSaveDraft={handleSaveDraft}
      />
    </FormWrapper>
  )
}
