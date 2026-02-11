import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

import { ReusableFormField, ReusableCurrencyFormField } from "./ReusableFormField"
import { useFormStatusChecker } from "@/hooks/useFormStatusChecker"
import { getSurveyDates } from "@/lib/surveyDates"
import { formatSimpleDate } from "@/lib/dateFormatting"
import { PostCollectionWarning } from './PostCollectionWarning';
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher";
import {
  FormWrapper,
  FormSection,
  LanguageFieldGroup,
  SubtotalDisplay,
  FormSubmitSection
} from "./shared"

const formSchema = z.object({
  // One-time Computer Files
  eonetime_computer_title_chinese: z.number().min(0).default(0),
  eonetime_computer_title_japanese: z.number().min(0).default(0),
  eonetime_computer_title_korean: z.number().min(0).default(0),
  eonetime_computer_title_noncjk: z.number().min(0).default(0),
  eonetime_computer_cd_chinese: z.number().min(0).default(0),
  eonetime_computer_cd_japanese: z.number().min(0).default(0),
  eonetime_computer_cd_korean: z.number().min(0).default(0),
  eonetime_computer_cd_noncjk: z.number().min(0).default(0),

  // Accompanied Computer Files
  eaccompanied_computer_title_chinese: z.number().min(0).default(0),
  eaccompanied_computer_title_japanese: z.number().min(0).default(0),
  eaccompanied_computer_title_korean: z.number().min(0).default(0),
  eaccompanied_computer_title_noncjk: z.number().min(0).default(0),
  eaccompanied_computer_cd_chinese: z.number().min(0).default(0),
  eaccompanied_computer_cd_japanese: z.number().min(0).default(0),
  eaccompanied_computer_cd_korean: z.number().min(0).default(0),
  eaccompanied_computer_cd_noncjk: z.number().min(0).default(0),

  // Gift Computer Files
  egift_computer_title_chinese: z.number().min(0).default(0),
  egift_computer_title_japanese: z.number().min(0).default(0),
  egift_computer_title_korean: z.number().min(0).default(0),
  egift_computer_title_noncjk: z.number().min(0).default(0),
  egift_computer_cd_chinese: z.number().min(0).default(0),
  egift_computer_cd_japanese: z.number().min(0).default(0),
  egift_computer_cd_korean: z.number().min(0).default(0),
  egift_computer_cd_noncjk: z.number().min(0).default(0),

  // Electronic Indexes
  eindex_electronic_title_chinese: z.number().min(0).default(0),
  eindex_electronic_title_japanese: z.number().min(0).default(0),
  eindex_electronic_title_korean: z.number().min(0).default(0),
  eindex_electronic_title_noncjk: z.number().min(0).default(0),

  // Electronic Full Text
  efulltext_electronic_title_chinese: z.number().min(0).default(0),
  efulltext_electronic_title_japanese: z.number().min(0).default(0),
  efulltext_electronic_title_korean: z.number().min(0).default(0),
  efulltext_electronic_title_noncjk: z.number().min(0).default(0),

  // Expenditures - Simplified to single grand total field
  etotal_expenditure_grandtotal: z.number().min(0).default(0),

  // Section-specific notes (renamed from memo)
  eonetime_computer_memo: z.string().optional(),
  eaccompanied_computer_memo: z.string().optional(),
  egift_computer_memo: z.string().optional(),
  etotal_computer_memo: z.string().optional(),
  eindex_electronic_memo: z.string().optional(),
  efulltext_electronic_memo: z.string().optional(),
  etotal_electronic_memo: z.string().optional(),
  etotal_expenditure_memo: z.string().optional(),
  eprevious_memo: z.string().optional(),
  
  // Notes
  enotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function ElectronicForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      eonetime_computer_title_chinese: 0,
      eonetime_computer_title_japanese: 0,
      eonetime_computer_title_korean: 0,
      eonetime_computer_title_noncjk: 0,
      eonetime_computer_cd_chinese: 0,
      eonetime_computer_cd_japanese: 0,
      eonetime_computer_cd_korean: 0,
      eonetime_computer_cd_noncjk: 0,
      eaccompanied_computer_title_chinese: 0,
      eaccompanied_computer_title_japanese: 0,
      eaccompanied_computer_title_korean: 0,
      eaccompanied_computer_title_noncjk: 0,
      eaccompanied_computer_cd_chinese: 0,
      eaccompanied_computer_cd_japanese: 0,
      eaccompanied_computer_cd_korean: 0,
      eaccompanied_computer_cd_noncjk: 0,
      egift_computer_title_chinese: 0,
      egift_computer_title_japanese: 0,
      egift_computer_title_korean: 0,
      egift_computer_title_noncjk: 0,
      egift_computer_cd_chinese: 0,
      egift_computer_cd_japanese: 0,
      egift_computer_cd_korean: 0,
      egift_computer_cd_noncjk: 0,
      eindex_electronic_title_chinese: 0,
      eindex_electronic_title_japanese: 0,
      eindex_electronic_title_korean: 0,
      eindex_electronic_title_noncjk: 0,
      efulltext_electronic_title_chinese: 0,
      efulltext_electronic_title_japanese: 0,
      efulltext_electronic_title_korean: 0,
      efulltext_electronic_title_noncjk: 0,
      etotal_expenditure_grandtotal: 0,
      eonetime_computer_memo: "",
      eaccompanied_computer_memo: "",
      egift_computer_memo: "",
      etotal_computer_memo: "",
      eindex_electronic_memo: "",
      efulltext_electronic_memo: "",
      etotal_electronic_memo: "",
      etotal_expenditure_memo: "",
      eprevious_memo: "",
      enotes: "",
    },
  })

  const { libraryYearStatus, isLoading, existingData, previousYearData, isReadOnly, canEdit, formPermission, isPrivilegedPostClosing } = useFormStatusChecker('/api/electronic/status')

  // Pre-populate form with existing data and extract previous year data
  useEffect(() => {
    if (existingData) {
      Object.keys(existingData).forEach((key) => {
        if (key in form.getValues() && existingData[key] !== null && existingData[key] !== undefined) {
          // Parse numeric values to prevent string concatenation in calculations
          const isTextField = key.endsWith('_memo') || key === 'enotes'
          const value = isTextField 
            ? existingData[key] 
            : (typeof existingData[key] === 'number' ? existingData[key] : parseFloat(existingData[key]) || 0)
          form.setValue(key as keyof FormData, value)
        }
      })
    }
  }, [existingData, form])

  // previousYearData is now provided directly by useFormStatusChecker hook

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals
  const oneTimeComputerTitlesSubtotal = (watchedValues.eonetime_computer_title_chinese || 0) +
    (watchedValues.eonetime_computer_title_japanese || 0) +
    (watchedValues.eonetime_computer_title_korean || 0) +
    (watchedValues.eonetime_computer_title_noncjk || 0)

  const oneTimeComputerCdSubtotal = (watchedValues.eonetime_computer_cd_chinese || 0) +
    (watchedValues.eonetime_computer_cd_japanese || 0) +
    (watchedValues.eonetime_computer_cd_korean || 0) +
    (watchedValues.eonetime_computer_cd_noncjk || 0)

  const accompaniedComputerTitlesSubtotal = (watchedValues.eaccompanied_computer_title_chinese || 0) +
    (watchedValues.eaccompanied_computer_title_japanese || 0) +
    (watchedValues.eaccompanied_computer_title_korean || 0) +
    (watchedValues.eaccompanied_computer_title_noncjk || 0)

  const accompaniedComputerCdSubtotal = (watchedValues.eaccompanied_computer_cd_chinese || 0) +
    (watchedValues.eaccompanied_computer_cd_japanese || 0) +
    (watchedValues.eaccompanied_computer_cd_korean || 0) +
    (watchedValues.eaccompanied_computer_cd_noncjk || 0)

  const giftComputerTitlesSubtotal = (watchedValues.egift_computer_title_chinese || 0) +
    (watchedValues.egift_computer_title_japanese || 0) +
    (watchedValues.egift_computer_title_korean || 0) +
    (watchedValues.egift_computer_title_noncjk || 0)

  const giftComputerCdSubtotal = (watchedValues.egift_computer_cd_chinese || 0) +
    (watchedValues.egift_computer_cd_japanese || 0) +
    (watchedValues.egift_computer_cd_korean || 0) +
    (watchedValues.egift_computer_cd_noncjk || 0)

  const indexElectronicSubtotal = (watchedValues.eindex_electronic_title_chinese || 0) +
    (watchedValues.eindex_electronic_title_japanese || 0) +
    (watchedValues.eindex_electronic_title_korean || 0) +
    (watchedValues.eindex_electronic_title_noncjk || 0)

  const fulltextElectronicSubtotal = (watchedValues.efulltext_electronic_title_chinese || 0) +
    (watchedValues.efulltext_electronic_title_japanese || 0) +
    (watchedValues.efulltext_electronic_title_korean || 0) +
    (watchedValues.efulltext_electronic_title_noncjk || 0)

  // Calculate 1.4 Total Computer Files (sum of 1.1 + 1.2 + 1.3)
  const totalComputerTitlesChinese = (watchedValues.eonetime_computer_title_chinese || 0) +
    (watchedValues.eaccompanied_computer_title_chinese || 0) +
    (watchedValues.egift_computer_title_chinese || 0)
  const totalComputerTitlesJapanese = (watchedValues.eonetime_computer_title_japanese || 0) +
    (watchedValues.eaccompanied_computer_title_japanese || 0) +
    (watchedValues.egift_computer_title_japanese || 0)
  const totalComputerTitlesKorean = (watchedValues.eonetime_computer_title_korean || 0) +
    (watchedValues.eaccompanied_computer_title_korean || 0) +
    (watchedValues.egift_computer_title_korean || 0)
  const totalComputerTitlesNoncjk = (watchedValues.eonetime_computer_title_noncjk || 0) +
    (watchedValues.eaccompanied_computer_title_noncjk || 0) +
    (watchedValues.egift_computer_title_noncjk || 0)
  const totalComputerTitlesSubtotal = totalComputerTitlesChinese + totalComputerTitlesJapanese + 
    totalComputerTitlesKorean + totalComputerTitlesNoncjk

  const totalComputerCdChinese = (watchedValues.eonetime_computer_cd_chinese || 0) +
    (watchedValues.eaccompanied_computer_cd_chinese || 0) +
    (watchedValues.egift_computer_cd_chinese || 0)
  const totalComputerCdJapanese = (watchedValues.eonetime_computer_cd_japanese || 0) +
    (watchedValues.eaccompanied_computer_cd_japanese || 0) +
    (watchedValues.egift_computer_cd_japanese || 0)
  const totalComputerCdKorean = (watchedValues.eonetime_computer_cd_korean || 0) +
    (watchedValues.eaccompanied_computer_cd_korean || 0) +
    (watchedValues.egift_computer_cd_korean || 0)
  const totalComputerCdNoncjk = (watchedValues.eonetime_computer_cd_noncjk || 0) +
    (watchedValues.eaccompanied_computer_cd_noncjk || 0) +
    (watchedValues.egift_computer_cd_noncjk || 0)
  const totalComputerCdSubtotal = totalComputerCdChinese + totalComputerCdJapanese + 
    totalComputerCdKorean + totalComputerCdNoncjk

  // Calculate 2.3 Total Electronic (sum of 2.1 + 2.2)
  const totalElectronicChinese = (watchedValues.eindex_electronic_title_chinese || 0) +
    (watchedValues.efulltext_electronic_title_chinese || 0)
  const totalElectronicJapanese = (watchedValues.eindex_electronic_title_japanese || 0) +
    (watchedValues.efulltext_electronic_title_japanese || 0)
  const totalElectronicKorean = (watchedValues.eindex_electronic_title_korean || 0) +
    (watchedValues.efulltext_electronic_title_korean || 0)
  const totalElectronicNoncjk = (watchedValues.eindex_electronic_title_noncjk || 0) +
    (watchedValues.efulltext_electronic_title_noncjk || 0)
  const totalElectronicSubtotal = totalElectronicChinese + totalElectronicJapanese + 
    totalElectronicKorean + totalElectronicNoncjk

  // Previous year data values (section 1.5) - from eprevious_* fields
  const prevTitleChinese = previousYearData?.eprevious_total_title_chinese || 0
  const prevTitleJapanese = previousYearData?.eprevious_total_title_japanese || 0
  const prevTitleKorean = previousYearData?.eprevious_total_title_korean || 0
  const prevTitleNoncjk = previousYearData?.eprevious_total_title_noncjk || 0
  const prevTitleSubtotal = previousYearData?.eprevious_total_title_subtotal || 
    (prevTitleChinese + prevTitleJapanese + prevTitleKorean + prevTitleNoncjk)
  
  const prevCdChinese = previousYearData?.eprevious_total_cd_chinese || 0
  const prevCdJapanese = previousYearData?.eprevious_total_cd_japanese || 0
  const prevCdKorean = previousYearData?.eprevious_total_cd_korean || 0
  const prevCdNoncjk = previousYearData?.eprevious_total_cd_noncjk || 0
  const prevCdSubtotal = previousYearData?.eprevious_total_cd_subtotal || 
    (prevCdChinese + prevCdJapanese + prevCdKorean + prevCdNoncjk)

  // Calculate 1.6 Grand Total Computer Files (sum of 1.4 + 1.5)
  const grandTotalTitlesChinese = totalComputerTitlesChinese + prevTitleChinese
  const grandTotalTitlesJapanese = totalComputerTitlesJapanese + prevTitleJapanese
  const grandTotalTitlesKorean = totalComputerTitlesKorean + prevTitleKorean
  const grandTotalTitlesNoncjk = totalComputerTitlesNoncjk + prevTitleNoncjk
  const grandTotalTitlesSubtotal = totalComputerTitlesSubtotal + prevTitleSubtotal

  const grandTotalCdChinese = totalComputerCdChinese + prevCdChinese
  const grandTotalCdJapanese = totalComputerCdJapanese + prevCdJapanese
  const grandTotalCdKorean = totalComputerCdKorean + prevCdKorean
  const grandTotalCdNoncjk = totalComputerCdNoncjk + prevCdNoncjk
  const grandTotalCdSubtotal = totalComputerCdSubtotal + prevCdSubtotal

  // Import data from all databases function
  const importAllData = async () => {
    try {
      const libraryId = Number(params.libid);
      const yearToUse = libraryYearStatus?.year || new Date().getFullYear();

      const response = await fetch(`/api/electronic/import-all/${libraryId}/${yearToUse}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data;

        // Set electronic full text fields
        form.setValue('efulltext_electronic_title_chinese', data.chinese || 0, { shouldValidate: false });
        form.setValue('efulltext_electronic_title_japanese', data.japanese || 0, { shouldValidate: false });
        form.setValue('efulltext_electronic_title_korean', data.korean || 0, { shouldValidate: false });
        form.setValue('efulltext_electronic_title_noncjk', data.noncjk || 0, { shouldValidate: false });

        toast.success(`Imported ${result.breakdown.ebooks} e-books, ${result.breakdown.ejournals} e-journals, and ${result.breakdown.avs} audio-visual subscriptions successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to import subscription data');
      }
    } catch (error: any) {
      console.error('Import subscription data error:', error);
      toast.error('Failed to import subscription data');
    }
  };

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const submissionData = {
        ...values,
        // Add calculated subtotals for sections 1.1, 1.2, 1.3
        eonetime_computer_title_subtotal: oneTimeComputerTitlesSubtotal,
        eonetime_computer_cd_subtotal: oneTimeComputerCdSubtotal,
        eaccompanied_computer_title_subtotal: accompaniedComputerTitlesSubtotal,
        eaccompanied_computer_cd_subtotal: accompaniedComputerCdSubtotal,
        egift_computer_title_subtotal: giftComputerTitlesSubtotal,
        egift_computer_cd_subtotal: giftComputerCdSubtotal,
        
        // Add calculated totals for section 1.4 (Total Computer Files)
        etotal_computer_title_chinese: totalComputerTitlesChinese,
        etotal_computer_title_japanese: totalComputerTitlesJapanese,
        etotal_computer_title_korean: totalComputerTitlesKorean,
        etotal_computer_title_noncjk: totalComputerTitlesNoncjk,
        etotal_computer_title_subtotal: totalComputerTitlesSubtotal,
        etotal_computer_cd_chinese: totalComputerCdChinese,
        etotal_computer_cd_japanese: totalComputerCdJapanese,
        etotal_computer_cd_korean: totalComputerCdKorean,
        etotal_computer_cd_noncjk: totalComputerCdNoncjk,
        etotal_computer_cd_subtotal: totalComputerCdSubtotal,
        
        // Add calculated subtotals for sections 2.1, 2.2
        eindex_electronic_title_subtotal: indexElectronicSubtotal,
        efulltext_electronic_title_subtotal: fulltextElectronicSubtotal,
        
        // Add calculated totals for section 2.3 (Total Electronic)
        etotal_electronic_title_chinese: totalElectronicChinese,
        etotal_electronic_title_japanese: totalElectronicJapanese,
        etotal_electronic_title_korean: totalElectronicKorean,
        etotal_electronic_title_noncjk: totalElectronicNoncjk,
        etotal_electronic_title_subtotal: totalElectronicSubtotal,
        
        libid: Number(params.libid),
        finalSubmit: true,
      }

      const response = await fetch('/api/electronic/create', {
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
      setSuccessMessage('Electronic resources form submitted successfully!')
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
        eonetime_computer_title_subtotal: oneTimeComputerTitlesSubtotal,
        eonetime_computer_cd_subtotal: oneTimeComputerCdSubtotal,
        eaccompanied_computer_title_subtotal: accompaniedComputerTitlesSubtotal,
        eaccompanied_computer_cd_subtotal: accompaniedComputerCdSubtotal,
        egift_computer_title_subtotal: giftComputerTitlesSubtotal,
        egift_computer_cd_subtotal: giftComputerCdSubtotal,
        etotal_computer_title_chinese: totalComputerTitlesChinese,
        etotal_computer_title_japanese: totalComputerTitlesJapanese,
        etotal_computer_title_korean: totalComputerTitlesKorean,
        etotal_computer_title_noncjk: totalComputerTitlesNoncjk,
        etotal_computer_title_subtotal: totalComputerTitlesSubtotal,
        etotal_computer_cd_chinese: totalComputerCdChinese,
        etotal_computer_cd_japanese: totalComputerCdJapanese,
        etotal_computer_cd_korean: totalComputerCdKorean,
        etotal_computer_cd_noncjk: totalComputerCdNoncjk,
        etotal_computer_cd_subtotal: totalComputerCdSubtotal,
        eindex_electronic_title_subtotal: indexElectronicSubtotal,
        efulltext_electronic_title_subtotal: fulltextElectronicSubtotal,
        etotal_electronic_title_chinese: totalElectronicChinese,
        etotal_electronic_title_japanese: totalElectronicJapanese,
        etotal_electronic_title_korean: totalElectronicKorean,
        etotal_electronic_title_noncjk: totalElectronicNoncjk,
        etotal_electronic_title_subtotal: totalElectronicSubtotal,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/electronic/create', {
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
      {/* One-time Computer Files */}
      <FormSection
        title='1.1 Computer Files (One-Time/Monographic)'
        description='Include the number of non-subscription, one-time files such as backfiles or literature collections.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 p-2 text-left w-1/3'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of Titles
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of CD-ROMs
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
                    name='eonetime_computer_title_chinese'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_cd_chinese'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  02. Japanese
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_title_japanese'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_cd_japanese'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  03. Korean
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_title_korean'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_cd_korean'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  04. Non-CJK
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_title_noncjk'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
                <td className='border border-gray-300 p-2'>
                  <ReusableFormField
                    control={form.control}
                    name='eonetime_computer_cd_noncjk'
                    label=''
                    type='number'
                    disabled={isReadOnly}
                  />
                </td>
              </tr>
              <tr className='bg-gray-50'>
                <td className='border border-gray-300 p-2 font-bold'>
                  05. Subtotal
                  <br />
                  <span className='text-xs font-normal text-gray-600'>
                    (01 + 02 + 03 + 04)
                  </span>
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-gray-100'>
                  {oneTimeComputerTitlesSubtotal}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-gray-100'>
                  {oneTimeComputerCdSubtotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='mt-4'>
          <ReusableFormField
            control={form.control}
            name='eonetime_computer_memo'
            label='Comment for 1.1'
            placeholder='Optional notes for this section...'
            type='textarea'
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Accompanied Computer Files */}
      <FormSection
        title='1.2 Accompanied Computer Files (Monographic Purchase or Serial Subscription)'
        description='Include the number of CDs bundled with books or journals.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 p-2 text-left w-1/3'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of Titles
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of CD-ROMs
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  num: "06",
                  lang: "Chinese",
                  title: "eaccompanied_computer_title_chinese",
                  cd: "eaccompanied_computer_cd_chinese",
                },
                {
                  num: "07",
                  lang: "Japanese",
                  title: "eaccompanied_computer_title_japanese",
                  cd: "eaccompanied_computer_cd_japanese",
                },
                {
                  num: "08",
                  lang: "Korean",
                  title: "eaccompanied_computer_title_korean",
                  cd: "eaccompanied_computer_cd_korean",
                },
                {
                  num: "09",
                  lang: "Non-CJK",
                  title: "eaccompanied_computer_title_noncjk",
                  cd: "eaccompanied_computer_cd_noncjk",
                },
              ].map((row) => (
                <tr key={row.num}>
                  <td className='border border-gray-300 p-2 font-medium'>
                    {row.num}. {row.lang}
                  </td>
                  <td className='border border-gray-300 p-2'>
                    <ReusableFormField
                      control={form.control}
                      name={row.title as any}
                      label=''
                      type='number'
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className='border border-gray-300 p-2'>
                    <ReusableFormField
                      control={form.control}
                      name={row.cd as any}
                      label=''
                      type='number'
                      disabled={isReadOnly}
                    />
                  </td>
                </tr>
              ))}
              <tr className='bg-gray-50'>
                <td className='border border-gray-300 p-2 font-bold'>
                  10. Subtotal
                  <br />
                  <span className='text-xs font-normal text-gray-600'>
                    (06 + 07 + 08 + 09)
                  </span>
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-gray-100'>
                  {accompaniedComputerTitlesSubtotal}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-gray-100'>
                  {accompaniedComputerCdSubtotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='mt-4'>
          <ReusableFormField
            control={form.control}
            name='eaccompanied_computer_memo'
            label='Comment for 1.2'
            placeholder='Optional notes for this section...'
            type='textarea'
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Gift Computer Files */}
      <FormSection
        title='1.3 Computer Files (One Time Gift Item)'
        description='Include the number of one-time gift items not covered in 1.1 or 1.2.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-300 p-2 text-left w-1/3'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of Titles
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of CD-ROMs
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  num: "11",
                  lang: "Chinese",
                  title: "egift_computer_title_chinese",
                  cd: "egift_computer_cd_chinese",
                },
                {
                  num: "12",
                  lang: "Japanese",
                  title: "egift_computer_title_japanese",
                  cd: "egift_computer_cd_japanese",
                },
                {
                  num: "13",
                  lang: "Korean",
                  title: "egift_computer_title_korean",
                  cd: "egift_computer_cd_korean",
                },
                {
                  num: "14",
                  lang: "Non-CJK",
                  title: "egift_computer_title_noncjk",
                  cd: "egift_computer_cd_noncjk",
                },
              ].map((row) => (
                <tr key={row.num}>
                  <td className='border border-gray-300 p-2 font-medium'>
                    {row.num}. {row.lang}
                  </td>
                  <td className='border border-gray-300 p-2'>
                    <ReusableFormField
                      control={form.control}
                      name={row.title as any}
                      label=''
                      type='number'
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className='border border-gray-300 p-2'>
                    <ReusableFormField
                      control={form.control}
                      name={row.cd as any}
                      label=''
                      type='number'
                      disabled={isReadOnly}
                    />
                  </td>
                </tr>
              ))}
              <tr className='bg-gray-50'>
                <td className='border border-gray-300 p-2 font-bold'>
                  15. Subtotal
                  <br />
                  <span className='text-xs font-normal text-gray-600'>
                    (11 + 12 + 13 + 14)
                  </span>
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-gray-100'>
                  {giftComputerTitlesSubtotal}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-gray-100'>
                  {giftComputerCdSubtotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='mt-4'>
          <ReusableFormField
            control={form.control}
            name='egift_computer_memo'
            label='Comment for 1.3'
            placeholder='Optional notes for this section...'
            type='textarea'
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Section 1.4: Total Computer Files */}
      <FormSection
        title='1.4 Total Computer Files (sum of 1.1 + 1.2 + 1.3)'
        description='Calculated totals for all computer files.'
      >
        <div className='space-y-4 bg-gray-50 p-4 rounded-lg'>
          <h4 className='font-medium'>Titles (Calculated)</h4>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Chinese</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerTitlesChinese}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Japanese</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerTitlesJapanese}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Korean</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerTitlesKorean}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Non-CJK</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerTitlesNoncjk}
              </div>
            </div>
          </div>
          <SubtotalDisplay
            label='Titles Subtotal'
            value={totalComputerTitlesSubtotal}
            formula='Sum of all language titles'
          />

          <h4 className='font-medium'>Items (Calculated)</h4>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Chinese</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerCdChinese}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Japanese</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerCdJapanese}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Korean</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerCdKorean}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Non-CJK</label>
              <div className='p-2 bg-white border rounded'>
                {totalComputerCdNoncjk}
              </div>
            </div>
          </div>
          <SubtotalDisplay
            label='Items Subtotal'
            value={totalComputerCdSubtotal}
            formula='Sum of all language items'
          />
        </div>
        <ReusableFormField
          control={form.control}
          name='etotal_computer_memo'
          label='Comment for 1.4'
          placeholder='Optional notes for total computer files...'
          type='textarea'
          disabled={isReadOnly}
        />
      </FormSection>

      {/* Section 1.5: Previous Year Total Computer Files */}
      <FormSection
        title='1.5 Previous Year Total Computer Files'
        description='Data from the end of the previous survey year. This section is informational only.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-amber-100'>
                <th className='border border-gray-300 p-2 text-left w-1/3'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of Titles
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of CD-ROMs
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  16. Chinese
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevTitleChinese : "--"}
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevCdChinese : "--"}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  17. Japanese
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevTitleJapanese : "--"}
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevCdJapanese : "--"}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  18. Korean
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevTitleKorean : "--"}
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevCdKorean : "--"}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  19. Non-CJK
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevTitleNoncjk : "--"}
                </td>
                <td className='border border-gray-300 p-2 text-center text-gray-700'>
                  {previousYearData ? prevCdNoncjk : "--"}
                </td>
              </tr>
              <tr className='bg-amber-50'>
                <td className='border border-gray-300 p-2 font-bold'>
                  19.1 Subtotal
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-amber-100'>
                  {previousYearData ? prevTitleSubtotal : "--"}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold bg-amber-100'>
                  {previousYearData ? prevCdSubtotal : "--"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4'>
          <p className='text-sm text-amber-800'>
            <strong>Note:</strong> Previous year data will be automatically
            populated from last year's submission.
          </p>
        </div>
        <div className='mt-4'>
          <ReusableFormField
            control={form.control}
            name='eprevious_memo'
            label='Comment for 1.5'
            placeholder='Optional notes about previous year data...'
            type='textarea'
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Section 1.6: Grand Total Computer Files */}
      <FormSection
        title='1.6 Grand Total Computer Files (Sum 1.4 + 1.5)'
        description='Grand total combining current year and previous year computer files.'
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-blue-100'>
                <th className='border border-gray-300 p-2 text-left w-1/3'></th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of Titles
                </th>
                <th className='border border-gray-300 p-2 text-center font-normal text-sm'>
                  Number of CD-ROMs
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  20. Chinese
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalTitlesChinese}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalCdChinese}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  21. Japanese
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalTitlesJapanese}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalCdJapanese}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  22. Korean
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalTitlesKorean}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalCdKorean}
                </td>
              </tr>
              <tr>
                <td className='border border-gray-300 p-2 font-medium'>
                  23. Non-CJK
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalTitlesNoncjk}
                </td>
                <td className='border border-gray-300 p-2 text-center font-semibold'>
                  {grandTotalCdNoncjk}
                </td>
              </tr>
              <tr className='bg-blue-50'>
                <td className='border border-gray-300 p-2 font-bold'>
                  23.1 Subtotal
                </td>
                <td className='border border-gray-300 p-2 text-center font-bold text-lg bg-blue-100'>
                  {grandTotalTitlesSubtotal}
                </td>
                <td className='border border-gray-300 p-2 text-center font-bold text-lg bg-blue-100'>
                  {grandTotalCdSubtotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-sm text-blue-800'>
            <strong>Note:</strong> Electronic databases counted in 2.2 should
            NOT be reported here again. Report the total count by language of
            computer files held as of June 30 of the current survey year.
          </p>
        </div>
        <div className='mt-4'>
          <ReusableFormField
            control={form.control}
            name='etotal_computer_memo'
            label='Comment for 1.6'
            placeholder='Optional notes for grand total computer files...'
            type='textarea'
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Electronic Indexes */}
      <FormSection
        title='2.1 Electronic Indexes and Reference Tools'
        description='Examples: Bibliography of Asian Studies, MagazinePlus, EncyKorea.'
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: {
              name: "eindex_electronic_title_chinese",
              label: "31. Chinese",
            },
            japanese: {
              name: "eindex_electronic_title_japanese",
              label: "32. Japanese",
            },
            korean: {
              name: "eindex_electronic_title_korean",
              label: "33. Korean",
            },
            eastasian: {
              name: "eindex_electronic_title_noncjk",
              label: "34. Non-CJK",
            },
          }}
          disabled={isReadOnly}
        />
        <SubtotalDisplay
          label='35. Subtotal'
          value={indexElectronicSubtotal}
          formula='31 + 32 + 33 + 34'
        />
        <ReusableFormField
          control={form.control}
          name='eindex_electronic_memo'
          label='Comment for 2.1'
          placeholder='Optional notes for this section...'
          type='textarea'
          disabled={isReadOnly}
        />
      </FormSection>

      {/* Electronic Full Text */}
      <FormSection
        title='2.2 Electronic Full Text Database'
        description="Before using the 'Import' feature, update your AV/E-book/E-journal Database lists."
      >
        <div className='mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800 mb-2'>
            <strong>BEFORE using the import feature</strong>, please fill out or
            update the &quot;Audio/Visual Databases&quot;, &quot;E-Book
            Databases&quot;, and &quot;E-Journal Databases&quot; in order for
            the system to provide the corresponding numbers automatically.
          </p>
          <Button
            type='button'
            onClick={importAllData}
            className='flex items-center gap-2'
            variant='default'
            disabled={isReadOnly && !isPrivilegedPostClosing}
          >
            <Download className='h-4 w-4' />
            Import from "Audio/Visual Databases", "E-Book Databases" and
            "E-Journal Databases"
          </Button>
        </div>

        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: {
              name: "efulltext_electronic_title_chinese",
              label: "36. Chinese",
            },
            japanese: {
              name: "efulltext_electronic_title_japanese",
              label: "37. Japanese",
            },
            korean: {
              name: "efulltext_electronic_title_korean",
              label: "38. Korean",
            },
            eastasian: {
              name: "efulltext_electronic_title_noncjk",
              label: "39. Non-CJK",
            },
          }}
          disabled={isReadOnly}
        />
        <SubtotalDisplay
          label='40. Subtotal'
          value={fulltextElectronicSubtotal}
          formula='36 + 37 + 38 + 39'
        />
        <ReusableFormField
          control={form.control}
          name='efulltext_electronic_memo'
          label='Comment for 2.2'
          placeholder='Optional notes for this section...'
          type='textarea'
          disabled={isReadOnly}
        />
      </FormSection>

      {/* Section 2.3: Total Electronic */}
      <FormSection
        title='2.3 Total Electronic (sum of 2.1 + 2.2)'
        description='Calculated totals for all electronic resources.'
      >
        <div className='space-y-4 bg-gray-50 p-4 rounded-lg'>
          <h4 className='font-medium'>Titles (Calculated)</h4>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Chinese</label>
              <div className='p-2 bg-white border rounded'>
                {totalElectronicChinese}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Japanese</label>
              <div className='p-2 bg-white border rounded'>
                {totalElectronicJapanese}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Korean</label>
              <div className='p-2 bg-white border rounded'>
                {totalElectronicKorean}
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Non-CJK</label>
              <div className='p-2 bg-white border rounded'>
                {totalElectronicNoncjk}
              </div>
            </div>
          </div>
          <SubtotalDisplay
            label='Subtotal'
            value={totalElectronicSubtotal}
            formula='Sum of 2.1 + 2.2'
          />
        </div>
        <ReusableFormField
          control={form.control}
          name='etotal_electronic_memo'
          label='Comment for 2.3'
          placeholder='Optional notes for total electronic resources...'
          type='textarea'
          disabled={isReadOnly}
        />
      </FormSection>

      {/* Expenditures */}
      <FormSection
        title='3. Total Electronic Resources Expenditure'
        description='Item #41 includes expenditures for the above resources and also expenditures for Electronic Books.'
      >
        <div className='space-y-4'>
          <ReusableCurrencyFormField
            control={form.control}
            name='etotal_expenditure_grandtotal'
            label='41. Grand Total Expenditure'
            placeholder='0.00'
            disabled={isReadOnly}
          />
          <ReusableFormField
            control={form.control}
            name='etotal_expenditure_memo'
            label='Comment for 3'
            placeholder='Optional notes for expenditures...'
            type='textarea'
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection
        title='Notes'
        description='Additional information or comments about electronic resources.'
      >
        <ReusableFormField
          control={form.control}
          name='enotes'
          label='Notes/Memo for this form'
          placeholder='Enter any notes, footnotes, or additional information...'
          type='textarea'
          disabled={isReadOnly}
        />
      </FormSection>
      <FormSubmitSection
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText='Submit'
        onSaveDraft={handleSaveDraft}
        isReadOnly={isReadOnly}
      />
      {isPrivilegedPostClosing ? (
        <PostCollectionWarning className="mt-4" />
      ) : (
        <p className='text-muted-foreground text-xs text-right translate-y-[-20px]'>You can keep editing this form until {closingDateText}</p>
      )}
    </FormWrapper>
    </>
  )
}
