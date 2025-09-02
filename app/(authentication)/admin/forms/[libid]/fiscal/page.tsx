"use client"

import { useState } from "react"
import { FiscalInstructions } from "@/components/instructions/fiscal"
import FiscalForm from "@/components/forms/fiscal-form"
import { Button } from "@/components/ui/button"
import { BookOpen, X } from "lucide-react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"

const FiscalPage = () => {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <Container>
        <AdminBreadcrumb libraryName="Library" />
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Fiscal Support
        </h1>
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
              <FiscalInstructions />
            </div>
          )}

          {/* Form Column - 2/3 width when instructions shown, full width when hidden */}
          <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
            <FiscalForm />
          </div>
        </div>
      </Container>
    </>
  )
}

export default FiscalPage