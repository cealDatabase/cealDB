import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

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

  // Online Map
  ohonlinemapchinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohonlinemapjapanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohonlinemapkorean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohonlinemapnoncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Online Image/Photograph
  ohonlineimagechinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohonlineimagejapanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohonlineimagekorean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohonlineimagenoncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Streaming Audio/Music
  ohstreamingchinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohstreamingjapanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohstreamingkorean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohstreamingnoncjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Streaming Film/Video
  ohstreamingvideochinese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohstreamingvideojapanese: z.number().min(0, { message: "Must be a non-negative number" }),
  ohstreamingvideokorean: z.number().min(0, { message: "Must be a non-negative number" }),
  ohstreamingvideononcjk: z.number().min(0, { message: "Must be a non-negative number" }),

  // Notes
  ohnotes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function OtherHoldingsForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const params = useParams()

  // Use the reusable hook for status checking
  const { libraryYearStatus, isLoading, existingData } = useFormStatusChecker('/api/otherHoldings/status')

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
      ohonlinemapchinese: 0,
      ohonlinemapjapanese: 0,
      ohonlinemapkorean: 0,
      ohonlinemapnoncjk: 0,
      ohonlineimagechinese: 0,
      ohonlineimagejapanese: 0,
      ohonlineimagekorean: 0,
      ohonlineimagenoncjk: 0,
      ohstreamingchinese: 0,
      ohstreamingjapanese: 0,
      ohstreamingkorean: 0,
      ohstreamingnoncjk: 0,
      ohstreamingvideochinese: 0,
      ohstreamingvideojapanese: 0,
      ohstreamingvideokorean: 0,
      ohstreamingvideononcjk: 0,
      ohnotes: "",
    },
  })

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

  const onlineMapSubtotal =
    (watchedValues.ohonlinemapchinese || 0) +
    (watchedValues.ohonlinemapjapanese || 0) +
    (watchedValues.ohonlinemapkorean || 0) +
    (watchedValues.ohonlinemapnoncjk || 0)

  const onlineImageSubtotal =
    (watchedValues.ohonlineimagechinese || 0) +
    (watchedValues.ohonlineimagejapanese || 0) +
    (watchedValues.ohonlineimagekorean || 0) +
    (watchedValues.ohonlineimagenoncjk || 0)

  const streamingAudioSubtotal =
    (watchedValues.ohstreamingchinese || 0) +
    (watchedValues.ohstreamingjapanese || 0) +
    (watchedValues.ohstreamingkorean || 0) +
    (watchedValues.ohstreamingnoncjk || 0)

  const streamingVideoSubtotal =
    (watchedValues.ohstreamingvideochinese || 0) +
    (watchedValues.ohstreamingvideojapanese || 0) +
    (watchedValues.ohstreamingvideokorean || 0) +
    (watchedValues.ohstreamingvideononcjk || 0)

  const grandTotal = microformSubtotal + graphicSubtotal + audioSubtotal + videoSubtotal + dvdSubtotal + customSubtotal + onlineMapSubtotal + onlineImageSubtotal + streamingAudioSubtotal + streamingVideoSubtotal

  // Import AV data function
  const [isImporting, setIsImporting] = useState(false);

  const importAVData = async () => {
    try {
      setIsImporting(true);

      const libraryId = Number(params.libid);
      const currentYear = new Date().getFullYear();

      const response = await fetch(`/api/otherHoldings/import-av/${libraryId}/${currentYear}`);
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data;

        // Calculate total counts
        let totalImported = 0;

        // Set online map fields
        const onlineMapTotal = (data['online map'].chinese || 0) + (data['online map'].japanese || 0) + 
                               (data['online map'].korean || 0) + (data['online map'].noncjk || 0);
        form.setValue('ohonlinemapchinese', data['online map'].chinese || 0, { shouldValidate: false });
        form.setValue('ohonlinemapjapanese', data['online map'].japanese || 0, { shouldValidate: false });
        form.setValue('ohonlinemapkorean', data['online map'].korean || 0, { shouldValidate: false });
        form.setValue('ohonlinemapnoncjk', data['online map'].noncjk || 0, { shouldValidate: false });
        totalImported += onlineMapTotal;

        // Set online image fields
        const onlineImageTotal = (data['online image/photograph'].chinese || 0) + (data['online image/photograph'].japanese || 0) + 
                                 (data['online image/photograph'].korean || 0) + (data['online image/photograph'].noncjk || 0);
        form.setValue('ohonlineimagechinese', data['online image/photograph'].chinese || 0, { shouldValidate: false });
        form.setValue('ohonlineimagejapanese', data['online image/photograph'].japanese || 0, { shouldValidate: false });
        form.setValue('ohonlineimagekorean', data['online image/photograph'].korean || 0, { shouldValidate: false });
        form.setValue('ohonlineimagenoncjk', data['online image/photograph'].noncjk || 0, { shouldValidate: false });
        totalImported += onlineImageTotal;

        // Set streaming audio fields
        const streamingAudioTotal = (data['streaming audio/music'].chinese || 0) + (data['streaming audio/music'].japanese || 0) + 
                                    (data['streaming audio/music'].korean || 0) + (data['streaming audio/music'].noncjk || 0);
        form.setValue('ohstreamingchinese', data['streaming audio/music'].chinese || 0, { shouldValidate: false });
        form.setValue('ohstreamingjapanese', data['streaming audio/music'].japanese || 0, { shouldValidate: false });
        form.setValue('ohstreamingkorean', data['streaming audio/music'].korean || 0, { shouldValidate: false });
        form.setValue('ohstreamingnoncjk', data['streaming audio/music'].noncjk || 0, { shouldValidate: false });
        totalImported += streamingAudioTotal;

        // Set streaming video fields
        const streamingVideoTotal = (data['streaming film/video'].chinese || 0) + (data['streaming film/video'].japanese || 0) + 
                                    (data['streaming film/video'].korean || 0) + (data['streaming film/video'].noncjk || 0);
        form.setValue('ohstreamingvideochinese', data['streaming film/video'].chinese || 0, { shouldValidate: false });
        form.setValue('ohstreamingvideojapanese', data['streaming film/video'].japanese || 0, { shouldValidate: false });
        form.setValue('ohstreamingvideokorean', data['streaming film/video'].korean || 0, { shouldValidate: false });
        form.setValue('ohstreamingvideononcjk', data['streaming film/video'].noncjk || 0, { shouldValidate: false });
        totalImported += streamingVideoTotal;

        // Show detailed success message
        toast.success(
          `✓ Import successful! ${totalImported} total items imported.`,
          { duration: 6000 }
        );
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to import AV data';
        console.error('Import error:', errorData);
        toast.error(`❌ Import failed: ${errorMessage}`, { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Import AV data error:', error);
      toast.error(`❌ Import failed: ${error.message || 'Network error or server unavailable'}`, { duration: 5000 });
    } finally {
      setIsImporting(false);
    }
  };

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
        ohonlinemapsubtotal: onlineMapSubtotal,
        ohonlineimagesubtotal: onlineImageSubtotal,
        ohstreamingsubtotal: streamingAudioSubtotal,
        ohstreamingvideosubtotal: streamingVideoSubtotal,
        ohgrandtotal: grandTotal,
        // Remove libraryyear - API will handle the relationship via libid
        libid: Number(params.libid),
        finalSubmit: true,
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

    } catch (error: any) {
      console.error('Form submission error:', error)
      const message = error.message || 'An unexpected error occurred'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
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
        ohmicroform_subtotal: microformSubtotal,
        ohcarto_graphic_subtotal: graphicSubtotal,
        ohaudio_subtotal: audioSubtotal,
        ohfilm_video_subtotal: videoSubtotal,
        ohdvd_subtotal: dvdSubtotal,
        ohcustom1subtotal: customSubtotal,
        ohonlinemapsubtotal: onlineMapSubtotal,
        ohonlineimagesubtotal: onlineImageSubtotal,
        ohstreamingsubtotal: streamingAudioSubtotal,
        ohstreamingvideosubtotal: streamingVideoSubtotal,
        ohgrandtotal: grandTotal,
        libid: Number(params.libid),
      }

      const response = await fetch('/api/otherHoldings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to save draft')
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>
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
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      isLoading={isLoading}
      libraryYearStatus={libraryYearStatus}
    >
      {/* Microforms Section */}
      <FormSection
        title='Microforms'
        description='Microfilm reels, microcards, microprint, and microfiche sheets'
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: {
              name: "ohmicroform_chinese",
              label: "01. Microform Chinese",
            },
            japanese: {
              name: "ohmicroform_japanese",
              label: "02. Microform Japanese",
            },
            korean: {
              name: "ohmicroform_korean",
              label: "03. Microform Korean",
            },
            noncjk: {
              name: "ohmicroform_noncjk",
              label: "04. Microform Non-CJK",
            },
          }}
        />
        <SubtotalDisplay
          label='05. Microforms Subtotal'
          value={microformSubtotal}
          formula='01 + 02 + 03 + 04'
        />
      </FormSection>

      {/* Cartographic and Graphic Materials Section */}
      <FormSection
        title='Cartographic and Graphic Materials'
        description='Maps, globes, photographs, prints, slides, and visual materials'
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: {
              name: "ohcarto_graphic_chinese",
              label: "06. Graphic Chinese",
            },
            japanese: {
              name: "ohcarto_graphic_japanese",
              label: "07. Graphic Japanese",
            },
            korean: {
              name: "ohcarto_graphic_korean",
              label: "08. Graphic Korean",
            },
            noncjk: {
              name: "ohcarto_graphic_noncjk",
              label: "09. Graphic Non-CJK",
            },
          }}
        />
        <SubtotalDisplay
          label='10. Graphics Subtotal'
          value={graphicSubtotal}
          formula='06 + 07 + 08 + 09'
        />
      </FormSection>

      {/* Audio Materials Section */}
      <FormSection
        title='Audio Materials'
        description='Audiocassettes, CDs, phonodiscs, and sound recordings'
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohaudio_chinese", label: "11. Audio Chinese" },
            japanese: { name: "ohaudio_japanese", label: "12. Audio Japanese" },
            korean: { name: "ohaudio_korean", label: "13. Audio Korean" },
            noncjk: { name: "ohaudio_noncjk", label: "14. Audio Non-CJK" },
          }}
        />
        <SubtotalDisplay
          label='15. Audio Subtotal'
          value={audioSubtotal}
          formula='11 + 12 + 13 + 14'
        />
      </FormSection>

      {/* Video Materials Section */}
      <FormSection
        title='Video Materials'
        description='Motion pictures, videocassettes, and laserdiscs'
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: {
              name: "ohfilm_video_chinese",
              label: "16. Video Chinese",
            },
            japanese: {
              name: "ohfilm_video_japanese",
              label: "17. Video Japanese",
            },
            korean: { name: "ohfilm_video_korean", label: "18. Video Korean" },
            noncjk: { name: "ohfilm_video_noncjk", label: "19. Video Non-CJK" },
          }}
        />
        <SubtotalDisplay
          label='20. Video Subtotal'
          value={videoSubtotal}
          formula='16 + 17 + 18 + 19'
        />
      </FormSection>

      {/* DVD Materials Section */}
      <FormSection
        title='DVD Materials'
        description='Digital video discs and related media'
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohdvd_chinese", label: "21. DVD Chinese" },
            japanese: { name: "ohdvd_japanese", label: "22. DVD Japanese" },
            korean: { name: "ohdvd_korean", label: "23. DVD Korean" },
            noncjk: { name: "ohdvd_noncjk", label: "24. DVD Non-CJK" },
          }}
        />
        <SubtotalDisplay
          label='25. DVD Subtotal'
          value={dvdSubtotal}
          formula='21 + 22 + 23 + 24'
        />
      </FormSection>

      {/* Online Materials Section */}
      <FormSection
        title='Online Materials'
        description='Digital materials from electronic resources (auto-calculated from database lists)'
      >
        <div className='mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800 mb-2'>
            <strong>BEFORE using the import feature</strong>, please fill out or
            update the &quot;Audio-Visual Databases&quot; in order for the
            system to provide the corresponding numbers automatically.
          </p>
          <Button
            type='button'
            onClick={importAVData}
            className='flex items-center gap-2'
            variant='default'
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Importing...
              </>
            ) : (
              <>
                <Download className='h-4 w-4' />
                Import from &quot;Audio/Video Databases&quot;
              </>
            )}
          </Button>
        </div>

        {/* Online Map */}
        <div className='mb-6'>
          <h4 className='font-semibold mb-3 text-cyan-700'>Online Map</h4>
          <LanguageFieldGroup
            control={form.control as any}
            fields={{
              chinese: {
                name: "ohonlinemapchinese",
                label: "26. Online Map Chinese",
              },
              japanese: {
                name: "ohonlinemapjapanese",
                label: "27. Online Map Japanese",
              },
              korean: {
                name: "ohonlinemapkorean",
                label: "28. Online Map Korean",
              },
              noncjk: {
                name: "ohonlinemapnoncjk",
                label: "29. Online Map Non-CJK",
              },
            }}
          />
          <div className='mt-4'></div>
          <SubtotalDisplay
            label='30. Online Map Subtotal'
            value={onlineMapSubtotal}
            formula='26 + 27 + 28 + 29'
          />
        </div>

        {/* Online Image/Photograph */}
        <div className='mb-6'>
          <h4 className='font-semibold mb-3 text-cyan-700'>
            Online Image/Photograph
          </h4>
          <LanguageFieldGroup
            control={form.control as any}
            fields={{
              chinese: {
                name: "ohonlineimagechinese",
                label: "31. Online Image/Photograph Chinese",
              },
              japanese: {
                name: "ohonlineimagejapanese",
                label: "32. Online Image/Photograph Japanese",
              },
              korean: {
                name: "ohonlineimagekorean",
                label: "33. Online Image/Photograph Korean",
              },
              noncjk: {
                name: "ohonlineimagenoncjk",
                label: "34. Online Image/Photograph Non-CJK",
              },
            }}
          />
          <div className='mt-4'></div>
          <SubtotalDisplay
            label='35. Online Image/Photograph Subtotal'
            value={onlineImageSubtotal}
            formula='31 + 32 + 33 + 34'
          />
        </div>

        {/* Streaming Audio/Music */}
        <div className='mb-6'>
          <h4 className='font-semibold mb-3 text-cyan-700'>
            Streaming Audio/Music
          </h4>
          <LanguageFieldGroup
            control={form.control as any}
            fields={{
              chinese: {
                name: "ohstreamingchinese",
                label: "36. Streaming Audio Chinese",
              },
              japanese: {
                name: "ohstreamingjapanese",
                label: "37. Streaming Audio Japanese",
              },
              korean: {
                name: "ohstreamingkorean",
                label: "38. Streaming Audio Korean",
              },
              noncjk: {
                name: "ohstreamingnoncjk",
                label: "39. Streaming Audio Non-CJK",
              },
            }}
          />
          <div className='mt-4'></div>
          <SubtotalDisplay
            label='40. Streaming Audio/Music Subtotal'
            value={streamingAudioSubtotal}
            formula='36 + 37 + 38 + 39'
          />
        </div>

        {/* Streaming Film/Video */}
        <div className='mb-6'>
          <h4 className='font-semibold mb-3 text-cyan-700'>
            Streaming Film/Video
          </h4>
          <LanguageFieldGroup
            control={form.control as any}
            fields={{
              chinese: {
                name: "ohstreamingvideochinese",
                label: "41. Streaming Film/Video Chinese",
              },
              japanese: {
                name: "ohstreamingvideojapanese",
                label: "42. Streaming Film/Video Japanese",
              },
              korean: {
                name: "ohstreamingvideokorean",
                label: "43. Streaming Film/Video Korean",
              },
              noncjk: {
                name: "ohstreamingvideononcjk",
                label: "44. Streaming Film/Video Non-CJK",
              },
            }}
          />
          <div className='mt-4'></div>
          <SubtotalDisplay
            label='45. Streaming Film/Video Subtotal'
            value={streamingVideoSubtotal}
            formula='41 + 42 + 43 + 44'
          />
        </div>
      </FormSection>

      {/* Custom Materials Section */}
      <FormSection
        title='Custom Materials'
        description='Additional material types specific to your library'
      >
        <LanguageFieldGroup
          control={form.control as any}
          fields={{
            chinese: { name: "ohcustom1chinese", label: "46. Custom Chinese" },
            japanese: {
              name: "ohcustom1japanese",
              label: "47. Custom Japanese",
            },
            korean: { name: "ohcustom1korean", label: "48. Custom Korean" },
            noncjk: { name: "ohcustom1noncjk", label: "49. Custom Non-CJK" },
          }}
        />
        <SubtotalDisplay
          label='50. Custom Subtotal'
          value={customSubtotal}
          formula='46 + 47 + 48 + 49'
        />
      </FormSection>

      {/* Grand Total */}
      <FormSection
        title='Total Other Holdings'
        description='Final total of all other materials'
      >
        <SubtotalDisplay
          label='51. GRAND TOTAL (Other Materials)'
          value={grandTotal}
          formula='05 + 10 + 15 + 20 + 25 + 30 + 35 + 40 + 45 + 50'
          className='bg-blue-50 p-4 rounded-lg'
          valueClassName='bg-blue-200 px-3 py-1 rounded'
        />
      </FormSection>

      {/* Notes Section */}
      <FormSection
        title='Notes'
        description='Additional comments or clarifications'
      >
        <ReusableFormField
          control={form.control as any}
          name='ohnotes'
          type='textarea'
          placeholder='Enter any additional notes or comments...'
          label={""}
        />
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
