"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface MonographicData {
  mapurchased_titles_chinese: number | null;
  mapurchased_titles_japanese: number | null;
  mapurchased_titles_korean: number | null;
  mapurchased_titles_noncjk: number | null;
  mapurchased_titles_subtotal: number | null;
  mapurchased_volumes_chinese: number | null;
  mapurchased_volumes_japanese: number | null;
  mapurchased_volumes_korean: number | null;
  mapurchased_volumes_noncjk: number | null;
  mapurchased_volumes_subtotal: number | null;
  manonpurchased_titles_chinese: number | null;
  manonpurchased_titles_japanese: number | null;
  manonpurchased_titles_korean: number | null;
  manonpurchased_titles_noncjk: number | null;
  manonpurchased_titles_subtotal: number | null;
  manonpurchased_volumes_chinese: number | null;
  manonpurchased_volumes_japanese: number | null;
  manonpurchased_volumes_korean: number | null;
  manonpurchased_volumes_noncjk: number | null;
  manonpurchased_volumes_subtotal: number | null;
  matotal_titles: number | null;
  matotal_volumes: number | null;
}

interface YearData {
  year: number;
  data: MonographicData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/monographic/past-years?libid=${libid}`)
        
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
          Monographic Acquisitions - Past 5 Years
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
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={3}>Year</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={20}>Monographs Additions</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={2} rowSpan={2}>Total Number of Additions</th>
              </tr>
              <tr className="bg-teal-700 text-white">
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={10}>Purchased</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={10}>Rec'd but not Purchased</th>
              </tr>
              <tr className="bg-teal-600 text-white">
                {/* Purchased - Titles */}
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Titles</th>
                {/* Purchased - Volumes */}
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Volumes</th>
                
                {/* Non-Purchased - Titles */}
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Titles</th>
                {/* Non-Purchased - Volumes */}
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Volumes</th>
                
                {/* Grand Totals */}
                <th className="border border-gray-300 px-2 py-2 text-center font-medium">Titles<br/>Grand Total</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-medium">Volumes<br/>Grand Total</th>
              </tr>
              <tr className="bg-teal-500 text-white text-xs">
                {/* Empty cell under Year to align properly */}
                <th className="border border-gray-300 px-2 py-1"></th>
                
                {/* Purchased Titles: CHN, JPN, KOR, Non-CJK, Total */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Purchased Volumes: CHN, JPN, KOR, Non-CJK, Total */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Non-Purchased Titles: CHN, JPN, KOR, Non-CJK, Total */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Non-Purchased Volumes: CHN, JPN, KOR, Non-CJK, Total */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Grand Totals (empty cells to align) */}
                <th className="border border-gray-300 px-2 py-1"></th>
                <th className="border border-gray-300 px-2 py-1"></th>
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
                    
                    {/* Purchased Titles: CHN, JPN, KOR, Non-CJK, Total */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_titles_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_titles_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_titles_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_titles_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.mapurchased_titles_subtotal)}
                    </td>
                    
                    {/* Purchased Volumes: CHN, JPN, KOR, Non-CJK, Total */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_volumes_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_volumes_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_volumes_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.mapurchased_volumes_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.mapurchased_volumes_subtotal)}
                    </td>
                    
                    {/* Non-Purchased Titles: CHN, JPN, KOR, Non-CJK, Total */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_titles_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_titles_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_titles_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_titles_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.manonpurchased_titles_subtotal)}
                    </td>
                    
                    {/* Non-Purchased Volumes: CHN, JPN, KOR, Non-CJK, Total */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_volumes_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_volumes_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_volumes_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.manonpurchased_volumes_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.manonpurchased_volumes_subtotal)}
                    </td>
                    
                    {/* Grand Totals */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {formatNumber(data?.matotal_titles)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {formatNumber(data?.matotal_volumes)}
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
