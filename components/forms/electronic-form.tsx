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

  // Expenditures
  eonetime_computer_expenditure_chinese: z.number().min(0).default(0),
  eonetime_computer_expenditure_japanese: z.number().min(0).default(0),
  eonetime_computer_expenditure_korean: z.number().min(0).default(0),
  eonetime_computer_expenditure_noncjk: z.number().min(0).default(0),
  eindex_electronic_expenditure_chinese: z.number().min(0).default(0),
  eindex_electronic_expenditure_japanese: z.number().min(0).default(0),
  eindex_electronic_expenditure_korean: z.number().min(0).default(0),
  eindex_electronic_expenditure_noncjk: z.number().min(0).default(0),
  efulltext_electronic_expenditure_chinese: z.number().min(0).default(0),
  efulltext_electronic_expenditure_japanese: z.number().min(0).default(0),
  efulltext_electronic_expenditure_korean: z.number().min(0).default(0),
  efulltext_electronic_expenditure_noncjk: z.number().min(0).default(0),

  // Notes
  enotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function ElectronicForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      eonetime_computer_expenditure_chinese: 0,
      eonetime_computer_expenditure_japanese: 0,
      eonetime_computer_expenditure_korean: 0,
      eonetime_computer_expenditure_noncjk: 0,
      eindex_electronic_expenditure_chinese: 0,
      eindex_electronic_expenditure_japanese: 0,
      eindex_electronic_expenditure_korean: 0,
      eindex_electronic_expenditure_noncjk: 0,
      efulltext_electronic_expenditure_chinese: 0,
      efulltext_electronic_expenditure_japanese: 0,
      efulltext_electronic_expenditure_korean: 0,
      efulltext_electronic_expenditure_noncjk: 0,
      enotes: "",
    },
  })

  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/electronic/status')

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch(`/api/electronic/status/${params.libid}`)
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

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const submissionData = {
        ...values,
        // Add calculated subtotals
        eonetime_computer_title_subtotal: oneTimeComputerTitlesSubtotal,
        eonetime_computer_cd_subtotal: oneTimeComputerCdSubtotal,
        eaccompanied_computer_title_subtotal: accompaniedComputerTitlesSubtotal,
        eaccompanied_computer_cd_subtotal: accompaniedComputerCdSubtotal,
        egift_computer_title_subtotal: giftComputerTitlesSubtotal,
        egift_computer_cd_subtotal: giftComputerCdSubtotal,
        eindex_electronic_title_subtotal: indexElectronicSubtotal,
        efulltext_electronic_title_subtotal: fulltextElectronicSubtotal,
        libid: Number(params.libid),
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

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
    >
      {/* One-time Computer Files */}
      <FormSection
        title="1.1 Computer Files (One-time/Monographic)"
        description="Include the number of non-subscription, one-time files such as backfiles or literature collections."
      >
        <div className="space-y-4">
          <h4 className="font-medium">Titles</h4>
          <LanguageFieldGroup
            control={form.control}
            fields={{
              chinese: { name: "eonetime_computer_title_chinese", label: "01. Chinese Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              japanese: { name: "eonetime_computer_title_japanese", label: "02. Japanese Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              korean: { name: "eonetime_computer_title_korean", label: "03. Korean Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              eastasian: { name: "eonetime_computer_title_noncjk", label: "04. Non-CJK Titles", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
          />
          <SubtotalDisplay
            label="05. Titles Subtotal"
            value={oneTimeComputerTitlesSubtotal}
            formula="01 + 02 + 03 + 04"
          />

          <h4 className="font-medium">Items</h4>
          <LanguageFieldGroup
            control={form.control}
            fields={{
              chinese: { name: "eonetime_computer_cd_chinese", label: "06. Chinese Items", disabled: !libraryYearStatus?.is_open_for_editing },
              japanese: { name: "eonetime_computer_cd_japanese", label: "07. Japanese Items", disabled: !libraryYearStatus?.is_open_for_editing },
              korean: { name: "eonetime_computer_cd_korean", label: "08. Korean Items", disabled: !libraryYearStatus?.is_open_for_editing },
              eastasian: { name: "eonetime_computer_cd_noncjk", label: "09. Non-CJK Items", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
          />
          <SubtotalDisplay
            label="10. Items Subtotal"
            value={oneTimeComputerCdSubtotal}
            formula="06 + 07 + 08 + 09"
          />
        </div>
      </FormSection>

      {/* Accompanied Computer Files */}
      <FormSection
        title="1.2 Accompanied Computer Files"
        description="Include the number of CDs bundled with books or journals."
      >
        <div className="space-y-4">
          <h4 className="font-medium">Titles</h4>
          <LanguageFieldGroup
            control={form.control}
            fields={{
              chinese: { name: "eaccompanied_computer_title_chinese", label: "11. Chinese Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              japanese: { name: "eaccompanied_computer_title_japanese", label: "12. Japanese Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              korean: { name: "eaccompanied_computer_title_korean", label: "13. Korean Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              eastasian: { name: "eaccompanied_computer_title_noncjk", label: "14. Non-CJK Titles", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
          />
          <SubtotalDisplay
            label="15. Titles Subtotal"
            value={accompaniedComputerTitlesSubtotal}
            formula="11 + 12 + 13 + 14"
          />

          <h4 className="font-medium">Items</h4>
          <LanguageFieldGroup
            control={form.control}
            fields={{
              chinese: { name: "eaccompanied_computer_cd_chinese", label: "16. Chinese Items", disabled: !libraryYearStatus?.is_open_for_editing },
              japanese: { name: "eaccompanied_computer_cd_japanese", label: "17. Japanese Items", disabled: !libraryYearStatus?.is_open_for_editing },
              korean: { name: "eaccompanied_computer_cd_korean", label: "18. Korean Items", disabled: !libraryYearStatus?.is_open_for_editing },
              eastasian: { name: "eaccompanied_computer_cd_noncjk", label: "19. Non-CJK Items", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
          />
          <SubtotalDisplay
            label="20. Items Subtotal"
            value={accompaniedComputerCdSubtotal}
            formula="16 + 17 + 18 + 19"
          />
        </div>
      </FormSection>

      {/* Gift Computer Files */}
      <FormSection
        title="1.3 Computer Files (One Time Gift Item)"
        description="Include the number of one-time gift items not covered in 1.1 or 1.2."
      >
        <div className="space-y-4">
          <h4 className="font-medium">Titles</h4>
          <LanguageFieldGroup
            control={form.control}
            fields={{
              chinese: { name: "egift_computer_title_chinese", label: "21. Chinese Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              japanese: { name: "egift_computer_title_japanese", label: "22. Japanese Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              korean: { name: "egift_computer_title_korean", label: "23. Korean Titles", disabled: !libraryYearStatus?.is_open_for_editing },
              eastasian: { name: "egift_computer_title_noncjk", label: "24. Non-CJK Titles", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
          />
          <SubtotalDisplay
            label="25. Titles Subtotal"
            value={giftComputerTitlesSubtotal}
            formula="21 + 22 + 23 + 24"
          />

          <h4 className="font-medium">Items</h4>
          <LanguageFieldGroup
            control={form.control}
            fields={{
              chinese: { name: "egift_computer_cd_chinese", label: "26. Chinese Items", disabled: !libraryYearStatus?.is_open_for_editing },
              japanese: { name: "egift_computer_cd_japanese", label: "27. Japanese Items", disabled: !libraryYearStatus?.is_open_for_editing },
              korean: { name: "egift_computer_cd_korean", label: "28. Korean Items", disabled: !libraryYearStatus?.is_open_for_editing },
              eastasian: { name: "egift_computer_cd_noncjk", label: "29. Non-CJK Items", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
          />
          <SubtotalDisplay
            label="30. Items Subtotal"
            value={giftComputerCdSubtotal}
            formula="26 + 27 + 28 + 29"
          />
        </div>
      </FormSection>

      {/* Electronic Indexes */}
      <FormSection
        title="2.1 Electronic Indexes and Reference Tools"
        description="Examples: Bibliography of Asian Studies, MagazinePlus, EncyKorea."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "eindex_electronic_title_chinese", label: "31. Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "eindex_electronic_title_japanese", label: "32. Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "eindex_electronic_title_korean", label: "33. Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "eindex_electronic_title_noncjk", label: "34. Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="35. Subtotal"
          value={indexElectronicSubtotal}
          formula="31 + 32 + 33 + 34"
        />
      </FormSection>

      {/* Electronic Full Text */}
      <FormSection
        title="2.2 Electronic Full Text Database and Periodicals"
        description="Before using the 'Import' feature, update your AV/E-book/E-journal lists."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "efulltext_electronic_title_chinese", label: "36. Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "efulltext_electronic_title_japanese", label: "37. Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "efulltext_electronic_title_korean", label: "38. Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "efulltext_electronic_title_noncjk", label: "39. Non-CJK", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
        />
        <SubtotalDisplay
          label="40. Subtotal"
          value={fulltextElectronicSubtotal}
          formula="36 + 37 + 38 + 39"
        />
      </FormSection>

      {/* Expenditures */}
      <FormSection
        title="3. Total Electronic Resources Expenditure"
        description="Record total expenditures for computer files and electronic subscriptions in U.S. dollars."
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">One-time Computer Files Expenditure</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "eonetime_computer_expenditure_chinese", label: "41. Chinese ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                japanese: { name: "eonetime_computer_expenditure_japanese", label: "42. Japanese ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                korean: { name: "eonetime_computer_expenditure_korean", label: "43. Korean ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                eastasian: { name: "eonetime_computer_expenditure_noncjk", label: "44. Non-CJK ($)", disabled: !libraryYearStatus?.is_open_for_editing }
              }}
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Electronic Indexes Expenditure</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "eindex_electronic_expenditure_chinese", label: "45. Chinese ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                japanese: { name: "eindex_electronic_expenditure_japanese", label: "46. Japanese ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                korean: { name: "eindex_electronic_expenditure_korean", label: "47. Korean ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                eastasian: { name: "eindex_electronic_expenditure_noncjk", label: "48. Non-CJK ($)", disabled: !libraryYearStatus?.is_open_for_editing }
              }}
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Electronic Full Text Expenditure</h4>
            <LanguageFieldGroup
              control={form.control}
              fields={{
                chinese: { name: "efulltext_electronic_expenditure_chinese", label: "49. Chinese ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                japanese: { name: "efulltext_electronic_expenditure_japanese", label: "50. Japanese ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                korean: { name: "efulltext_electronic_expenditure_korean", label: "51. Korean ($)", disabled: !libraryYearStatus?.is_open_for_editing },
                eastasian: { name: "efulltext_electronic_expenditure_noncjk", label: "52. Non-CJK ($)", disabled: !libraryYearStatus?.is_open_for_editing }
              }}
            />
          </div>
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information or comments about electronic resources."
      >
        <ReusableFormField
          control={form.control}
          name="enotes"
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
        submitButtonText="Submit Electronic Resources Data"
      />
    </FormWrapper>
  )
}
