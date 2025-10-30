interface FormStatusBadgeProps {
  formHref: string
  statusData: {
    isFormsClosed: boolean
    forms: {
      [key: string]: {
        filled?: boolean
        submitted?: boolean
        recordId: number | null
      }
    }
  }
}

export function FormStatusBadge({ formHref, statusData }: FormStatusBadgeProps) {
  // Determine status based on server-side data
  let status = {
    text: "Ready",
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
    const formData = statusData.forms[formHref]
    if (formData) {
      if (formData.submitted) {
        status = {
          text: "Submitted",
          color: "text-emerald-700",
          dotColor: "bg-emerald-500",
        }
      } else if (formData.filled) {
        status = {
          text: "Filled",
          color: "text-blue-600",
          dotColor: "bg-blue-400",
        }
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
