"use client"

import { useEffect, useState } from "react"

interface FormStatusBadgeProps {
  formHref: string
  libid: string
  year: number
}

interface FormStatusData {
  isFormsClosed: boolean
  forms: {
    [key: string]: {
      submitted: boolean
      recordId: number | null
    }
  }
}

export function FormStatusBadge({ formHref, libid, year }: FormStatusBadgeProps) {
  const [status, setStatus] = useState<{
    text: string
    color: string
    dotColor: string
  }>({
    text: "Ready to complete",
    color: "text-purple-600",
    dotColor: "bg-purple-400",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/forms/status/${libid}/${year}`)
        if (response.ok) {
          const data: FormStatusData = await response.json()

          // Check if forms are closed
          if (data.isFormsClosed) {
            setStatus({
              text: "Form closed",
              color: "text-red-600",
              dotColor: "bg-red-400",
            })
          } else {
            // Check if this specific form has been submitted
            const formData = data.forms[formHref]
            if (formData && formData.submitted) {
              setStatus({
                text: "In progress",
                color: "text-blue-600",
                dotColor: "bg-blue-400",
              })
            } else {
              // Keep default "Ready to complete"
              setStatus({
                text: "Ready to complete",
                color: "text-purple-600",
                dotColor: "bg-purple-400",
              })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching form status:", error)
        // Keep default status on error
      } finally {
        setLoading(false)
      }
    }

    if (libid && year) {
      fetchStatus()
    }
  }, [formHref, libid, year])

  if (loading) {
    return (
      <div className="mt-2 flex items-center text-sm text-gray-400">
        <span className="w-2 h-2 bg-gray-300 rounded-full mr-2 animate-pulse"></span>
        Loading...
      </div>
    )
  }

  return (
    <div className={`mt-2 flex items-center text-sm ${status.color}`}>
      <span className={`w-2 h-2 ${status.dotColor} rounded-full mr-2`}></span>
      {status.text}
    </div>
  )
}
