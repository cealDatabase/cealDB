"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface PublicServicesData {
  pspresentations_subtotal: number | null;
  pspresentation_participants_subtotal: number | null;
  psreference_transactions_subtotal: number | null;
  pstotal_circulations_subtotal: number | null;
  pslending_requests_filled_subtotal: number | null;
  pslending_requests_unfilled_subtotal: number | null;
  psborrowing_requests_filled_subtotal: number | null;
  psborrowing_requests_unfilled_subtotal: number | null;
}

interface YearData {
  year: number;
  data: PublicServicesData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/publicServices/past-years?libid=${libid}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch past years data")
        }

        const result = await response.json()
        setPastYearsData(result.pastYears)
      } catch (error) {
        console.error("Error fetching past years data:", error)
        toast.error("Failed to load past years data")
      } finally {
        setIsLoading(false)
      }
    }

    if (libid) {
      fetchPastYearsData()
    }
  }, [libid])

  const formatNumber = (value: number | null | undefined) => {
    return value !== null && value !== undefined ? value : 0
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Public Services - Past 5 Years
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading past years data...</div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Year</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Number of Library Presentations</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Participants in Presentations</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Number of Reference Transactions</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Number of Total Circulation</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={4}>Interlibrary Loans</th>
              </tr>
              <tr className="bg-teal-600 text-white text-xs">
                {/* Interlibrary Loans subcategories */}
                <th className="border border-gray-300 px-2 py-1" colSpan={2}>Lending Requests</th>
                <th className="border border-gray-300 px-2 py-1" colSpan={2}>Borrowing Requests</th>
              </tr>
              <tr className="bg-teal-500 text-white text-xs">
                {/* Interlibrary Loans fields - we need to add these after the first 5 columns */}
                <th className="border border-gray-300 px-2 py-1"></th>
                <th className="border border-gray-300 px-2 py-1"></th>
                <th className="border border-gray-300 px-2 py-1"></th>
                <th className="border border-gray-300 px-2 py-1"></th>
                <th className="border border-gray-300 px-2 py-1"></th>
                <th className="border border-gray-300 px-2 py-1">Filled</th>
                <th className="border border-gray-300 px-2 py-1">Unfilled</th>
                <th className="border border-gray-300 px-2 py-1">Filled</th>
                <th className="border border-gray-300 px-2 py-1">Unfilled</th>
              </tr>
            </thead>
            <tbody>
              {pastYearsData.map((yearData, index) => {
                const data = yearData.data
                const isEvenRow = index % 2 === 0
                
                return (
                  <tr
                    key={yearData.year}
                    className={`
                      transition-colors duration-150
                      ${isEvenRow ? 'bg-white' : 'bg-gray-50'}
                      hover:bg-yellow-100
                      cursor-default
                    `}
                  >
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-center bg-yellow-50">
                      {yearData.year}
                    </td>
                    
                    {/* Number of Library Presentations */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.pspresentations_subtotal)}
                    </td>
                    
                    {/* Participants in Presentations */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.pspresentation_participants_subtotal)}
                    </td>
                    
                    {/* Number of Reference Transactions */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psreference_transactions_subtotal)}
                    </td>
                    
                    {/* Number of Total Circulation */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.pstotal_circulations_subtotal)}
                    </td>
                    
                    {/* Interlibrary Loans - Lending Requests */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.pslending_requests_filled_subtotal)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.pslending_requests_unfilled_subtotal)}
                    </td>
                    
                    {/* Interlibrary Loans - Borrowing Requests */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psborrowing_requests_filled_subtotal)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psborrowing_requests_unfilled_subtotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && pastYearsData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No data available for the past 5 years.
        </div>
      )}
    </Container>
  )
}
