import React from "react"
import { CircleCheckBig, CircleAlert } from "lucide-react"

interface StatusMessageProps {
  type: "success" | "error"
  message: string
  show: boolean
}

export function StatusMessage({ type, message, show }: StatusMessageProps) {
  if (!show) return null

  if (type === "success") {
    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CircleCheckBig className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (type === "error") {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CircleAlert className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800 mb-2">
              Submission Error
            </p>
            <p className="text-sm text-red-700 mb-3">
              {message}
            </p>
            <div className="text-sm text-red-600">
              <p className="mb-1">Please try one of the following:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Click the submit button again to retry</li>
                <li>Check your internet connection</li>
                <li>Contact the administrator if the problem persists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
