import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ReusableFormField, ReusableCurrencyFormField } from "./ReusableFormField"
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

  // Manual Entry Subtotals
  fschinese_appropriations_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fsjapanese_appropriations_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fskorean_appropriations_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fsnoncjk_appropriations_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fstotal_appropriations_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fsendowments_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fsgrants_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),
  fseast_asian_program_support_subtotal_manual: z.number().min(0, { message: "Must be a non-negative number" }).optional(),

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
      fschinese_appropriations_subtotal_manual: undefined,
      fsjapanese_appropriations_subtotal_manual: undefined,
      fskorean_appropriations_subtotal_manual: undefined,
      fsnoncjk_appropriations_subtotal_manual: undefined,
      fstotal_appropriations_manual: undefined,
      fsendowments_subtotal_manual: undefined,
      fsgrants_subtotal_manual: undefined,
      fseast_asian_program_support_subtotal_manual: undefined,
      fsnotes: "",
    },
  })

  const { libraryYearStatus, isLoading, existingData, isReadOnly, canEdit, formPermission, isPrivilegedPostClosing } = useFormStatusChecker('/api/fiscal/status')

  // Pre-populate form with existing data
  useEffect(() => {
    if (existingData) {
      Object.keys(existingData).forEach((key) => {
        if (key in form.getValues() && existingData[key] !== null && existingData[key] !== undefined) {
          // Parse numeric values to prevent string concatenation in calculations
          const value = key === 'fsnotes' 
            ? existingData[key] 
            : (typeof existingData[key] === 'number' ? existingData[key] : parseFloat(existingData[key]) || 0)
          form.setValue(key as keyof FormData, value)
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
      const response = await fetch('/api/fiscal/create', {
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
      {/* Chinese Appropriations */}
      <FormSection
        title="Chinese Appropriations"
        description="Enter appropriations for Chinese materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableCurrencyFormField
            control={form.control}
            name="fschinese_appropriations_monographic"
            label="01. Chinese Appropriations Monographic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fschinese_appropriations_serial"
            label="02. Chinese Appropriations Serial"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fschinese_appropriations_other_material"
            label="03. Chinese Appropriations Other Materials"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fschinese_appropriations_electronic"
            label="04. Chinese Appropriations Electronic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
        </div>
        <SubtotalDisplay
          label="05. Chinese Appropriations Subtotal"
          value={chineseSubtotal}
          formula="01 + 02 + 03 + 04"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fschinese_appropriations_subtotal_manual"
            label="05a. Chinese Appropriations Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
      </FormSection>

      {/* Japanese Appropriations */}
      <FormSection
        title="Japanese Appropriations"
        description="Enter appropriations for Japanese materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableCurrencyFormField
            control={form.control}
            name="fsjapanese_appropriations_monographic"
            label="06. Japanese Appropriations Monographic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fsjapanese_appropriations_serial"
            label="07. Japanese Appropriations Serial"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fsjapanese_appropriations_other_material"
            label="08. Japanese Appropriations Other Materials"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fsjapanese_appropriations_electronic"
            label="09. Japanese Appropriations Electronic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
        </div>
        <SubtotalDisplay
          label="10. Japanese Appropriations Subtotal"
          value={japaneseSubtotal}
          formula="06 + 07 + 08 + 09"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fsjapanese_appropriations_subtotal_manual"
            label="10a. Japanese Appropriations Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
      </FormSection>

      {/* Korean Appropriations */}
      <FormSection
        title="Korean Appropriations"
        description="Enter appropriations for Korean materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableCurrencyFormField
            control={form.control}
            name="fskorean_appropriations_monographic"
            label="11. Korean Appropriations Monographic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fskorean_appropriations_serial"
            label="12. Korean Appropriations Serial"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fskorean_appropriations_other_material"
            label="13. Korean Appropriations Other Materials"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fskorean_appropriations_electronic"
            label="14. Korean Appropriations Electronic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
        </div>
        <SubtotalDisplay
          label="15. Korean Appropriations Subtotal"
          value={koreanSubtotal}
          formula="11 + 12 + 13 + 14"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fskorean_appropriations_subtotal_manual"
            label="15a. Korean Appropriations Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
      </FormSection>

      {/* Non-CJK Appropriations */}
      <FormSection
        title="Non-CJK Appropriations"
        description="Enter appropriations for Non-CJK materials by category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableCurrencyFormField
            control={form.control}
            name="fsnoncjk_appropriations_monographic"
            label="16. Non-CJK Appropriations Monographic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fsnoncjk_appropriations_serial"
            label="17. Non-CJK Appropriations Serial"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fsnoncjk_appropriations_other_material"
            label="18. Non-CJK Appropriations Other Materials"
            placeholder="0.00"
            disabled={isReadOnly}
          />
          <ReusableCurrencyFormField
            control={form.control}
            name="fsnoncjk_appropriations_electronic"
            label="19. Non-CJK Appropriations Electronic"
            placeholder="0.00"
            disabled={isReadOnly}
          />
        </div>
        <SubtotalDisplay
          label="20. Non-CJK Appropriations Subtotal"
          value={noncjkSubtotal}
          formula="16 + 17 + 18 + 19"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fsnoncjk_appropriations_subtotal_manual"
            label="20a. Non-CJK Appropriations Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
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
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fstotal_appropriations_manual"
            label="21a. Appropriations Grand Total (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual grand total if different from the calculated value above.</p>
        </div>
      </FormSection>

      {/* Endowments */}
      <FormSection
        title="Endowments"
        description="Enter endowment funding by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "fsendowments_chinese", label: "22. Endowments Chinese" },
            japanese: { name: "fsendowments_japanese", label: "23. Endowments Japanese" },
            korean: { name: "fsendowments_korean", label: "24. Endowments Korean" },
            noncjk: { name: "fsendowments_noncjk", label: "25. Endowments Non-CJK" }
          }}
          useCurrency={true}
          disabled={isReadOnly}
        />
        <SubtotalDisplay
          label="26. Endowments Subtotal"
          value={endowmentsSubtotal}
          formula="22 + 23 + 24 + 25"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fsendowments_subtotal_manual"
            label="26a. Endowments Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
      </FormSection>

      {/* Grants */}
      <FormSection
        title="Grants"
        description="Enter grant funding by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "fsgrants_chinese", label: "27. Grants Chinese" },
            japanese: { name: "fsgrants_japanese", label: "28. Grants Japanese" },
            korean: { name: "fsgrants_korean", label: "29. Grants Korean" },
            noncjk: { name: "fsgrants_noncjk", label: "30. Grants Non-CJK" }
          }}
          useCurrency={true}
          disabled={isReadOnly}
        />
        <SubtotalDisplay
          label="31. Grants Subtotal"
          value={grantsSubtotal}
          formula="27 + 28 + 29 + 30"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fsgrants_subtotal_manual"
            label="31a. Grants Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
      </FormSection>

      {/* East Asian Program Support */}
      <FormSection
        title="East Asian Program Support"
        description="Enter East Asian program support funding by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "fseast_asian_program_support_chinese", label: "32. East Asian Program Support Chinese" },
            japanese: { name: "fseast_asian_program_support_japanese", label: "33. East Asian Program Support Japanese" },
            korean: { name: "fseast_asian_program_support_korean", label: "34. East Asian Program Support Korean" },
            noncjk: { name: "fseast_asian_program_support_noncjk", label: "35. East Asian Program Support Non-CJK" }
          }}
          useCurrency={true}
          disabled={isReadOnly}
        />
        <SubtotalDisplay
          label="36. East Asian Program Support Subtotal"
          value={programSupportSubtotal}
          formula="32 + 33 + 34 + 35"
          isCurrency={true}
        />
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <ReusableCurrencyFormField
            control={form.control}
            name="fseast_asian_program_support_subtotal_manual"
            label="36a. East Asian Program Support Subtotal (Manual Entry)"
            placeholder="0.00"
            disabled={isReadOnly}
            inputClassName="bg-yellow-50 border-yellow-300 focus:ring-yellow-500"
          />
          <p className="text-xs text-yellow-700 mt-1">Optional: Enter a manual subtotal if different from the calculated value above.</p>
        </div>
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
        <ReusableCurrencyFormField
          control={form.control}
          name="fstotal_acquisition_budget"
          label="37. Total Acquisitions Budget"
          placeholder="0.00"
          disabled={isReadOnly}
          className="border-amber-300 focus:ring-amber-500 text-xl font-bold"
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
    </>
  )
}
