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
  LanguageFieldGroup,
  SubtotalDisplay,
  FormSubmitSection
} from "./shared"

const formSchema = z.object({
  // Presentations
  pspresentations_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentations_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentations_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentations_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Presentation Participants
  pspresentation_participants_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentation_participants_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentation_participants_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  pspresentation_participants_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Reference Transactions
  psreference_transactions_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  psreference_transactions_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  psreference_transactions_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  psreference_transactions_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Total Circulations
  pstotal_circulations_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  pstotal_circulations_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  pstotal_circulations_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  pstotal_circulations_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // ILL Lending Requests Filled
  pslending_requests_filled_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_filled_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_filled_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_filled_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // ILL Lending Requests Unfilled
  pslending_requests_unfilled_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_unfilled_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_unfilled_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  pslending_requests_unfilled_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // ILL Borrowing Requests Filled
  psborrowing_requests_filled_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_filled_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_filled_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_filled_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // ILL Borrowing Requests Unfilled
  psborrowing_requests_unfilled_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_unfilled_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_unfilled_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  psborrowing_requests_unfilled_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  psnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function PublicServicesForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pspresentations_chinese: 0,
      pspresentations_japanese: 0,
      pspresentations_korean: 0,
      pspresentations_eastasian: 0,
      pspresentation_participants_chinese: 0,
      pspresentation_participants_japanese: 0,
      pspresentation_participants_korean: 0,
      pspresentation_participants_eastasian: 0,
      psreference_transactions_chinese: 0,
      psreference_transactions_japanese: 0,
      psreference_transactions_korean: 0,
      psreference_transactions_eastasian: 0,
      pstotal_circulations_chinese: 0,
      pstotal_circulations_japanese: 0,
      pstotal_circulations_korean: 0,
      pstotal_circulations_eastasian: 0,
      pslending_requests_filled_chinese: 0,
      pslending_requests_filled_japanese: 0,
      pslending_requests_filled_korean: 0,
      pslending_requests_filled_eastasian: 0,
      pslending_requests_unfilled_chinese: 0,
      pslending_requests_unfilled_japanese: 0,
      pslending_requests_unfilled_korean: 0,
      pslending_requests_unfilled_eastasian: 0,
      psborrowing_requests_filled_chinese: 0,
      psborrowing_requests_filled_japanese: 0,
      psborrowing_requests_filled_korean: 0,
      psborrowing_requests_filled_eastasian: 0,
      psborrowing_requests_unfilled_chinese: 0,
      psborrowing_requests_unfilled_japanese: 0,
      psborrowing_requests_unfilled_korean: 0,
      psborrowing_requests_unfilled_eastasian: 0,
      psnotes: "",
    },
  })

  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/public-services/status')

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch(`/api/public-services/status/${params.libid}`)
        if (response.ok) {
          const data = await response.json()
          if (data.existingData) {
            Object.keys(data.existingData).forEach(key => {
              if (key !== 'id' && key !== 'entryid' && key !== 'libid' && key !== 'year' && key !== 'libraryyear') {
                form.setValue(key as keyof FormData, data.existingData[key])
              }
            })
          }
        }
      } catch (error) {
        console.log('No existing data found:', error)
      }
    }

    if (params.libid) {
      loadExistingData()
    }
  }, [params.libid, form])

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals
  const presentationsSubtotal = (watchedValues.pspresentations_chinese || 0) + 
                               (watchedValues.pspresentations_japanese || 0) + 
                               (watchedValues.pspresentations_korean || 0) + 
                               (watchedValues.pspresentations_eastasian || 0)

  const presentationParticipantsSubtotal = (watchedValues.pspresentation_participants_chinese || 0) + 
                                          (watchedValues.pspresentation_participants_japanese || 0) + 
                                          (watchedValues.pspresentation_participants_korean || 0) + 
                                          (watchedValues.pspresentation_participants_eastasian || 0)

  const referenceTransactionsSubtotal = (watchedValues.psreference_transactions_chinese || 0) + 
                                       (watchedValues.psreference_transactions_japanese || 0) + 
                                       (watchedValues.psreference_transactions_korean || 0) + 
                                       (watchedValues.psreference_transactions_eastasian || 0)

  const totalCirculationsSubtotal = (watchedValues.pstotal_circulations_chinese || 0) + 
                                   (watchedValues.pstotal_circulations_japanese || 0) + 
                                   (watchedValues.pstotal_circulations_korean || 0) + 
                                   (watchedValues.pstotal_circulations_eastasian || 0)

  const lendingRequestsFilledSubtotal = (watchedValues.pslending_requests_filled_chinese || 0) + 
                                       (watchedValues.pslending_requests_filled_japanese || 0) + 
                                       (watchedValues.pslending_requests_filled_korean || 0) + 
                                       (watchedValues.pslending_requests_filled_eastasian || 0)

  const lendingRequestsUnfilledSubtotal = (watchedValues.pslending_requests_unfilled_chinese || 0) + 
                                         (watchedValues.pslending_requests_unfilled_japanese || 0) + 
                                         (watchedValues.pslending_requests_unfilled_korean || 0) + 
                                         (watchedValues.pslending_requests_unfilled_eastasian || 0)

  const borrowingRequestsFilledSubtotal = (watchedValues.psborrowing_requests_filled_chinese || 0) + 
                                         (watchedValues.psborrowing_requests_filled_japanese || 0) + 
                                         (watchedValues.psborrowing_requests_filled_korean || 0) + 
                                         (watchedValues.psborrowing_requests_filled_eastasian || 0)

  const borrowingRequestsUnfilledSubtotal = (watchedValues.psborrowing_requests_unfilled_chinese || 0) + 
                                           (watchedValues.psborrowing_requests_unfilled_japanese || 0) + 
                                           (watchedValues.psborrowing_requests_unfilled_korean || 0) + 
                                           (watchedValues.psborrowing_requests_unfilled_eastasian || 0)

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const submissionData = {
        ...values,
        pspresentations_subtotal: presentationsSubtotal,
        pspresentation_participants_subtotal: presentationParticipantsSubtotal,
        psreference_transactions_subtotal: referenceTransactionsSubtotal,
        pstotal_circulations_subtotal: totalCirculationsSubtotal,
        pslending_requests_filled_subtotal: lendingRequestsFilledSubtotal,
        pslending_requests_unfilled_subtotal: lendingRequestsUnfilledSubtotal,
        psborrowing_requests_filled_subtotal: borrowingRequestsFilledSubtotal,
        psborrowing_requests_unfilled_subtotal: borrowingRequestsUnfilledSubtotal,
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

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
    >
      {/* Presentations */}
      <FormSection
        title="Presentations"
        description="Enter the number of presentations by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "pspresentations_chinese", label: "01. Presentations Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "pspresentations_japanese", label: "02. Presentations Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "pspresentations_korean", label: "03. Presentations Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "pspresentations_eastasian", label: "04. Presentations East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="05. Presentations Subtotal"
          value={presentationsSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Presentation Participants */}
      <FormSection
        title="Presentation Participants"
        description="Enter the number of presentation participants by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "pspresentation_participants_chinese", label: "06. Presentation Participants Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "pspresentation_participants_japanese", label: "07. Presentation Participants Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "pspresentation_participants_korean", label: "08. Presentation Participants Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "pspresentation_participants_eastasian", label: "09. Presentation Participants East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="10. Presentation Participants Subtotal"
          value={presentationParticipantsSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* Reference Transactions */}
      <FormSection
        title="Reference Transactions"
        description="Enter the number of reference transactions by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "psreference_transactions_chinese", label: "11. Reference Transactions Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "psreference_transactions_japanese", label: "12. Reference Transactions Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "psreference_transactions_korean", label: "13. Reference Transactions Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "psreference_transactions_eastasian", label: "14. Reference Transactions East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="15. Reference Transactions Subtotal"
          value={referenceTransactionsSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* Total Circulations */}
      <FormSection
        title="Total Circulations"
        description="Enter the total circulations by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "pstotal_circulations_chinese", label: "16. Total Circulations Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "pstotal_circulations_japanese", label: "17. Total Circulations Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "pstotal_circulations_korean", label: "18. Total Circulations Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "pstotal_circulations_eastasian", label: "19. Total Circulations East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="20. Total Circulations Subtotal"
          value={totalCirculationsSubtotal}
          formula="16 + 17 + 18 + 19"
        />
      </FormSection>

      {/* ILL Lending Requests Filled */}
      <FormSection
        title="Inter-Library Loan Requests - Lending Filled"
        description="Enter the number of filled lending requests by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "pslending_requests_filled_chinese", label: "21. Lending Requests Filled Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "pslending_requests_filled_japanese", label: "22. Lending Requests Filled Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "pslending_requests_filled_korean", label: "23. Lending Requests Filled Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "pslending_requests_filled_eastasian", label: "24. Lending Requests Filled East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="25. Lending Requests Filled Subtotal"
          value={lendingRequestsFilledSubtotal}
          formula="21 + 22 + 23 + 24"
        />
      </FormSection>

      {/* ILL Lending Requests Unfilled */}
      <FormSection
        title="Inter-Library Loan Requests - Lending Unfilled"
        description="Enter the number of unfilled lending requests by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "pslending_requests_unfilled_chinese", label: "26. Lending Requests Unfilled Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "pslending_requests_unfilled_japanese", label: "27. Lending Requests Unfilled Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "pslending_requests_unfilled_korean", label: "28. Lending Requests Unfilled Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "pslending_requests_unfilled_eastasian", label: "29. Lending Requests Unfilled East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="30. Lending Requests Unfilled Subtotal"
          value={lendingRequestsUnfilledSubtotal}
          formula="26 + 27 + 28 + 29"
        />
      </FormSection>

      {/* ILL Borrowing Requests Filled */}
      <FormSection
        title="Inter-Library Loan Requests - Borrowing Filled"
        description="Enter the number of filled borrowing requests by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "psborrowing_requests_filled_chinese", label: "31. Borrowing Requests Filled Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "psborrowing_requests_filled_japanese", label: "32. Borrowing Requests Filled Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "psborrowing_requests_filled_korean", label: "33. Borrowing Requests Filled Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "psborrowing_requests_filled_eastasian", label: "34. Borrowing Requests Filled East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="35. Borrowing Requests Filled Subtotal"
          value={borrowingRequestsFilledSubtotal}
          formula="31 + 32 + 33 + 34"
        />
      </FormSection>

      {/* ILL Borrowing Requests Unfilled */}
      <FormSection
        title="Inter-Library Loan Requests - Borrowing Unfilled"
        description="Enter the number of unfilled borrowing requests by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "psborrowing_requests_unfilled_chinese", label: "36. Borrowing Requests Unfilled Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "psborrowing_requests_unfilled_japanese", label: "37. Borrowing Requests Unfilled Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "psborrowing_requests_unfilled_korean", label: "38. Borrowing Requests Unfilled Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "psborrowing_requests_unfilled_eastasian", label: "39. Borrowing Requests Unfilled East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="40. Borrowing Requests Unfilled Subtotal"
          value={borrowingRequestsUnfilledSubtotal}
          formula="36 + 37 + 38 + 39"
        />
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information or comments about public services."
      >
        <ReusableFormField
          control={form.control}
          name="psnotes"
          label="Notes/Memo for this form"
          placeholder="Enter any notes, footnotes, or additional information..."
          type="textarea"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Public Services Data"
      />
    </FormWrapper>
  )
}
