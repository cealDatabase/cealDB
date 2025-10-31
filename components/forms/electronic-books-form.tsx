import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

import { ReusableFormField } from "./ReusableFormField"
import { useFormStatusChecker } from "@/hooks/useFormStatusChecker"
import { getSurveyDates } from "@/lib/surveyDates"
import { formatSimpleDate } from "@/lib/dateFormatting"
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

  // Expenditure (Field #33 - note: main expenditure is in Electronic form #41)
  ebooks_expenditure_grandtotal: z.number().min(0).default(0),

  // Notes
  ebooks_notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function ElectronicBooksForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [physicalVolumesTotal, setPhysicalVolumesTotal] = useState(0)
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
      ebooks_expenditure_grandtotal: 0,
      ebooks_notes: "",
    },
  })

  const { libraryYearStatus, isLoading, existingData, previousYearData } = useFormStatusChecker('/api/electronic-books/status')

  // Pre-populate form with existing data and previous year data
  useEffect(() => {
    if (existingData) {
      Object.keys(existingData).forEach((key) => {
        if (key in form.getValues() && existingData[key] !== null && existingData[key] !== undefined) {
          form.setValue(key as keyof FormData, existingData[key])
        }
      })
    }

    // Auto-fill previous year data if not already populated
    if (previousYearData && !existingData) {
      // Only populate if this is a new form (existingData is null/undefined)
      console.log('[E-Books Form] Auto-filling previous year data:', previousYearData);
      
      // Purchased Titles Previous
      if (previousYearData.ebooks_purchased_prev_titles_chinese !== null && previousYearData.ebooks_purchased_prev_titles_chinese !== undefined) {
        form.setValue('ebooks_purchased_prev_titles_chinese', previousYearData.ebooks_purchased_prev_titles_chinese);
      }
      if (previousYearData.ebooks_purchased_prev_titles_japanese !== null && previousYearData.ebooks_purchased_prev_titles_japanese !== undefined) {
        form.setValue('ebooks_purchased_prev_titles_japanese', previousYearData.ebooks_purchased_prev_titles_japanese);
      }
      if (previousYearData.ebooks_purchased_prev_titles_korean !== null && previousYearData.ebooks_purchased_prev_titles_korean !== undefined) {
        form.setValue('ebooks_purchased_prev_titles_korean', previousYearData.ebooks_purchased_prev_titles_korean);
      }
      if (previousYearData.ebooks_purchased_prev_titles_noncjk !== null && previousYearData.ebooks_purchased_prev_titles_noncjk !== undefined) {
        form.setValue('ebooks_purchased_prev_titles_noncjk', previousYearData.ebooks_purchased_prev_titles_noncjk);
      }

      // Purchased Volumes Previous
      if (previousYearData.ebooks_purchased_prev_volumes_chinese !== null && previousYearData.ebooks_purchased_prev_volumes_chinese !== undefined) {
        form.setValue('ebooks_purchased_prev_volumes_chinese', previousYearData.ebooks_purchased_prev_volumes_chinese);
      }
      if (previousYearData.ebooks_purchased_prev_volumes_japanese !== null && previousYearData.ebooks_purchased_prev_volumes_japanese !== undefined) {
        form.setValue('ebooks_purchased_prev_volumes_japanese', previousYearData.ebooks_purchased_prev_volumes_japanese);
      }
      if (previousYearData.ebooks_purchased_prev_volumes_korean !== null && previousYearData.ebooks_purchased_prev_volumes_korean !== undefined) {
        form.setValue('ebooks_purchased_prev_volumes_korean', previousYearData.ebooks_purchased_prev_volumes_korean);
      }
      if (previousYearData.ebooks_purchased_prev_volumes_noncjk !== null && previousYearData.ebooks_purchased_prev_volumes_noncjk !== undefined) {
        form.setValue('ebooks_purchased_prev_volumes_noncjk', previousYearData.ebooks_purchased_prev_volumes_noncjk);
      }
    }
  }, [existingData, previousYearData, form])

  // Load Physical Volumes Total from Volume Holdings form (field #16)
  useEffect(() => {
    const loadPhysicalVolumes = async () => {
      try {
        const libraryId = Number(params.libid);
        const response = await fetch(`/api/volumeHoldings/status/${libraryId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            // Calculate field #16: Grand Total (Physical Vols) = Previous + Added - Withdrawn
            const previousSubtotal = (result.data.vhprevious_year_chinese || 0) +
              (result.data.vhprevious_year_japanese || 0) +
              (result.data.vhprevious_year_korean || 0) +
              (result.data.vhprevious_year_noncjk || 0);
            const addedSubtotal = (result.data.vhadded_gross_chinese || 0) +
              (result.data.vhadded_gross_japanese || 0) +
              (result.data.vhadded_gross_korean || 0) +
              (result.data.vhadded_gross_noncjk || 0);
            const withdrawnSubtotal = (result.data.vhwithdrawn_chinese || 0) +
              (result.data.vhwithdrawn_japanese || 0) +
              (result.data.vhwithdrawn_korean || 0) +
              (result.data.vhwithdrawn_noncjk || 0);
            const physicalGrandTotal = previousSubtotal + addedSubtotal - withdrawnSubtotal;
            setPhysicalVolumesTotal(physicalGrandTotal);
            console.log('Physical Volumes Total loaded:', physicalGrandTotal);
          } else {
            setPhysicalVolumesTotal(0);
          }
        } else {
          console.log('No Physical Volume Holdings data found');
          setPhysicalVolumesTotal(0);
        }
      } catch (error) {
        console.log('Error loading Physical Volumes Total:', error);
        setPhysicalVolumesTotal(0);
      }
    };

    if (params.libid) {
      loadPhysicalVolumes();
    }
  }, [params.libid])

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
  const grandTotalVolumeHoldings = physicalVolumesTotal + totalVolumes

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

  // Import subscription titles function
  const importSubscriptionTitles = async () => {
    try {
      const libraryId = Number(params.libid);
      const currentYear = new Date().getFullYear();

      const response = await fetch(`/api/electronic-books/import-subscription-titles/${libraryId}/${currentYear}`);
      if (response.ok) {
        const data = await response.json();
        form.setValue('ebooks_subscription_titles_chinese', data.chinese || 0, { shouldValidate: false });
        form.setValue('ebooks_subscription_titles_japanese', data.japanese || 0, { shouldValidate: false });
        form.setValue('ebooks_subscription_titles_korean', data.korean || 0, { shouldValidate: false });
        form.setValue('ebooks_subscription_titles_noncjk', data.noncjk || 0, { shouldValidate: false });
        toast.success('Subscription titles imported successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to import subscription titles');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import subscription titles');
    }
  };

  // Import subscription volumes function
  const importSubscriptionVolumes = async () => {
    try {
      const libraryId = Number(params.libid);
      const currentYear = new Date().getFullYear();

      const response = await fetch(`/api/electronic-books/import-subscription-volumes/${libraryId}/${currentYear}`);
      if (response.ok) {
        const data = await response.json();
        form.setValue('ebooks_subscription_volumes_chinese', data.chinese || 0, { shouldValidate: false });
        form.setValue('ebooks_subscription_volumes_japanese', data.japanese || 0, { shouldValidate: false });
        form.setValue('ebooks_subscription_volumes_korean', data.korean || 0, { shouldValidate: false });
        form.setValue('ebooks_subscription_volumes_noncjk', data.noncjk || 0, { shouldValidate: false });
        toast.success('Subscription volumes imported successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to import subscription volumes');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import subscription volumes');
    }
  };

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
        finalSubmit: true,
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

  async function handleSaveDraft() {
    try {
      setIsSavingDraft(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      const values = form.getValues()
      const submissionData = {
        ...values,
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
      {/* Purchased Titles */}
      <FormSection
        title='Purchased Titles'
        description='Report the number of purchased electronic book titles.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 p-2 text-left w-1/4'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Previous
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Add
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  01. Chinese
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_titles_chinese'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_titles_chinese'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalTitlesChinese}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  02. Japanese
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_titles_japanese'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_titles_japanese'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalTitlesJapanese}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  03. Korean
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_titles_korean'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_titles_korean'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalTitlesKorean}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  04. Non-CJK
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_titles_noncjk'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_titles_noncjk'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalTitlesNoncjk}
                  </div>
                </td>
              </tr>
              <tr className='bg-gray-100'>
                <td className='border border-gray-300 p-2 font-bold'>
                  05. Subtotal
                  <br />
                  <span className='text-xs font-normal'>
                    (01 + 02 + 03 + 04)
                  </span>
                </td>
                <td className='border border-gray-300 p-2 bg-gray-200'>
                  <div className='p-3 text-center font-bold'>
                    {purchasedPrevTitlesSubtotal}
                  </div>
                </td>
                <td className='border border-gray-300 p-2 bg-gray-200'>
                  <div className='p-3 text-center font-bold'>
                    {purchasedAddTitlesSubtotal}
                  </div>
                </td>
                <td className='border border-gray-300 p-2 bg-gray-200'>
                  <div className='p-3 text-center font-bold'>
                    {purchasedTotalTitlesSubtotal}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FormSection>

      {/* Non-Purchased Titles */}
      <FormSection
        title='Non-Purchased Titles'
        description='Report the number of non-purchased electronic book titles.'
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: {
              name: "ebooks_nonpurchased_titles_chinese",
              label: "06. Chinese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            japanese: {
              name: "ebooks_nonpurchased_titles_japanese",
              label: "07. Japanese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            korean: {
              name: "ebooks_nonpurchased_titles_korean",
              label: "08. Korean",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            eastasian: {
              name: "ebooks_nonpurchased_titles_noncjk",
              label: "09. Non-CJK",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
          }}
        />
        <SubtotalDisplay
          label='10. Non-Purchased Titles Subtotal (06 + 07 + 08 + 09)'
          value={nonPurchasedTitlesSubtotal}
          formula='06 + 07 + 08 + 09'
        />
      </FormSection>

      {/* Subscription Titles */}
      <FormSection
        title='Titles from Electronic Resources'
        description="Use the 'Import from E-Book Database lists' feature after updating your subscription list."
      >
        <div className='mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800 mb-2'>
            <strong>Note:</strong> Title subscriptions do not count towards
            total titles. Please maintain &quot;E-Book Databases&quot; before
            using the import feature.
          </p>
          <Button
            type='button'
            onClick={importSubscriptionTitles}
            className='flex items-center gap-2'
            variant='default'
            disabled={!libraryYearStatus?.is_open_for_editing}
          >
            <Download className='h-4 w-4' />
            Import from &quot;E-Book Databases&quot;
          </Button>
        </div>
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: {
              name: "ebooks_subscription_titles_chinese",
              label: "11. Chinese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            japanese: {
              name: "ebooks_subscription_titles_japanese",
              label: "12. Japanese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            korean: {
              name: "ebooks_subscription_titles_korean",
              label: "13. Korean",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            eastasian: {
              name: "ebooks_subscription_titles_noncjk",
              label: "14. Non-CJK",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
          }}
        />
        <SubtotalDisplay
          label='15. Subscription Titles Subtotal (11 + 12 + 13 + 14)'
          value={subscriptionTitlesSubtotal}
          formula='11 + 12 + 13 + 14'
        />
      </FormSection>

      {/* Purchased Volumes */}
      <FormSection
        title='Purchased Volumes'
        description='Report the number of purchased electronic book volumes.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 p-2 text-left w-1/4'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Previous
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Add
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  16. Chinese
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_volumes_chinese'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_volumes_chinese'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalVolumesChinese}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  17. Japanese
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_volumes_japanese'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_volumes_japanese'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalVolumesJapanese}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  18. Korean
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_volumes_korean'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_volumes_korean'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalVolumesKorean}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  19. Non-CJK
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_prev_volumes_noncjk'
                    type='number'
                    disabled={true}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='ebooks_purchased_add_volumes_noncjk'
                    type='number'
                    disabled={!libraryYearStatus?.is_open_for_editing}
                    hideLabel
                  />
                </td>
                <td className='border border-gray-300 p-2 bg-gray-50'>
                  <div className='p-3 text-center font-semibold'>
                    {purchasedTotalVolumesNoncjk}
                  </div>
                </td>
              </tr>
              <tr className='bg-gray-100'>
                <td className='border border-gray-300 p-2 font-bold'>
                  20. Subtotal
                  <br />
                  <span className='text-xs font-normal'>
                    (16 + 17 + 18 + 19)
                  </span>
                </td>
                <td className='border border-gray-300 p-2 bg-gray-200'>
                  <div className='p-3 text-center font-bold'>
                    {purchasedPrevVolumesSubtotal}
                  </div>
                </td>
                <td className='border border-gray-300 p-2 bg-gray-200'>
                  <div className='p-3 text-center font-bold'>
                    {purchasedAddVolumesSubtotal}
                  </div>
                </td>
                <td className='border border-gray-300 p-2 bg-gray-200'>
                  <div className='p-3 text-center font-bold'>
                    {purchasedTotalVolumesSubtotal}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FormSection>

      {/* Non-Purchased Volumes */}
      <FormSection
        title='Non-Purchased Volumes'
        description='Report the number of non-purchased electronic book volumes.'
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: {
              name: "ebooks_nonpurchased_volumes_chinese",
              label: "21. Chinese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            japanese: {
              name: "ebooks_nonpurchased_volumes_japanese",
              label: "22. Japanese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            korean: {
              name: "ebooks_nonpurchased_volumes_korean",
              label: "23. Korean",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            eastasian: {
              name: "ebooks_nonpurchased_volumes_noncjk",
              label: "24. Non-CJK",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
          }}
        />
        <SubtotalDisplay
          label='25. Non-Purchased Volumes Subtotal (21 + 22 + 23 + 24)'
          value={nonPurchasedVolumesSubtotal}
          formula='21 + 22 + 23 + 24'
        />
      </FormSection>

      {/* Subscription Volumes */}
      <FormSection
        title='Volumes from Electronic Resources'
        description="Use the 'Import from E-Book Database lists' feature after updating your subscription list."
      >
        <div className='mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800 mb-2'>
            <strong>Note:</strong> Volume subscriptions do not count towards
            total volumes. Please maintain &quot;E-Book Databases&quot; before
            using the import feature.
          </p>
          <Button
            type='button'
            onClick={importSubscriptionVolumes}
            className='flex items-center gap-2'
            variant='default'
            disabled={!libraryYearStatus?.is_open_for_editing}
          >
            <Download className='h-4 w-4' />
            Import from E-Book Databases
          </Button>
        </div>
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: {
              name: "ebooks_subscription_volumes_chinese",
              label: "26. Chinese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            japanese: {
              name: "ebooks_subscription_volumes_japanese",
              label: "27. Japanese",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            korean: {
              name: "ebooks_subscription_volumes_korean",
              label: "28. Korean",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
            eastasian: {
              name: "ebooks_subscription_volumes_noncjk",
              label: "29. Non-CJK",
              disabled: !libraryYearStatus?.is_open_for_editing,
            },
          }}
        />
        <SubtotalDisplay
          label='30. Subscription Volumes Subtotal (26 + 27 + 28 + 29)'
          value={subscriptionVolumesSubtotal}
          formula='26 + 27 + 28 + 29'
        />
      </FormSection>

      {/* Totals */}
      <FormSection
        title='Totals'
        description='Auto-calculated totals for titles and volumes.'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SubtotalDisplay
            label='31. Title Total'
            value={totalTitles}
            formula='05 + 10'
          />
          <SubtotalDisplay
            label='32. Volume Total'
            value={totalVolumes}
            formula='20 + 25'
          />
        </div>
      </FormSection>

      {/* Expenditure */}
      <FormSection
        title='Expenditure'
        description='Field #41 (Grand Total Expenditures) in Electronic Form includes expenditures for Electronic Books. Please enter data there.'
      >
        <ReusableFormField
          control={form.control}
          name='ebooks_expenditure_grandtotal'
          label='33. Expenditure Total'
          placeholder=''
          type='number'
          disabled={!libraryYearStatus?.is_open_for_editing}
        />

        <ReusableFormField
          control={form.control}
          name='ebooks_notes'
          label='34. Memo/Footnote for this form'
          placeholder='Enter any notes, footnotes, or additional information...'
          type='textarea'
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      {/* Physical Volumes Total */}
      {/* <FormSection
        title="Physical Volumes Total"
        description=""
      >
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-medium text-blue-900">16. Grand Total (Physical Vols)</span>
            <span className="text-base font-semibold text-blue-900">{physicalVolumesTotal.toLocaleString()}</span>
          </div>
          <div className="text-sm text-blue-600 italic">
            (05 + 10 - 15)
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600 italic">
          From Physical Volume Holdings Form
        </div>
      </FormSection> */}

      {/* Grand Total Volume Holdings */}
      <FormSection title='Grand Total' description=''>
        {/* Physical Volumes Total */}
        <div className='mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200'>
          <div className='flex items-center justify-between rounded-lg'>
            <div>
              <div className='text-base font-semibold text-gray-900'>
                Physical Volumes Total
              </div>
              <div className='text-sm text-blue-600 italic'>
                (Imported from Physical Volume Holdings Form)
              </div>
            </div>
            <div className='bg-blue-100 px-4 py-2 rounded-md'>
              <span className='text-base font-semibold text-blue-900'>
                {physicalVolumesTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Grand Total Volume Holdings - Green */}
        <div className='p-4 bg-green-50 rounded-lg border-2 border-green-300'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-base font-semibold text-gray-900'>
                Grand Total Volume Holdings
              </div>
              <div className='mt-2 text-sm text-blue-600 italic'>
                (Physical ({physicalVolumesTotal.toLocaleString()}) + E-Books (
                {totalVolumes.toLocaleString()}))
              </div>
            </div>
            <div className='bg-green-200 px-4 py-2 rounded-md'>
              <span className='text-base font-semibold text-green-900'>
                {grandTotalVolumeHoldings.toLocaleString()}
              </span>
            </div>
          </div>
          <div className='text-sm text-gray-600 italic'>
            Automatically calculated; including E-Books
          </div>
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection title='Notes' description=''>
        <div className='bg-blue-50 border-l-4 border-blue-400 p-4'>
          <ol className='list-decimal list-inside space-y-3 text-sm text-gray-700'>
            <li>
              The{" "}
              <span className='font-semibold'>
                &quot;Calculate Totals&quot;
              </span>{" "}
              feature will overwrite any entered numbers in the Subtotal and
              Total fields! Do not click if you do not wish to have the
              subtotals automatically calculated.
            </li>
            <li>
              The E-Books Volume Total (item #32 on this Form) will be used
              together with item #16 on the Physical Volume Holdings Form to
              calculate the Grand Total Volume Holdings for your institution.
            </li>
            <li>
              Both the Physical Volumes Total and the Grand Total Volume
              Holdings are for information only, and do not belong to this form.
            </li>
          </ol>
        </div>
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText='Submit'
        onSaveDraft={handleSaveDraft}
      />
      <p className='text-muted-foreground text-xs text-right translate-y-[-20px]'>You can keep editing this form until {closingDateText}</p>
    </FormWrapper>
  );
}
