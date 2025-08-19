"use client"

import { useState } from "react"
import { MonographicInstructions } from "@/components/instructions/monographic"
import MonographicForm from "@/components/forms/monographic-form"
import { Button } from "@/components/ui/button"
import { BookOpen, X } from "lucide-react"
import { Container } from "@/components/Container"


const MonographicPage = () => {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">
        Monographic Acquisitions
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
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Monographic Acquisitions Form (Required)
                </h2>
                <p className="text-sm text-gray-600">
                  Guidelines and requirements for completing the monographic acquisitions form.
                </p>
              </div>
              <MonographicInstructions />
            </div>
          )}

          {/* Form Column - 2/3 width when instructions shown, full width when hidden */}
          <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
            <MonographicForm />
          </div>
        </div>
      </Container>
    </>
  )
}

export default MonographicPage