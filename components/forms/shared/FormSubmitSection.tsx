import { Button } from "@/components/ui/button"
import { LoaderCircle } from "lucide-react"
import { StatusMessage } from "../StatusMessage"

interface FormSubmitSectionProps {
  isSubmitting: boolean
  successMessage: string | null
  errorMessage: string | null
  submitButtonText: string
  className?: string
}

export function FormSubmitSection({
  isSubmitting,
  successMessage,
  errorMessage,
  submitButtonText,
  className = "space-y-4"
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

      <div className="flex justify-end mb-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
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
