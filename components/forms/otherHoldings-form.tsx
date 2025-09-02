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
  // Entry ID (optional)
  entryid: z.string().optional(),

  // Microforms
  ohmicroform_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohmicroform_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohmicroform_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohmicroform_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Cartographic and Graphic Materials
  ohcarto_graphic_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohcarto_graphic_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohcarto_graphic_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohcarto_graphic_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Audio Materials
  ohaudio_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohaudio_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohaudio_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohaudio_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Video Materials
  ohfilm_video_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohfilm_video_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohfilm_video_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohfilm_video_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // DVD Materials
  ohdvd_chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohdvd_japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohdvd_korean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohdvd_noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Custom Materials (using custom1 fields)
  ohcustom1chinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohcustom1japanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohcustom1korean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohcustom1noncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  ohnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function OtherHoldingsForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()

  // Use the reusable hook for status checking
  const { libraryYearStatus, isLoading } = useFormStatusChecker('/api/otherHoldings/status')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryid: "",
      ohmicroform_chinese: 0,
      ohmicroform_japanese: 0,
      ohmicroform_korean: 0,
      ohmicroform_noncjk: 0,
      ohcarto_graphic_chinese: 0,
      ohcarto_graphic_japanese: 0,
      ohcarto_graphic_korean: 0,
      ohcarto_graphic_noncjk: 0,
      ohaudio_chinese: 0,
      ohaudio_japanese: 0,
      ohaudio_korean: 0,
      ohaudio_noncjk: 0,
      ohfilm_video_chinese: 0,
      ohfilm_video_japanese: 0,
      ohfilm_video_korean: 0,
      ohfilm_video_noncjk: 0,
      ohdvd_chinese: 0,
      ohdvd_japanese: 0,
      ohdvd_korean: 0,
      ohdvd_noncjk: 0,
      ohcustom1chinese: 0,
      ohcustom1japanese: 0,
      ohcustom1korean: 0,
      ohcustom1noncjk: 0,
      ohnotes: "",
    },
  })

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculate subtotals
  const microformSubtotal =
    watchedValues.ohmicroform_chinese +
    watchedValues.ohmicroform_japanese +
    watchedValues.ohmicroform_korean +
    watchedValues.ohmicroform_noncjk

  const graphicSubtotal =
    watchedValues.ohcarto_graphic_chinese +
    watchedValues.ohcarto_graphic_japanese +
    watchedValues.ohcarto_graphic_korean +
    watchedValues.ohcarto_graphic_noncjk

  const audioSubtotal =
    watchedValues.ohaudio_chinese +
    watchedValues.ohaudio_japanese +
    watchedValues.ohaudio_korean +
    watchedValues.ohaudio_noncjk

  const videoSubtotal =
    watchedValues.ohfilm_video_chinese +
    watchedValues.ohfilm_video_japanese +
    watchedValues.ohfilm_video_korean +
    watchedValues.ohfilm_video_noncjk

  const dvdSubtotal =
    watchedValues.ohdvd_chinese +
    watchedValues.ohdvd_japanese +
    watchedValues.ohdvd_korean +
    watchedValues.ohdvd_noncjk

  const customSubtotal =
    watchedValues.ohcustom1chinese +
    watchedValues.ohcustom1japanese +
    watchedValues.ohcustom1korean +
    watchedValues.ohcustom1noncjk

  const grandTotal = microformSubtotal + graphicSubtotal + audioSubtotal + videoSubtotal + dvdSubtotal + customSubtotal

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      const submissionData = {
        ...values,
        ohmicroform_subtotal: microformSubtotal,
        ohcarto_graphic_subtotal: graphicSubtotal,
        ohaudio_subtotal: audioSubtotal,
        ohfilm_video_subtotal: videoSubtotal,
        ohdvd_subtotal: dvdSubtotal,
        ohcustom1subtotal: customSubtotal,
        ohgrandtotal: grandTotal,
        // Remove libraryyear - API will handle the relationship via libid
        libid: Number(params.libid),
      }

      const response = await fetch('/api/otherHoldings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to submit form')
      }

      const result = await response.json()
      toast.success('Other holdings record created successfully!')
      setSuccessMessage(result.message || 'Other holdings record submitted successfully!')
      form.reset()

    } catch (error: any) {
      console.error('Form submission error:', error)
      const message = error.message || 'An unexpected error occurred'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>
  }

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
    >
      {/* Microforms Section */}
      <FormSection
        title="Microforms"
        description="Microfilm reels, microcards, microprint, and microfiche sheets"
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohmicroform_chinese", label: "01. Microform Chinese" },
            japanese: { name: "ohmicroform_japanese", label: "02. Microform Japanese" },
            korean: { name: "ohmicroform_korean", label: "03. Microform Korean" },
            noncjk: { name: "ohmicroform_noncjk", label: "04. Microform Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="05. Microforms Subtotal"
          value={microformSubtotal}
          formula="01 + 02 + 03 + 04"
        />
      </FormSection>

      {/* Cartographic and Graphic Materials Section */}
      <FormSection
        title="Cartographic and Graphic Materials"
        description="Maps, globes, photographs, prints, slides, and visual materials"
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohcarto_graphic_chinese", label: "06. Graphic Chinese" },
            japanese: { name: "ohcarto_graphic_japanese", label: "07. Graphic Japanese" },
            korean: { name: "ohcarto_graphic_korean", label: "08. Graphic Korean" },
            noncjk: { name: "ohcarto_graphic_noncjk", label: "09. Graphic Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="10. Graphics Subtotal"
          value={graphicSubtotal}
          formula="06 + 07 + 08 + 09"
        />
      </FormSection>

      {/* Audio Materials Section */}
      <FormSection
        title="Audio Materials"
        description="Audiocassettes, CDs, phonodiscs, and sound recordings"
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohaudio_chinese", label: "11. Audio Chinese" },
            japanese: { name: "ohaudio_japanese", label: "12. Audio Japanese" },
            korean: { name: "ohaudio_korean", label: "13. Audio Korean" },
            noncjk: { name: "ohaudio_noncjk", label: "14. Audio Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="15. Audio Subtotal"
          value={audioSubtotal}
          formula="11 + 12 + 13 + 14"
        />
      </FormSection>

      {/* Video Materials Section */}
      <FormSection
        title="Video Materials"
        description="Motion pictures, videocassettes, and laserdiscs"
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohfilm_video_chinese", label: "16. Video Chinese" },
            japanese: { name: "ohfilm_video_japanese", label: "17. Video Japanese" },
            korean: { name: "ohfilm_video_korean", label: "18. Video Korean" },
            noncjk: { name: "ohfilm_video_noncjk", label: "19. Video Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="20. Video Subtotal"
          value={videoSubtotal}
          formula="16 + 17 + 18 + 19"
        />
      </FormSection>

      {/* DVD Materials Section */}
      <FormSection
        title="DVD Materials"
        description="Digital video discs and related media"
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohdvd_chinese", label: "21. DVD Chinese" },
            japanese: { name: "ohdvd_japanese", label: "22. DVD Japanese" },
            korean: { name: "ohdvd_korean", label: "23. DVD Korean" },
            noncjk: { name: "ohdvd_noncjk", label: "24. DVD Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="25. DVD Subtotal"
          value={dvdSubtotal}
          formula="21 + 22 + 23 + 24"
        />
      </FormSection>

      {/* Custom Materials Section */}
      <FormSection
        title="Custom Materials"
        description="Additional material types specific to your library"
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohcustom1chinese", label: "46. Custom Chinese" },
            japanese: { name: "ohcustom1japanese", label: "47. Custom Japanese" },
            korean: { name: "ohcustom1korean", label: "48. Custom Korean" },
            noncjk: { name: "ohcustom1noncjk", label: "49. Custom Non-CJK" }
          }}
        />
        <SubtotalDisplay
          label="50. Custom Subtotal"
          value={customSubtotal}
          formula="46 + 47 + 48 + 49"
        />
      </FormSection>

      {/* Grand Total */}
      <FormSection
        title="Total Other Holdings"
        description="Final total of all other materials"
      >
        <SubtotalDisplay
          label="51. GRAND TOTAL (Other Materials)"
          value={grandTotal}
          formula="05 + 10 + 15 + 20 + 25 + 50"
          className="bg-blue-50 p-4 rounded-lg"
          valueClassName="bg-blue-200 px-3 py-1 rounded"
        />
      </FormSection>

      {/* Notes Section */}
      <FormSection
        title="Notes"
        description="Additional comments or clarifications"
      >
        <ReusableFormField
          control={form.control as any}
          name="ohnotes"
          type="textarea"
          placeholder="Enter any additional notes or comments..." label={""} />
      </FormSection>

      <FormSubmitSection
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        errorMessage={errorMessage}
        submitButtonText="Submit Other Holdings Data"
      />
    </FormWrapper>
  )
}
