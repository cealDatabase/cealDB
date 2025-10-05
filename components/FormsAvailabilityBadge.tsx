interface FormsAvailabilityBadgeProps {
  totalForms: number
  isFormsClosed: boolean
}

export function FormsAvailabilityBadge({ totalForms, isFormsClosed }: FormsAvailabilityBadgeProps) {
  // Determine status based on server-side data
  const status = isFormsClosed
    ? {
        text: "Forms are closed",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      }
    : {
        text: `${totalForms} Available`,
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      }

  return (
    <span className={`px-3 py-1 ${status.bgColor} ${status.textColor} text-sm font-medium rounded-full`}>
      {status.text}
    </span>
  )
}
