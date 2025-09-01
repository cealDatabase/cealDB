"use client"

import { useState } from "react"
import { UnprocessedInstructions } from "@/components/instructions/unprocessed"
import { Button } from "@/components/ui/button"
import { BookOpen, X } from "lucide-react"
import { Container } from "@/components/Container"

// Placeholder form component since no schema exists yet
const UnprocessedForm = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Unprocessed/Backlog Form</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              01. Unprocessed Chinese
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              02. Unprocessed Japanese
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              03. Unprocessed Korean
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              04. Unprocessed Non-CJK
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 70"
            />
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              05. Unprocessed Total (auto-calculated: 01 + 02 + 03 + 04)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0"
              readOnly
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            06. Memo/Footnote for this form
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter any notes or footnotes..."
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Save Draft</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Submit</Button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a placeholder form. Database schema integration is pending.
        </p>
      </div>
    </div>
  )
}

const UnprocessedPage = () => {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mt-6">
        Unprocessed Backlog Materials (volumes or pieces)
      </h1>
      <Container>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-md bg-black text-white font-bold"
            size="lg"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? (
              <>
                <X className="h-4 w-4" />
                Hide Instructions
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                View Instructions
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-6 max-w-full">
          {/* Instructions Column - 1/3 width */}
          {showInstructions && (
            <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[80vh] sticky top-4">
              <UnprocessedInstructions />
            </div>
          )}

          {/* Form Column - 2/3 width when instructions shown, full width when hidden */}
          <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
            <UnprocessedForm />
          </div>
        </div>
      </Container>
    </>
  )
}

export default UnprocessedPage