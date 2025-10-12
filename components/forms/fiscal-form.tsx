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
  // Chinese Appropriations
  fschinese_appropriations_monographic: z.number().min(0, { message: "Must be a non-negative number" }),
  fschinese_appropriations_serial: z.number().min(0, { message: "Must be a non-negative number" }),
  fschinese_appropriations_other_material: z.number().min(0, { message: "Must be a non-negative number" }),
  fschinese_appropriations_electronic: z.number().min(0, { message: "Must be a non-negative number" }),

  // Japanese Appropriations
  fsjapanese_appropriations_monographic: z.number().min(0, { message: "Must be a non-negative number" }),
  fsjapanese_appropriations_serial: z.number().min(0, { message: "Must be a non-negative number" }),
  fsjapanese_appropriations_other_material: z.number().min(0, { message: "Must be a non-negative number" }),
  fsjapanese_appropriations_electronic: z.number().min(0, { message: "Must be a non-negative number" }),

  // Korean Appropriations
  fskorean_appropriations_monographic: z.number().min(0, { message: "Must be a non-negative number" }),
  fskorean_appropriations_serial: z.number().min(0, { message: "Must be a non-negative number" }),
  fskorean_appropriations_other_material: z.number().min(0, { message: "Must be a non-negative number" }),
  fskorean_appropriations_electronic: z.number().min(0, { message: "Must be a non-negative number" }),

  // Non-CJK Appropriations
  fsnoncjk_appropriations_monographic: z.number().min(0, { message: "Must be a non-negative number" }),
  fsnoncjk_appropriations_serial: z.number().min(0, { message: "Must be a non-negative number" }),
  fsnoncjk_appropriations_other_material: z.number().min(0, { message: "Must be a non-negative number" }),
  fsnoncjk_appropriations_electronic: z.number().min(0, { message: "Must be a non-negative number" }),

  // Endowments
  fsendowments_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  fsendowments_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  fsendowments_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  fsendowments_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Grants
  fsgrants_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  fsgrants_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  fsgrants_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  fsgrants_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // East Asian Program Support
  fseast_asian_program_support_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  fseast_asian_program_support_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  fseast_asian_program_support_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  fseast_asian_program_support_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Total Budget (Manual Input)
  fstotal_acquisition_budget: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  fsnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function FiscalForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fschinese_appropriations_monographic: 0,
      fschinese_appropriations_serial: 0,
      fschinese_appropriations_other_material: 0,
      fschinese_appropriations_electronic: 0,
      fsjapanese_appropriations_monographic: 0,
      fsjapanese_appropriations_serial: 0,
      fsjapanese_appropriations_other_material: 0,
      fsjapanese_appropriations_electronic: 0,
      fskorean_appropriations_monographic: 0,
      fskorean_appropriations_serial: 0,
      fskorean_appropriations_other_material: 0,
      fskorean_appropriations_electronic: 0,
      fsnoncjk_appropriations_monographic: 0,
      fsnoncjk_appropriations_serial: 0,
      fsnoncjk_appropriations_other_material: 0,
      fsnoncjk_appropriations_electronic: 0,
      fsendowments_chinese: 0,
      fsendowments_japanese: 0,
      fsendowments_korean: 0,
      fsendowments_noncjk: 0,
      fsgrants_chinese: 0,
      fsgrants_japanese: 0,
      fsgrants_korean: 0,
      fsgrants_noncjk: 0,
      fseast_asian_program_support_chinese: 0,
      fseast_asian_program_support_japanese: 0,
      fseast_asian_program_support_korean: 0,
      fseast_asian_program_support_noncjk: 0,
      fstotal_acquisition_budget: 0,
      fsnotes: "",
    },
  })

  const { libraryYearStatus, isLoading, existingData } = useFormStatusChecker('/api/fiscal/status')

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

  // Calculate subtotals
  const chineseSubtotal = (watchedValues.fschinese_appropriations_monographic || 0) + 
                         (watchedValues.fschinese_appropriations_serial || 0) + 
                         (watchedValues.fschinese_appropriations_other_material || 0) + 
                         (watchedValues.fschinese_appropriations_electronic || 0)

  const japaneseSubtotal = (watchedValues.fsjapanese_appropriations_monographic || 0) + 
                          (watchedValues.fsjapanese_appropriations_serial || 0) + 
                          (watchedValues.fsjapanese_appropriations_other_material || 0) + 
                          (watchedValues.fsjapanese_appropriations_electronic || 0)

  const koreanSubtotal = (watchedValues.fskorean_appropriations_monographic || 0) + 
                        (watchedValues.fskorean_appropriations_serial || 0) + 
                        (watchedValues.fskorean_appropriations_other_material || 0) + 
                        (watchedValues.fskorean_appropriations_electronic || 0)

  const noncjkSubtotal = (watchedValues.fsnoncjk_appropriations_monographic || 0) + 
                        (watchedValues.fsnoncjk_appropriations_serial || 0) + 
                        (watchedValues.fsnoncjk_appropriations_other_material || 0) + 
                        (watchedValues.fsnoncjk_appropriations_electronic || 0)

  const endowmentsSubtotal = (watchedValues.fsendowments_chinese || 0) + 
                            (watchedValues.fsendowments_japanese || 0) + 
                            (watchedValues.fsendowments_korean || 0) + 
                            (watchedValues.fsendowments_noncjk || 0)

  const grantsSubtotal = (watchedValues.fsgrants_chinese || 0) + 
                        (watchedValues.fsgrants_japanese || 0) + 
                        (watchedValues.fsgrants_korean || 0) + 
                        (watchedValues.fsgrants_noncjk || 0)

  const programSupportSubtotal = (watchedValues.fseast_asian_program_support_chinese || 0) + 
                                (watchedValues.fseast_asian_program_support_japanese || 0) + 
                                (watchedValues.fseast_asian_program_support_korean || 0) + 
                                (watchedValues.fseast_asian_program_support_noncjk || 0)

  const appropriationsGrandTotal = chineseSubtotal + japaneseSubtotal + koreanSubtotal + noncjkSubtotal

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/fiscal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          libid: Number(params.libid),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      const result = await response.json()
      setSuccessMessage('Fiscal support form submitted successfully!')
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
      const response = await fetch('/api/fiscal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          fschinese_subtotal: chineseSubtotal,
          fsjapanese_subtotal: japaneseSubtotal,
          fskorean_subtotal: koreanSubtotal,
          fsnoncjk_subtotal: noncjkSubtotal,
          fsendowments_subtotal: endowmentsSubtotal,
          fsgrants_subtotal: grantsSubtotal,
          fseast_asian_program_support_subtotal: programSupportSubtotal,
          fsappropriations_grand_total: appropriationsGrandTotal,
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
    >
      {/* Chinese Appropriations */}
      <FormSection
        title="Chinese Appropriations"
        description="Enter appropriations for Chinese materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableNumberFormField
            control={form.control}
            name="fschinese_appropriations_monographic"
            label="01. Chinese Appropriations Monographic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fschinese_appropriations_serial"
            label="02. Chinese Appropriations Serial"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fschinese_appropriations_other_material"
            label="03. Chinese Appropriations Other Materials"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fschinese_appropriations_electronic"
            label="04. Chinese Appropriations Electronic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
        </div>
        <SubtotalDisplay
          label="05. Chinese Appropriations Subtotal"
          value={chineseSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Japanese Appropriations */}
      <FormSection
        title="Japanese Appropriations"
        description="Enter appropriations for Japanese materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableNumberFormField
            control={form.control}
            name="fsjapanese_appropriations_monographic"
            label="06. Japanese Appropriations Monographic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fsjapanese_appropriations_serial"
            label="07. Japanese Appropriations Serial"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fsjapanese_appropriations_other_material"
            label="08. Japanese Appropriations Other Materials"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fsjapanese_appropriations_electronic"
            label="09. Japanese Appropriations Electronic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
        </div>
        <SubtotalDisplay
          label="10. Japanese Appropriations Subtotal"
          value={japaneseSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* Korean Appropriations */}
      <FormSection
        title="Korean Appropriations"
        description="Enter appropriations for Korean materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableNumberFormField
            control={form.control}
            name="fskorean_appropriations_monographic"
            label="11. Korean Appropriations Monographic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fskorean_appropriations_serial"
            label="12. Korean Appropriations Serial"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fskorean_appropriations_other_material"
            label="13. Korean Appropriations Other Materials"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fskorean_appropriations_electronic"
            label="14. Korean Appropriations Electronic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
        </div>
        <SubtotalDisplay
          label="15. Korean Appropriations Subtotal"
          value={koreanSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* Non-CJK Appropriations */}
      <FormSection
        title="Non-CJK Appropriations"
        description="Enter appropriations for Non-CJK materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableNumberFormField
            control={form.control}
            name="fsnoncjk_appropriations_monographic"
            label="16. Non-CJK Appropriations Monographic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fsnoncjk_appropriations_serial"
            label="17. Non-CJK Appropriations Serial"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fsnoncjk_appropriations_other_material"
            label="18. Non-CJK Appropriations Other Materials"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
          <ReusableNumberFormField
            control={form.control}
            name="fsnoncjk_appropriations_electronic"
            label="19. Non-CJK Appropriations Electronic"
            placeholder="Enter amount in USD"
            disabled={!libraryYearStatus?.is_open_for_editing}
            type="number"
          />
        </div>
        <SubtotalDisplay
          label="20. Non-CJK Appropriations Subtotal"
          value={noncjkSubtotal}
          formula="16 + 17 + 18 + 19"
        />
      </FormSection>

      {/* Appropriations Grand Total */}
      <FormSection
        title="Appropriations Grand Total"
        description="Auto-calculated total of all appropriations."
      >
        <SubtotalDisplay
          label="21. Appropriations Grand Total"
          value={appropriationsGrandTotal}
          formula="05 + 10 + 15 + 20"
        />
      </FormSection>

      {/* Endowments */}
      <FormSection
        title="Endowments"
        description="Enter endowment funding by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "fsendowments_chinese", label: "22. Endowments Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "fsendowments_japanese", label: "23. Endowments Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "fsendowments_korean", label: "24. Endowments Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            noncjk: { name: "fsendowments_noncjk", label: "25. Endowments Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="26. Endowments Subtotal"
          value={endowmentsSubtotal}
          formula="22 + 23 + 24 + 25"
        />
      </FormSection>

      {/* Grants */}
      <FormSection
        title="Grants"
        description="Enter grant funding by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "fsgrants_chinese", label: "27. Grants Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "fsgrants_japanese", label: "28. Grants Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "fsgrants_korean", label: "29. Grants Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            noncjk: { name: "fsgrants_noncjk", label: "30. Grants Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="31. Grants Subtotal"
          value={grantsSubtotal}
          formula="27 + 28 + 29 + 30"
        />
      </FormSection>

      {/* East Asian Program Support */}
      <FormSection
        title="East Asian Program Support"
        description="Enter East Asian program support funding by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "fseast_asian_program_support_chinese", label: "32. East Asian Program Support Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "fseast_asian_program_support_japanese", label: "33. East Asian Program Support Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "fseast_asian_program_support_korean", label: "34. East Asian Program Support Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            noncjk: { name: "fseast_asian_program_support_noncjk", label: "35. East Asian Program Support Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="36. East Asian Program Support Subtotal"
          value={programSupportSubtotal}
          formula="32 + 33 + 34 + 35"
        />
      </FormSection>

      {/* Total Budget - Manual Input with Warning */}
      <FormSection
        title="Total Acquisitions Budget"
        description="Manual entry required - do not auto-calculate from other fields."
        className="border-2 border-amber-400 bg-amber-50"
      >
        <div className="mb-3 p-3 bg-amber-100 border border-amber-300 rounded-md">
          <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
            <span className="text-amber-600 text-lg">⚠️</span>
            <strong>Manual Entry Required:</strong> This field must be filled manually. Do not auto-calculate from other fields.
          </p>
        </div>
        <ReusableNumberFormField
          control={form.control}
          name="fstotal_acquisition_budget"
          label="37. Total Acquisitions Budget"
          placeholder="Enter total acquisitions budget in USD"
          disabled={!libraryYearStatus?.is_open_for_editing}
          className="border-amber-300 focus:ring-amber-500 text-xl font-bold"
          type="number"
        />
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information or comments about fiscal support."
      >
        <ReusableFormField
          control={form.control}
          name="fsnotes"
          label="Notes/Memo for this form"
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
        submitButtonText="Submit Fiscal Support Data"
        onSaveDraft={handleSaveDraft}
      />
    </FormWrapper>
  )
}
