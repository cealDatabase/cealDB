"use client"

import { useState } from "react"
import { FiscalInstructions } from "@/components/instructions/fiscal"
import { Button } from "@/components/ui/button"
import { BookOpen, X } from "lucide-react"
import { Container } from "@/components/Container"

// Fiscal Support form component based on the schema
const FiscalForm = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fiscal Support Form</h2>
      
      <div className="space-y-8">
        {/* Chinese Appropriations */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chinese Appropriations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                01. Chinese Appropriations Monographic
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                02. Chinese Appropriations Serial
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                03. Chinese Appropriations Other Materials
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                04. Chinese Appropriations Electronic Resources
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              05. Chinese Appropriations Total (auto-calculated: 01 + 02 + 03 + 04)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* Japanese Appropriations */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Japanese Appropriations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                06. Japanese Appropriations Monographic
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                07. Japanese Appropriations Serial
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                08. Japanese Appropriations Other Materials
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                09. Japanese Appropriations Electronic Resources
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              10. Japanese Appropriations Total (auto-calculated: 06 + 07 + 08 + 09)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* Korean Appropriations */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Korean Appropriations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                11. Korean Appropriations Monographic
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                12. Korean Appropriations Serial
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                13. Korean Appropriations Other Materials
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                14. Korean Appropriations Electronic Resources
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              15. Korean Appropriations Total (auto-calculated: 11 + 12 + 13 + 14)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* Non-CJK Appropriations */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Non-CJK Appropriations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                16. Non-CJK Appropriations Monographic
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                17. Non-CJK Appropriations Serial
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                18. Non-CJK Appropriations Other Materials
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                19. Non-CJK Appropriations Electronic Resources
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              20. Non-CJK Appropriations Total (auto-calculated: 16 + 17 + 18 + 19)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* Total Appropriations */}
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
          <label className="block text-lg font-bold text-gray-900 mb-2">
            21. Total Appropriations (auto-calculated: 05 + 10 + 15 + 20)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-lg font-semibold"
            placeholder="0.00"
            readOnly
          />
        </div>

        {/* Endowments */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Endowments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                22. Endowments Chinese
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                23. Endowments Japanese
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                24. Endowments Korean
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                25. Endowments Non-CJK
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              26. Endowments Total (auto-calculated: 22 + 23 + 24 + 25)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* Grants */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                27. Grants Chinese
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                28. Grants Japanese
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                29. Grants Korean
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                30. Grants Non-CJK
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              31. Grants Total (auto-calculated: 27 + 28 + 29 + 30)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* East Asian Program Support */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">East Asian Program Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                32. East Asian Program Support Chinese
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                33. East Asian Program Support Japanese
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                34. East Asian Program Support Korean
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                35. East Asian Program Support Non-CJK
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount in USD"
              />
            </div>
          </div>
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              36. East Asian Program Support Total (auto-calculated: 32 + 33 + 34 + 35)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>

        {/* Total Budget */}
        <div className="border-2 border-gray-400 rounded-lg p-6 bg-gray-50">
          <label className="block text-xl font-bold text-gray-900 mb-2">
            37. Total Acquisitions Budget (auto-calculated: 21 + 26 + 31 + 36)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-xl font-bold"
            placeholder="0.00"
            readOnly
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes/Memo for this form
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter any notes, footnotes, or additional information..."
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Save Draft</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Submit</Button>
        </div>
      </div>
    </div>
  )
}

const FiscalPage = () => {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mt-6">
        Fiscal Support
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