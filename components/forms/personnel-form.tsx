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
  // Professional Staff
  psfprofessional_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  psfprofessional_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  psfprofessional_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  psfprofessional_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Support Staff
  psfsupport_staff_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  psfsupport_staff_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  psfsupport_staff_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  psfsupport_staff_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Student Assistants
  psfstudent_assistants_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  psfstudent_assistants_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  psfstudent_assistants_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  psfstudent_assistants_eastasian: z.number().min(0, { message: "Must be a non-negative number" }),

  // Others FTE
  psfothers: z.number().min(0, { message: "Must be a non-negative number" }),

  // Outsourcing
  psfosacquisition: z.boolean(),
  psfosprocessing: z.boolean(),

  // Notes
  psfnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function PersonnelForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      psfprofessional_chinese: 0,
      psfprofessional_japanese: 0,
      psfprofessional_korean: 0,
      psfprofessional_eastasian: 0,
      psfsupport_staff_chinese: 0,
      psfsupport_staff_japanese: 0,
      psfsupport_staff_korean: 0,
      psfsupport_staff_eastasian: 0,
      psfstudent_assistants_chinese: 0,
      psfstudent_assistants_japanese: 0,
      psfstudent_assistants_korean: 0,
      psfstudent_assistants_eastasian: 0,
      psfothers: 0,
      psfosacquisition: false,
      psfosprocessing: false,
      psfnotes: "",
    },
  })

  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/personnel/status')

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch(`/api/personnel/status/${params.libid}`)
        if (response.ok) {
          const data = await response.json()
          if (data.existingData) {
            Object.keys(data.existingData).forEach(key => {
              if (key !== 'entryid' && key !== 'libid' && key !== 'year') {
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
  const professionalSubtotal = (watchedValues.psfprofessional_chinese || 0) + 
                              (watchedValues.psfprofessional_japanese || 0) + 
                              (watchedValues.psfprofessional_korean || 0) + 
                              (watchedValues.psfprofessional_eastasian || 0)

  const supportStaffSubtotal = (watchedValues.psfsupport_staff_chinese || 0) + 
                              (watchedValues.psfsupport_staff_japanese || 0) + 
                              (watchedValues.psfsupport_staff_korean || 0) + 
                              (watchedValues.psfsupport_staff_eastasian || 0)

  const studentAssistantsSubtotal = (watchedValues.psfstudent_assistants_chinese || 0) + 
                                   (watchedValues.psfstudent_assistants_japanese || 0) + 
                                   (watchedValues.psfstudent_assistants_korean || 0) + 
                                   (watchedValues.psfstudent_assistants_eastasian || 0)

  const totalPersonnel = professionalSubtotal + supportStaffSubtotal + studentAssistantsSubtotal + (watchedValues.psfothers || 0)

  async function onSubmit(values: FormData) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const submissionData = {
        ...values,
        psfprofessional_subtotal: professionalSubtotal,
        psfsupport_staff_subtotal: supportStaffSubtotal,
        psfstudent_assistants_subtotal: studentAssistantsSubtotal,
        psftotal: totalPersonnel,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/personnel/create', {
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
      setSuccessMessage('Personnel support form submitted successfully!')
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
      {/* Professional Staff */}
      <FormSection
        title="Professional Staff"
        description="Enter the number of professional staff FTE by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "psfprofessional_chinese", label: "01. Professional Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "psfprofessional_japanese", label: "02. Professional Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "psfprofessional_korean", label: "03. Professional Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "psfprofessional_eastasian", label: "04. Professional East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="05. Professional Total"
          value={professionalSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Support Staff */}
      <FormSection
        title="Support Staff"
        description="Enter the number of support staff FTE by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "psfsupport_staff_chinese", label: "06. Support Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "psfsupport_staff_japanese", label: "07. Support Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "psfsupport_staff_korean", label: "08. Support Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "psfsupport_staff_eastasian", label: "09. Support East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="10. Support Total"
          value={supportStaffSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* Student Assistants */}
      <FormSection
        title="Student Assistants"
        description="Enter the number of student assistant FTE by language."
      >
        <LanguageFieldGroup
          control={form.control}
          fields={{
            chinese: { name: "psfstudent_assistants_chinese", label: "11. Student Chinese", disabled: !libraryYearStatus?.is_open_for_editing },
            japanese: { name: "psfstudent_assistants_japanese", label: "12. Student Japanese", disabled: !libraryYearStatus?.is_open_for_editing },
            korean: { name: "psfstudent_assistants_korean", label: "13. Student Korean", disabled: !libraryYearStatus?.is_open_for_editing },
            eastasian: { name: "psfstudent_assistants_eastasian", label: "14. Student East Asian", disabled: !libraryYearStatus?.is_open_for_editing }
          }}
          useFloatNumbers={true}
        />
        <SubtotalDisplay
          label="15. Student Total"
          value={studentAssistantsSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* Others FTE */}
      <FormSection
        title="Others, FTE"
        description="Enter the number of other staff FTE."
      >
        <div className="grid grid-cols-1 gap-4">
          <LanguageFieldGroup
            control={form.control}
            fields={{
              others: { name: "psfothers", label: "16. Others", disabled: !libraryYearStatus?.is_open_for_editing }
            }}
            useFloatNumbers={true}
            singleField={true}
          />
        </div>
      </FormSection>

      {/* Total Personnel */}
      <FormSection
        title="Total Personnel"
        description="Auto-calculated total of all personnel."
      >
        <SubtotalDisplay
          label="17. Personnel Total"
          value={totalPersonnel}
          formula="05 + 10 + 15 + 16"
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
      </FormSection>

      {/* Outsourcing */}
      <FormSection
        title="Outsourcing"
        description="Select whether your library uses outsourcing for acquisition or processing."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              18. Acquisition Outsourcing
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={form.watch("psfosacquisition") === true}
                  onChange={() => form.setValue("psfosacquisition", true)}
                  disabled={!libraryYearStatus?.is_open_for_editing}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={form.watch("psfosacquisition") === false}
                  onChange={() => form.setValue("psfosacquisition", false)}
                  disabled={!libraryYearStatus?.is_open_for_editing}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              19. Processing Outsourcing
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={form.watch("psfosprocessing") === true}
                  onChange={() => form.setValue("psfosprocessing", true)}
                  disabled={!libraryYearStatus?.is_open_for_editing}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={form.watch("psfosprocessing") === false}
                  onChange={() => form.setValue("psfosprocessing", false)}
                  disabled={!libraryYearStatus?.is_open_for_editing}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information or comments about personnel support."
      >
        <ReusableFormField
          control={form.control}
          name="psfnotes"
          label="20. Memo/Footnote for this form"
          placeholder="Enter any notes, footnotes, or additional information..."
          type="textarea"
          disabled={!libraryYearStatus?.is_open_for_editing}
        />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Personnel Support Data"
      />
    </FormWrapper>
  )
}
