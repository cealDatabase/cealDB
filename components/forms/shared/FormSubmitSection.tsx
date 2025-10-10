import { Button } from "@/components/ui/button"
import { LoaderCircle, Save } from "lucide-react"
import { StatusMessage } from "../StatusMessage"

interface FormSubmitSectionProps {
  isSubmitting: boolean
  successMessage: string | null
  errorMessage: string | null
  submitButtonText: string
  className?: string
  onSaveDraft?: () => Promise<void>
  isSavingDraft?: boolean
}

export function FormSubmitSection({
  isSubmitting,
  successMessage,
  errorMessage,
  submitButtonText,
  className = "space-y-4",
  onSaveDraft,
  isSavingDraft = false
}: FormSubmitSectionProps) {
  return (
    <div className={className}>
      <StatusMessage
        type="success"
        message={successMessage || ""}
        show={!!successMessage}
      />

      <StatusMessage
        type="error"
        message={errorMessage || ""}
        show={!!errorMessage}
      />

      <div className="flex justify-end gap-3 mb-4">
        {onSaveDraft && (
          <Button 
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting || isSavingDraft}
            className="min-w-[150px]"
          >
            {isSavingDraft ? (
              <>
                <LoaderCircle className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Saving Draft...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={isSubmitting || isSavingDraft}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Submitting...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </div>
  )
}
