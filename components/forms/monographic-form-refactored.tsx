import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useState } from "react"
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
  entryid: z.string().optional(),
  mapurchased_titles_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_titles_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_titles_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_titles_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  mapurchased_volumes_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_titles_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  manonpurchased_volumes_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),
  manotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function MonographicFormRefactored() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  // Use the reusable hook for status checking
  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/monographic/status')

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

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      const submissionData = {
        ...values,
        mapurchased_titles_subtotal: purchasedTitlesSubtotal,
        mapurchased_volumes_subtotal: purchasedVolumesSubtotal,
        manonpurchased_titles_subtotal: nonPurchasedTitlesSubtotal,
        manonpurchased_volumes_subtotal: nonPurchasedVolumesSubtotal,
        matotal_titles: titleTotal,
        matotal_volumes: volumeTotal,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/monographic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to submit form')
      }

      const result = await response.json()
      toast.success('Monographic acquisitions record created successfully!')
      setSuccessMessage(result.message || 'Monographic acquisitions record submitted successfully!')
      form.reset()
      
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Something went wrong')
      setSuccessMessage(null)
      setErrorMessage(error.message || 'An error occurred while submitting the form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
    >
      {/* Purchased Titles */}
      <FormSection
        title="Purchased Titles"
        description="Enter the number of purchased titles by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "mapurchased_titles_chinese", label: "01. Purchased Titles Chinese" },
            japanese: { name: "mapurchased_titles_japanese", label: "02. Purchased Titles Japanese" },
            korean: { name: "mapurchased_titles_korean", label: "03. Purchased Titles Korean" },
            noncjk: { name: "mapurchased_titles_noncjk", label: "04. Purchased Titles Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="05. Purchased Titles Subtotal"
          value={purchasedTitlesSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Purchased Volumes */}
      <FormSection
        title="Purchased Volumes"
        description="Enter the number of purchased volumes by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "mapurchased_volumes_chinese", label: "06. Purchased Volumes Chinese" },
            japanese: { name: "mapurchased_volumes_japanese", label: "07. Purchased Volumes Japanese" },
            korean: { name: "mapurchased_volumes_korean", label: "08. Purchased Volumes Korean" },
            noncjk: { name: "mapurchased_volumes_noncjk", label: "09. Purchased Volumes Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="10. Purchased Volumes Subtotal"
          value={purchasedVolumesSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* Non-Purchased Titles */}
      <FormSection
        title="Non-Purchased Titles"
        description="Enter the number of non-purchased titles by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "manonpurchased_titles_chinese", label: "11. Non-Purchased Titles Chinese" },
            japanese: { name: "manonpurchased_titles_japanese", label: "12. Non-Purchased Titles Japanese" },
            korean: { name: "manonpurchased_titles_korean", label: "13. Non-Purchased Titles Korean" },
            noncjk: { name: "manonpurchased_titles_noncjk", label: "14. Non-Purchased Titles Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="15. Non-Purchased Titles Subtotal"
          value={nonPurchasedTitlesSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* Non-Purchased Volumes */}
      <FormSection
        title="Non-Purchased Volumes"
        description="Enter the number of non-purchased volumes by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "manonpurchased_volumes_chinese", label: "16. Non-Purchased Volumes Chinese" },
            japanese: { name: "manonpurchased_volumes_japanese", label: "17. Non-Purchased Volumes Japanese" },
            korean: { name: "manonpurchased_volumes_korean", label: "18. Non-Purchased Volumes Korean" },
            noncjk: { name: "manonpurchased_volumes_noncjk", label: "19. Non-Purchased Volumes Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="20. Non-Purchased Volumes Subtotal"
          value={nonPurchasedVolumesSubtotal}
          formula="16 + 17 + 18 + 19"
        />
      </FormSection>

      {/* Totals */}
      <FormSection
        title="Totals"
        description="Calculated totals for all categories."
      >
        <SubtotalDisplay
          label="21. Title Total"
          value={titleTotal}
          formula="05 + 15"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
        <SubtotalDisplay
          label="22. Volume Total"
          value={volumeTotal}
          formula="10 + 20"
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
          name="manotes"
          label=""
          type="textarea"
          placeholder="Enter any additional notes or comments..."
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Monographic Data"
      />
    </FormWrapper>
  )
}
