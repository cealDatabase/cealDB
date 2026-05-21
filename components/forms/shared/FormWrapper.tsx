import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Lock } from "lucide-react"
import { FallbackYearBanner } from "@/components/FallbackYearBanner"

interface LibraryYearStatus {
  exists: boolean
  is_open_for_editing: boolean
  is_active: boolean
  message: string
  // year of the Library_Year record actually returned by the status API. May
  // differ from the current calendar year when the API falls back to the most
  // recent year (super admin / pre-launch scenarios). When it does, we render
  // a banner so users aren't confused about which year they're viewing.
  year?: number
}

interface FormWrapperProps {
  form: UseFormReturn<any>
  onSubmit: (values: any) => void
  isLoading: boolean
  libraryYearStatus: LibraryYearStatus | null
  children: ReactNode
  className?: string
  isReadOnly?: boolean
  readOnlyReason?: string
}

export function FormWrapper({
  form,
  onSubmit,
  isLoading,
  libraryYearStatus,
  children,
  className = "space-y-8",
  isReadOnly = false,
  readOnlyReason
}: FormWrapperProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Checking form availability...</div>
      </div>
    )
  }

  // Only block if library year doesn't exist at all
  // If it exists but is closed for editing, show it in read-only mode instead
  if (!libraryYearStatus?.exists) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Form Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-800 space-y-4">
              <p>This form is not currently displayed because it is outside the data entry period.</p>
              <p>If you would like to review data from the current year or past years, you might:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Use <strong>&quot;View Data From Past 5 Years&quot;</strong> in the upper-right corner of this page, or
                </li>
                <li>
                  Go to the <strong>Dashboard</strong> and download the forms from <strong>&quot;Institutional Reports.&quot;</strong>
                </li>
              </ul>
              <p>If you believe this is an error, please contact the CEAL Statistics Committee.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {typeof libraryYearStatus.year === "number" && (
        <FallbackYearBanner year={libraryYearStatus.year} />
      )}

      {isReadOnly && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-blue-900 space-y-1">
                <p className="font-semibold">Read-Only Mode</p>
                <p className="text-sm">
                  {readOnlyReason || "The survey period has closed. You can view the submitted data but cannot make changes."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      </Form>
    </div>
  )
}
