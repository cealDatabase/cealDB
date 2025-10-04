"use client"

import { useEffect, useState } from "react"

interface FormsAvailabilityBadgeProps {
  libid: string
  year: number
  totalForms: number
}

export function FormsAvailabilityBadge({ libid, year, totalForms }: FormsAvailabilityBadgeProps) {
  const [status, setStatus] = useState<{
    text: string
    bgColor: string
    textColor: string
  }>({
    text: `${totalForms} Available`,
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/forms/status/${libid}/${year}`)
        if (response.ok) {
          const data = await response.json()

          if (data.isFormsClosed) {
            setStatus({
              text: "Forms are closed",
              bgColor: "bg-red-100",
              textColor: "text-red-800",
            })
          } else {
            setStatus({
              text: `${data.availableCount} Available`,
              bgColor: "bg-purple-100",
              textColor: "text-purple-800",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching forms availability:", error)
        // Keep default status on error
      } finally {
        setLoading(false)
      }
    }

    if (libid && year) {
      fetchStatus()
    }
  }, [libid, year, totalForms])

  if (loading) {
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-full animate-pulse">
        Loading...
      </span>
    )
  }

  return (
    <span className={`px-3 py-1 ${status.bgColor} ${status.textColor} text-sm font-medium rounded-full`}>
      {status.text}
    </span>
  )
}
