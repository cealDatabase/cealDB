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
  // Entry ID (optional)
  entryid: z.string().optional(),
  
  // Serial Titles: Purchased (including Subscriptions) - Electronic
  s_epurchased_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  s_epurchased_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  s_epurchased_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  s_epurchased_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Serial Titles: Purchased (including Subscriptions) - Print and other formats
  spurchased_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  spurchased_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  spurchased_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  spurchased_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Non-Purchased Serials (includes Gifts) - Electronic
  s_enonpurchased_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  s_enonpurchased_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  s_enonpurchased_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  s_enonpurchased_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Non-Purchased Serials (includes Gifts) - Print and other formats
  snonpurchased_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  snonpurchased_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  snonpurchased_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  snonpurchased_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Totals - Electronic
  s_etotal_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  s_etotal_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  s_etotal_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  s_etotal_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Totals - Print and other formats
  stotal_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  stotal_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  stotal_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  stotal_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  snotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function SerialsForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  // Use the reusable hook for status checking
  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/serials/status')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryid: "",
      // Serial Titles: Purchased (including Subscriptions) - Electronic
      s_epurchased_chinese: 0,
      s_epurchased_japanese: 0,
      s_epurchased_korean: 0,
      s_epurchased_noncjk: 0,
      // Serial Titles: Purchased (including Subscriptions) - Print and other formats
      spurchased_chinese: 0,
      spurchased_japanese: 0,
      spurchased_korean: 0,
      spurchased_noncjk: 0,
      // Non-Purchased Serials (includes Gifts) - Electronic
      s_enonpurchased_chinese: 0,
      s_enonpurchased_japanese: 0,
      s_enonpurchased_korean: 0,
      s_enonpurchased_noncjk: 0,
      // Non-Purchased Serials (includes Gifts) - Print and other formats
      snonpurchased_chinese: 0,
      snonpurchased_japanese: 0,
      snonpurchased_korean: 0,
      snonpurchased_noncjk: 0,
      // Totals - Electronic
      s_etotal_chinese: 0,
      s_etotal_japanese: 0,
      s_etotal_korean: 0,
      s_etotal_noncjk: 0,
      // Totals - Print and other formats
      stotal_chinese: 0,
      stotal_japanese: 0,
      stotal_korean: 0,
      stotal_noncjk: 0,
      snotes: "",
    },
  })

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals and grand total
  const purchasedElectronicSubtotal = watchedValues.s_epurchased_chinese + watchedValues.s_epurchased_japanese + watchedValues.s_epurchased_korean + watchedValues.s_epurchased_noncjk;
  const purchasedPrintSubtotal = watchedValues.spurchased_chinese + watchedValues.spurchased_japanese + watchedValues.spurchased_korean + watchedValues.spurchased_noncjk;
  const nonPurchasedElectronicSubtotal = watchedValues.s_enonpurchased_chinese + watchedValues.s_enonpurchased_japanese + watchedValues.s_enonpurchased_korean + watchedValues.s_enonpurchased_noncjk;
  const nonPurchasedPrintSubtotal = watchedValues.snonpurchased_chinese + watchedValues.snonpurchased_japanese + watchedValues.snonpurchased_korean + watchedValues.snonpurchased_noncjk;
  
  // Calculate totals by language
  const totalElectronicChinese = watchedValues.s_epurchased_chinese + watchedValues.s_enonpurchased_chinese;
  const totalElectronicJapanese = watchedValues.s_epurchased_japanese + watchedValues.s_enonpurchased_japanese;
  const totalElectronicKorean = watchedValues.s_epurchased_korean + watchedValues.s_enonpurchased_korean;
  const totalElectronicNonCJK = watchedValues.s_epurchased_noncjk + watchedValues.s_enonpurchased_noncjk;
  
  const totalPrintChinese = watchedValues.spurchased_chinese + watchedValues.snonpurchased_chinese;
  const totalPrintJapanese = watchedValues.spurchased_japanese + watchedValues.snonpurchased_japanese;
  const totalPrintKorean = watchedValues.spurchased_korean + watchedValues.snonpurchased_korean;
  const totalPrintNonCJK = watchedValues.spurchased_noncjk + watchedValues.snonpurchased_noncjk;
  
  const electronicGrandTotal = purchasedElectronicSubtotal + nonPurchasedElectronicSubtotal;
  const printGrandTotal = purchasedPrintSubtotal + nonPurchasedPrintSubtotal;
  const overallGrandTotal = electronicGrandTotal + printGrandTotal;


  // Update calculated total fields in the form
  useEffect(() => {
    form.setValue('s_etotal_chinese', totalElectronicChinese);
    form.setValue('s_etotal_japanese', totalElectronicJapanese);
    form.setValue('s_etotal_korean', totalElectronicKorean);
    form.setValue('s_etotal_noncjk', totalElectronicNonCJK);
    form.setValue('stotal_chinese', totalPrintChinese);
    form.setValue('stotal_japanese', totalPrintJapanese);
    form.setValue('stotal_korean', totalPrintKorean);
    form.setValue('stotal_noncjk', totalPrintNonCJK);
  }, [form, totalElectronicChinese, totalElectronicJapanese, totalElectronicKorean, totalElectronicNonCJK, totalPrintChinese, totalPrintJapanese, totalPrintKorean, totalPrintNonCJK]);

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      // Add calculated totals to the submission data
      const submissionData = {
        ...values,
        // Subtotals
        s_epurchased_subtotal: purchasedElectronicSubtotal,
        spurchased_subtotal: purchasedPrintSubtotal,
        s_enonpurchased_subtotal: nonPurchasedElectronicSubtotal,
        snonpurchased_subtotal: nonPurchasedPrintSubtotal,
        // Totals by language
        s_etotal_chinese: totalElectronicChinese,
        s_etotal_japanese: totalElectronicJapanese,
        s_etotal_korean: totalElectronicKorean,
        s_etotal_noncjk: totalElectronicNonCJK,
        stotal_chinese: totalPrintChinese,
        stotal_japanese: totalPrintJapanese,
        stotal_korean: totalPrintKorean,
        stotal_noncjk: totalPrintNonCJK,
        // Grand totals
        s_egrandtotal: electronicGrandTotal,
        sgrandtotal: printGrandTotal,
        libid: params.libid,
      };

      const response = await fetch('/api/serials/create', {
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
      toast.success('Serials record created successfully!')
      
      setSuccessMessage(result.message || 'Serials record submitted successfully!');
      
      form.reset()
      
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Something went wrong')
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
      {/* 1. Serial Titles: Purchased (including Subscriptions) - Electronic */}
      <FormSection
        title="1. Serial Titles: Purchased (including Subscriptions) - Electronic"
        description="Enter the number of purchased electronic serials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "s_epurchased_chinese", label: "01. Purchased Chinese" },
            japanese: { name: "s_epurchased_japanese", label: "02. Purchased Japanese" },
            korean: { name: "s_epurchased_korean", label: "03. Purchased Korean" },
            noncjk: { name: "s_epurchased_noncjk", label: "04. Purchased Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="05. Electronic Purchased Subtotal"
          value={purchasedElectronicSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* 2. Serial Titles: Purchased (including Subscriptions) - Print and other formats */}
      <FormSection
        title="2. Serial Titles: Purchased (including Subscriptions) - Print and other formats"
        description="Enter the number of purchased print serials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "spurchased_chinese", label: "06. Purchased Chinese" },
            japanese: { name: "spurchased_japanese", label: "07. Purchased Japanese" },
            korean: { name: "spurchased_korean", label: "08. Purchased Korean" },
            noncjk: { name: "spurchased_noncjk", label: "09. Purchased Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="10. Print Purchased Subtotal"
          value={purchasedPrintSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* 3. Non-Purchased Serials - Electronic */}
      <FormSection
        title="3. Non-Purchased Serials - Electronic"
        description="Enter the number of non-purchased electronic serials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "s_enonpurchased_chinese", label: "11. Non-Purchased Chinese" },
            japanese: { name: "s_enonpurchased_japanese", label: "12. Non-Purchased Japanese" },
            korean: { name: "s_enonpurchased_korean", label: "13. Non-Purchased Korean" },
            noncjk: { name: "s_enonpurchased_noncjk", label: "14. Non-Purchased Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="15. Electronic Non-Purchased Subtotal"
          value={nonPurchasedElectronicSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* 4. Non-Purchased Serials - Print and other formats */}
      <FormSection
        title="4. Non-Purchased Serials - Print and other formats"
        description="Enter the number of non-purchased print serials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "snonpurchased_chinese", label: "16. Non-Purchased Chinese" },
            japanese: { name: "snonpurchased_japanese", label: "17. Non-Purchased Japanese" },
            korean: { name: "snonpurchased_korean", label: "18. Non-Purchased Korean" },
            noncjk: { name: "snonpurchased_noncjk", label: "19. Non-Purchased Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="20. Print Non-Purchased Subtotal"
          value={nonPurchasedPrintSubtotal}
          formula="16 + 17 + 18 + 19"
        />
      </FormSection>

      {/* 5. Totals - Electronic */}
      <FormSection
        title="5. Totals - Electronic"
        description="Calculated totals for electronic serials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "s_etotal_chinese", label: "21. Total Chinese", disabled: true },
            japanese: { name: "s_etotal_japanese", label: "22. Total Japanese", disabled: true },
            korean: { name: "s_etotal_korean", label: "23. Total Korean", disabled: true },
            noncjk: { name: "s_etotal_noncjk", label: "24. Total Non-CJK", disabled: true }
          }}
        />
        <SubtotalDisplay
          label="25. Electronic Grand Total"
          value={electronicGrandTotal}
          formula="21 + 22 + 23 + 24"
        />
      </FormSection>

      {/* 6. Totals - Print and other formats */}
      <FormSection
        title="6. Totals - Print and other formats"
        description="Calculated totals for print serials by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "stotal_chinese", label: "26. Total Chinese", disabled: true },
            japanese: { name: "stotal_japanese", label: "27. Total Japanese", disabled: true },
            korean: { name: "stotal_korean", label: "28. Total Korean", disabled: true },
            noncjk: { name: "stotal_noncjk", label: "29. Total Non-CJK", disabled: true }
          }}
        />
        <SubtotalDisplay
          label="30. Print Grand Total"
          value={printGrandTotal}
          formula="26 + 27 + 28 + 29"
        />
      </FormSection>

      {/* 7. Grand Totals */}
      <FormSection
        title="7. Grand Totals"
        description="Overall grand totals for all serials."
      >
        <SubtotalDisplay
          label="31. Overall Grand Total"
          value={overallGrandTotal}
          formula="25 + 30"
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional notes or comments about the serials data."
      >
        <ReusableFormField
          control={form.control}
          name="snotes"
          label=""
          type="textarea"
          placeholder="Enter any additional notes or comments..."
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Serials Data"
      />
    </FormWrapper>
  )
}
