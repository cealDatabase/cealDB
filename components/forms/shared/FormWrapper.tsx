import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"

interface LibraryYearStatus {
  exists: boolean
  is_open_for_editing: boolean
  is_active: boolean
  message: string
}

interface FormWrapperProps {
  form: UseFormReturn<any>
  onSubmit: (values: any) => void
  isLoading: boolean
  libraryYearStatus: LibraryYearStatus | null
  children: ReactNode
  className?: string
}

export function FormWrapper({
  form,
  onSubmit,
  isLoading,
  libraryYearStatus,
  children,
  className = "space-y-8"
}: FormWrapperProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Checking form availability...</div>
      </div>
    )
  }

  // Show error message if library year doesn't exist or is not open for editing
  if (!libraryYearStatus?.exists || !libraryYearStatus?.is_open_for_editing) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Form Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{libraryYearStatus?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </Form>
  )
}
