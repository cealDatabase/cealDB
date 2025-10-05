interface FormStatusBadgeProps {
  formHref: string
  statusData: {
    isFormsClosed: boolean
    forms: {
      [key: string]: {
        submitted: boolean
        recordId: number | null
      }
    }
  }
}

export function FormStatusBadge({ formHref, statusData }: FormStatusBadgeProps) {
  // Determine status based on server-side data
  let status = {
    text: "Ready to complete",
    color: "text-purple-600",
    dotColor: "bg-purple-400",
  }

  // Check if forms are closed
  if (statusData.isFormsClosed) {
    status = {
      text: "Form closed",
      color: "text-red-600",
      dotColor: "bg-red-400",
    }
  } else {
    // Check if this specific form has been submitted
    const formData = statusData.forms[formHref]
    if (formData && formData.submitted) {
      status = {
        text: "In progress",
        color: "text-blue-600",
        dotColor: "bg-blue-400",
      }
    }
  }

  return (
    <div className={`mt-2 flex items-center text-sm ${status.color}`}>
      <span className={`w-2 h-2 ${status.dotColor} rounded-full mr-2`}></span>
      {status.text}
    </div>
  )
}
