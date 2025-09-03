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
  // Purchased Titles (Previous + Add = Total)
  ebooks_purchased_prev_titles_chinese: z.number().min(0).default(0),
  ebooks_purchased_prev_titles_japanese: z.number().min(0).default(0),
  ebooks_purchased_prev_titles_korean: z.number().min(0).default(0),
  ebooks_purchased_prev_titles_noncjk: z.number().min(0).default(0),
  ebooks_purchased_add_titles_chinese: z.number().min(0).default(0),
  ebooks_purchased_add_titles_japanese: z.number().min(0).default(0),
  ebooks_purchased_add_titles_korean: z.number().min(0).default(0),
  ebooks_purchased_add_titles_noncjk: z.number().min(0).default(0),

  // Non-Purchased Titles
  ebooks_nonpurchased_titles_chinese: z.number().min(0).default(0),
  ebooks_nonpurchased_titles_japanese: z.number().min(0).default(0),
  ebooks_nonpurchased_titles_korean: z.number().min(0).default(0),
  ebooks_nonpurchased_titles_noncjk: z.number().min(0).default(0),

  // Subscription Titles
  ebooks_subscription_titles_chinese: z.number().min(0).default(0),
  ebooks_subscription_titles_japanese: z.number().min(0).default(0),
  ebooks_subscription_titles_korean: z.number().min(0).default(0),
  ebooks_subscription_titles_noncjk: z.number().min(0).default(0),

  // Purchased Volumes (Previous + Add = Total)
  ebooks_purchased_prev_volumes_chinese: z.number().min(0).default(0),
  ebooks_purchased_prev_volumes_japanese: z.number().min(0).default(0),
  ebooks_purchased_prev_volumes_korean: z.number().min(0).default(0),
  ebooks_purchased_prev_volumes_noncjk: z.number().min(0).default(0),
  ebooks_purchased_add_volumes_chinese: z.number().min(0).default(0),
  ebooks_purchased_add_volumes_japanese: z.number().min(0).default(0),
  ebooks_purchased_add_volumes_korean: z.number().min(0).default(0),
  ebooks_purchased_add_volumes_noncjk: z.number().min(0).default(0),

  // Non-Purchased Volumes
  ebooks_nonpurchased_volumes_chinese: z.number().min(0).default(0),
  ebooks_nonpurchased_volumes_japanese: z.number().min(0).default(0),
  ebooks_nonpurchased_volumes_korean: z.number().min(0).default(0),
  ebooks_nonpurchased_volumes_noncjk: z.number().min(0).default(0),

  // Subscription Volumes
  ebooks_subscription_volumes_chinese: z.number().min(0).default(0),
  ebooks_subscription_volumes_japanese: z.number().min(0).default(0),
  ebooks_subscription_volumes_korean: z.number().min(0).default(0),
  ebooks_subscription_volumes_noncjk: z.number().min(0).default(0),

  // Purchased Expenditure
  ebpurchased_expenditure_chinese: z.number().min(0).default(0),
  ebpurchased_expenditure_japanese: z.number().min(0).default(0),
  ebpurchased_expenditure_korean: z.number().min(0).default(0),
  ebpurchased_expenditure_noncjk: z.number().min(0).default(0),

  // Subscription Expenditure
  ebsubscription_expenditure_chinese: z.number().min(0).default(0),
  ebsubscription_expenditure_japanese: z.number().min(0).default(0),
  ebsubscription_expenditure_korean: z.number().min(0).default(0),
  ebsubscription_expenditure_noncjk: z.number().min(0).default(0),

  // Grand Total Expenditure
  ebooks_expenditure_grandtotal: z.number().min(0).default(0),

  // Notes
  ebooks_notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function ElectronicBooksForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      ebooks_purchased_prev_titles_chinese: 0,
      ebooks_purchased_prev_titles_japanese: 0,
      ebooks_purchased_prev_titles_korean: 0,
      ebooks_purchased_prev_titles_noncjk: 0,
      ebooks_purchased_add_titles_chinese: 0,
      ebooks_purchased_add_titles_japanese: 0,
      ebooks_purchased_add_titles_korean: 0,
      ebooks_purchased_add_titles_noncjk: 0,
      ebooks_nonpurchased_titles_chinese: 0,
      ebooks_nonpurchased_titles_japanese: 0,
      ebooks_nonpurchased_titles_korean: 0,
      ebooks_nonpurchased_titles_noncjk: 0,
      ebooks_subscription_titles_chinese: 0,
      ebooks_subscription_titles_japanese: 0,
      ebooks_subscription_titles_korean: 0,
      ebooks_subscription_titles_noncjk: 0,
      ebooks_purchased_prev_volumes_chinese: 0,
      ebooks_purchased_prev_volumes_japanese: 0,
      ebooks_purchased_prev_volumes_korean: 0,
      ebooks_purchased_prev_volumes_noncjk: 0,
      ebooks_purchased_add_volumes_chinese: 0,
      ebooks_purchased_add_volumes_japanese: 0,
      ebooks_purchased_add_volumes_korean: 0,
      ebooks_purchased_add_volumes_noncjk: 0,
      ebooks_nonpurchased_volumes_chinese: 0,
      ebooks_nonpurchased_volumes_japanese: 0,
      ebooks_nonpurchased_volumes_korean: 0,
      ebooks_nonpurchased_volumes_noncjk: 0,
      ebooks_subscription_volumes_chinese: 0,
      ebooks_subscription_volumes_japanese: 0,
      ebooks_subscription_volumes_korean: 0,
      ebooks_subscription_volumes_noncjk: 0,
      ebpurchased_expenditure_chinese: 0,
      ebpurchased_expenditure_japanese: 0,
      ebpurchased_expenditure_korean: 0,
      ebpurchased_expenditure_noncjk: 0,
      ebsubscription_expenditure_chinese: 0,
      ebsubscription_expenditure_japanese: 0,
      ebsubscription_expenditure_korean: 0,
      ebsubscription_expenditure_noncjk: 0,
      ebooks_expenditure_grandtotal: 0,
      ebooks_notes: "",
    },
  })

  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/electronic-books/status')

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch(`/api/electronic-books/status/${params.libid}`)
        if (response.ok) {
          const data = await response.json()
          if (data.existingData) {
            Object.keys(data.existingData).forEach(key => {
              if (key !== 'id' && key !== 'entryid' && key !== 'libid' && key !== 'year' && key !== 'libraryyear') {
                form.setValue(key as keyof FormData, data.existingData[key] || 0)
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

  // Calculate subtotals and totals
  const purchasedPrevTitlesSubtotal = (watchedValues.ebooks_purchased_prev_titles_chinese || 0) + 
    (watchedValues.ebooks_purchased_prev_titles_japanese || 0) + 
    (watchedValues.ebooks_purchased_prev_titles_korean || 0) + 
    (watchedValues.ebooks_purchased_prev_titles_noncjk || 0)

  const purchasedAddTitlesSubtotal = (watchedValues.ebooks_purchased_add_titles_chinese || 0) + 
    (watchedValues.ebooks_purchased_add_titles_japanese || 0) + 
    (watchedValues.ebooks_purchased_add_titles_korean || 0) + 
    (watchedValues.ebooks_purchased_add_titles_noncjk || 0)

  const purchasedTotalTitlesChinese = (watchedValues.ebooks_purchased_prev_titles_chinese || 0) + (watchedValues.ebooks_purchased_add_titles_chinese || 0)
  const purchasedTotalTitlesJapanese = (watchedValues.ebooks_purchased_prev_titles_japanese || 0) + (watchedValues.ebooks_purchased_add_titles_japanese || 0)
  const purchasedTotalTitlesKorean = (watchedValues.ebooks_purchased_prev_titles_korean || 0) + (watchedValues.ebooks_purchased_add_titles_korean || 0)
  const purchasedTotalTitlesNoncjk = (watchedValues.ebooks_purchased_prev_titles_noncjk || 0) + (watchedValues.ebooks_purchased_add_titles_noncjk || 0)
  const purchasedTotalTitlesSubtotal = purchasedTotalTitlesChinese + purchasedTotalTitlesJapanese + purchasedTotalTitlesKorean + purchasedTotalTitlesNoncjk

  const nonPurchasedTitlesSubtotal = (watchedValues.ebooks_nonpurchased_titles_chinese || 0) + 
    (watchedValues.ebooks_nonpurchased_titles_japanese || 0) + 
    (watchedValues.ebooks_nonpurchased_titles_korean || 0) + 
    (watchedValues.ebooks_nonpurchased_titles_noncjk || 0)

  const subscriptionTitlesSubtotal = (watchedValues.ebooks_subscription_titles_chinese || 0) + 
    (watchedValues.ebooks_subscription_titles_japanese || 0) + 
    (watchedValues.ebooks_subscription_titles_korean || 0) + 
    (watchedValues.ebooks_subscription_titles_noncjk || 0)

  const purchasedPrevVolumesSubtotal = (watchedValues.ebooks_purchased_prev_volumes_chinese || 0) + 
    (watchedValues.ebooks_purchased_prev_volumes_japanese || 0) + 
    (watchedValues.ebooks_purchased_prev_volumes_korean || 0) + 
    (watchedValues.ebooks_purchased_prev_volumes_noncjk || 0)

  const purchasedAddVolumesSubtotal = (watchedValues.ebooks_purchased_add_volumes_chinese || 0) + 
    (watchedValues.ebooks_purchased_add_volumes_japanese || 0) + 
    (watchedValues.ebooks_purchased_add_volumes_korean || 0) + 
    (watchedValues.ebooks_purchased_add_volumes_noncjk || 0)

  const purchasedTotalVolumesChinese = (watchedValues.ebooks_purchased_prev_volumes_chinese || 0) + (watchedValues.ebooks_purchased_add_volumes_chinese || 0)
  const purchasedTotalVolumesJapanese = (watchedValues.ebooks_purchased_prev_volumes_japanese || 0) + (watchedValues.ebooks_purchased_add_volumes_japanese || 0)
  const purchasedTotalVolumesKorean = (watchedValues.ebooks_purchased_prev_volumes_korean || 0) + (watchedValues.ebooks_purchased_add_volumes_korean || 0)
  const purchasedTotalVolumesNoncjk = (watchedValues.ebooks_purchased_prev_volumes_noncjk || 0) + (watchedValues.ebooks_purchased_add_volumes_noncjk || 0)
  const purchasedTotalVolumesSubtotal = purchasedTotalVolumesChinese + purchasedTotalVolumesJapanese + purchasedTotalVolumesKorean + purchasedTotalVolumesNoncjk

  const nonPurchasedVolumesSubtotal = (watchedValues.ebooks_nonpurchased_volumes_chinese || 0) + 
    (watchedValues.ebooks_nonpurchased_volumes_japanese || 0) + 
    (watchedValues.ebooks_nonpurchased_volumes_korean || 0) + 
    (watchedValues.ebooks_nonpurchased_volumes_noncjk || 0)

  const subscriptionVolumesSubtotal = (watchedValues.ebooks_subscription_volumes_chinese || 0) + 
    (watchedValues.ebooks_subscription_volumes_japanese || 0) + 
    (watchedValues.ebooks_subscription_volumes_korean || 0) + 
    (watchedValues.ebooks_subscription_volumes_noncjk || 0)

  const totalTitles = purchasedTotalTitlesSubtotal + nonPurchasedTitlesSubtotal
  const totalVolumes = purchasedTotalVolumesSubtotal + nonPurchasedVolumesSubtotal

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const submissionData = {
        ...values,
        // Add calculated subtotals and totals
        ebooks_purchased_prev_titles_subtotal: purchasedPrevTitlesSubtotal,
        ebooks_purchased_add_titles_subtotal: purchasedAddTitlesSubtotal,
        ebooks_purchased_titles_chinese: purchasedTotalTitlesChinese,
        ebooks_purchased_titles_japanese: purchasedTotalTitlesJapanese,
        ebooks_purchased_titles_korean: purchasedTotalTitlesKorean,
        ebooks_purchased_titles_noncjk: purchasedTotalTitlesNoncjk,
        ebooks_purchased_titles_subtotal: purchasedTotalTitlesSubtotal,
        ebooks_nonpurchased_titles_subtotal: nonPurchasedTitlesSubtotal,
        ebooks_subscription_titles_subtotal: subscriptionTitlesSubtotal,
        ebooks_purchased_prev_volumes_subtotal: purchasedPrevVolumesSubtotal,
        ebooks_purchased_add_volumes_subtotal: purchasedAddVolumesSubtotal,
        ebooks_purchased_volumes_chinese: purchasedTotalVolumesChinese,
        ebooks_purchased_volumes_japanese: purchasedTotalVolumesJapanese,
        ebooks_purchased_volumes_korean: purchasedTotalVolumesKorean,
        ebooks_purchased_volumes_noncjk: purchasedTotalVolumesNoncjk,
        ebooks_purchased_volumes_subtotal: purchasedTotalVolumesSubtotal,
        ebooks_nonpurchased_volumes_subtotal: nonPurchasedVolumesSubtotal,
        ebooks_subscription_volumes_subtotal: subscriptionVolumesSubtotal,
        ebooks_total_titles: totalTitles,
        ebooks_total_volumes: totalVolumes,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/electronic-books/create', {
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
      setSuccessMessage('Electronic books form submitted successfully!')
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
      {/* Purchased Titles */}
      <FormSection
        title="Purchased Titles"
        description="Report the number of purchased electronic book titles."
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Previous Year (System-supplied)</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "ebooks_purchased_prev_titles_chinese", label: "01. Chinese (Previous)", disabled: true },
                japanese: { name: "ebooks_purchased_prev_titles_japanese", label: "02. Japanese (Previous)", disabled: true },
                korean: { name: "ebooks_purchased_prev_titles_korean", label: "03. Korean (Previous)", disabled: true },
                eastasian: { name: "ebooks_purchased_prev_titles_noncjk", label: "04. Non-CJK (Previous)", disabled: true }
              }}
            />
            <SubtotalDisplay
              label="05. Previous Subtotal"
              value={purchasedPrevTitlesSubtotal}
              formula="01 + 02 + 03 + 04"
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Add This Year (Manual Entry)</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "ebooks_purchased_add_titles_chinese", label: "06. Chinese (Add)", disabled: !libraryYearStatus?.is_open_for_editing },
                japanese: { name: "ebooks_purchased_add_titles_japanese", label: "07. Japanese (Add)", disabled: !libraryYearStatus?.is_open_for_editing },
                korean: { name: "ebooks_purchased_add_titles_korean", label: "08. Korean (Add)", disabled: !libraryYearStatus?.is_open_for_editing },
                eastasian: { name: "ebooks_purchased_add_titles_noncjk", label: "09. Non-CJK (Add)", disabled: !libraryYearStatus?.is_open_for_editing }
              }}
            />
            <SubtotalDisplay
              label="10. Add Subtotal"
              value={purchasedAddTitlesSubtotal}
              formula="06 + 07 + 08 + 09"
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Total (Previous + Add)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SubtotalDisplay label="11. Chinese Total" value={purchasedTotalTitlesChinese} formula="01 + 06" />
              <SubtotalDisplay label="12. Japanese Total" value={purchasedTotalTitlesJapanese} formula="02 + 07" />
              <SubtotalDisplay label="13. Korean Total" value={purchasedTotalTitlesKorean} formula="03 + 08" />
              <SubtotalDisplay label="14. Non-CJK Total" value={purchasedTotalTitlesNoncjk} formula="04 + 09" />
            </div>
            <SubtotalDisplay
              label="15. Purchased Titles Total"
              value={purchasedTotalTitlesSubtotal}
              formula="11 + 12 + 13 + 14"
            />
          </div>
        </div>
      </FormSection>

      {/* Non-Purchased Titles */}
      <FormSection
        title="Non-Purchased Titles"
        description="Report the number of non-purchased electronic book titles."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "ebooks_nonpurchased_titles_chinese", label: "16. Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "ebooks_nonpurchased_titles_japanese", label: "17. Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "ebooks_nonpurchased_titles_korean", label: "18. Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "ebooks_nonpurchased_titles_noncjk", label: "19. Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="20. Non-Purchased Titles Subtotal"
          value={nonPurchasedTitlesSubtotal}
          formula="16 + 17 + 18 + 19"
        />
      </FormSection>

      {/* Subscription Titles */}
      <FormSection
        title="Subscription Titles"
        description="Use the 'Import from E-Book Database by Subscription' feature after updating your subscription list."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "ebooks_subscription_titles_chinese", label: "21. Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "ebooks_subscription_titles_japanese", label: "22. Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "ebooks_subscription_titles_korean", label: "23. Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "ebooks_subscription_titles_noncjk", label: "24. Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="25. Subscription Titles Subtotal"
          value={subscriptionTitlesSubtotal}
          formula="21 + 22 + 23 + 24"
        />
      </FormSection>

      {/* Purchased Volumes */}
      <FormSection
        title="Purchased Volumes"
        description="Report the number of purchased electronic book volumes."
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Previous Year (System-supplied)</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "ebooks_purchased_prev_volumes_chinese", label: "26. Chinese (Previous)", disabled: true },
                japanese: { name: "ebooks_purchased_prev_volumes_japanese", label: "27. Japanese (Previous)", disabled: true },
                korean: { name: "ebooks_purchased_prev_volumes_korean", label: "28. Korean (Previous)", disabled: true },
                eastasian: { name: "ebooks_purchased_prev_volumes_noncjk", label: "29. Non-CJK (Previous)", disabled: true }
              }}
            />
            <SubtotalDisplay
              label="30. Previous Volumes Subtotal"
              value={purchasedPrevVolumesSubtotal}
              formula="26 + 27 + 28 + 29"
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Add This Year (Manual Entry)</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "ebooks_purchased_add_volumes_chinese", label: "31. Chinese (Add)", disabled: !libraryYearStatus?.is_open_for_editing },
                japanese: { name: "ebooks_purchased_add_volumes_japanese", label: "32. Japanese (Add)", disabled: !libraryYearStatus?.is_open_for_editing },
                korean: { name: "ebooks_purchased_add_volumes_korean", label: "33. Korean (Add)", disabled: !libraryYearStatus?.is_open_for_editing },
                eastasian: { name: "ebooks_purchased_add_volumes_noncjk", label: "34. Non-CJK (Add)", disabled: !libraryYearStatus?.is_open_for_editing }
              }}
            />
            <SubtotalDisplay
              label="35. Add Volumes Subtotal"
              value={purchasedAddVolumesSubtotal}
              formula="31 + 32 + 33 + 34"
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Total (Previous + Add)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SubtotalDisplay label="36. Chinese Total" value={purchasedTotalVolumesChinese} formula="26 + 31" />
              <SubtotalDisplay label="37. Japanese Total" value={purchasedTotalVolumesJapanese} formula="27 + 32" />
              <SubtotalDisplay label="38. Korean Total" value={purchasedTotalVolumesKorean} formula="28 + 33" />
              <SubtotalDisplay label="39. Non-CJK Total" value={purchasedTotalVolumesNoncjk} formula="29 + 34" />
            </div>
            <SubtotalDisplay
              label="40. Purchased Volumes Total"
              value={purchasedTotalVolumesSubtotal}
              formula="36 + 37 + 38 + 39"
            />
          </div>
        </div>
      </FormSection>

      {/* Non-Purchased Volumes */}
      <FormSection
        title="Non-Purchased Volumes"
        description="Report the number of non-purchased electronic book volumes."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "ebooks_nonpurchased_volumes_chinese", label: "41. Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "ebooks_nonpurchased_volumes_japanese", label: "42. Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "ebooks_nonpurchased_volumes_korean", label: "43. Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "ebooks_nonpurchased_volumes_noncjk", label: "44. Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="45. Non-Purchased Volumes Subtotal"
          value={nonPurchasedVolumesSubtotal}
          formula="41 + 42 + 43 + 44"
        />
      </FormSection>

      {/* Subscription Volumes */}
      <FormSection
        title="Subscription Volumes"
        description="Use the 'Import from E-Book Database by Subscription' feature after updating your subscription list."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "ebooks_subscription_volumes_chinese", label: "46. Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "ebooks_subscription_volumes_japanese", label: "47. Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "ebooks_subscription_volumes_korean", label: "48. Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "ebooks_subscription_volumes_noncjk", label: "49. Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="50. Subscription Volumes Subtotal"
          value={subscriptionVolumesSubtotal}
          formula="46 + 47 + 48 + 49"
        />
      </FormSection>

      {/* Totals */}
      <FormSection
        title="Totals"
        description="Auto-calculated totals for titles and volumes."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubtotalDisplay
            label="51. Title Total"
            value={totalTitles}
            formula="15 + 20"
          />
          <SubtotalDisplay
            label="52. Volume Total"
            value={totalVolumes}
            formula="40 + 45"
          />
        </div>
      </FormSection>

      {/* Expenditure */}
      <FormSection
        title="Expenditure"
        description="Record total expenditures for electronic books in U.S. dollars."
      >
        <ReusableFormField
          control={form.control}
          name="ebooks_expenditure_grandtotal"
          label="53. Expenditure Total ($)"
          placeholder="0.00"
          type="number"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information or comments about electronic books."
      >
        <div className="text-lg font-semibold p-4 bg-gray-50 rounded">
          Total Expenditure: ${
            (form.watch('ebpurchased_expenditure_chinese') || 0) +
            (form.watch('ebpurchased_expenditure_japanese') || 0) +
            (form.watch('ebpurchased_expenditure_korean') || 0) +
            (form.watch('ebpurchased_expenditure_noncjk') || 0) +
            (form.watch('ebsubscription_expenditure_chinese') || 0) +
            (form.watch('ebsubscription_expenditure_japanese') || 0) +
            (form.watch('ebsubscription_expenditure_korean') || 0) +
            (form.watch('ebsubscription_expenditure_noncjk') || 0)
          }
        </div>
        <ReusableFormField
          control={form.control}
          name="ebooks_notes"
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
        submitButtonText="Submit Electronic Books Data"
      />
    </FormWrapper>
  )
}
