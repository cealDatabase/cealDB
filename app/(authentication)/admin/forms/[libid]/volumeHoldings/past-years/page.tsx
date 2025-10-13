"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface VolumeHoldingsData {
  vhprevious_year_chinese: number | null;
  vhprevious_year_japanese: number | null;
  vhprevious_year_korean: number | null;
  vhprevious_year_noncjk: number | null;
  vhprevious_year_subtotal: number | null;
  vhadded_gross_chinese: number | null;
  vhadded_gross_japanese: number | null;
  vhadded_gross_korean: number | null;
  vhadded_gross_noncjk: number | null;
  vhadded_gross_subtotal: number | null;
  vhwithdrawn_chinese: number | null;
  vhwithdrawn_japanese: number | null;
  vhwithdrawn_korean: number | null;
  vhwithdrawn_noncjk: number | null;
  vhwithdrawn_subtotal: number | null;
  vhgrandtotal: number | null;
}

interface YearData {
  year: number;
  data: VolumeHoldingsData | null;
  ebVolumes: number | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/volumeHoldings/past-years?libid=${libid}`)
        
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

  // Calculate final physical volumes held
  const calculateFinal = (data: VolumeHoldingsData | null, language: 'chinese' | 'japanese' | 'korean' | 'noncjk') => {
    if (!data) return 0
    const previous = formatNumber(data[`vhprevious_year_${language}` as keyof VolumeHoldingsData] as number | null)
    const added = formatNumber(data[`vhadded_gross_${language}` as keyof VolumeHoldingsData] as number | null)
    const withdrawn = formatNumber(data[`vhwithdrawn_${language}` as keyof VolumeHoldingsData] as number | null)
    return previous + added - withdrawn
  }

  // Calculate final total
  const calculateFinalTotal = (data: VolumeHoldingsData | null) => {
    if (!data) return 0
    return (
      calculateFinal(data, 'chinese') +
      calculateFinal(data, 'japanese') +
      calculateFinal(data, 'korean') +
      calculateFinal(data, 'noncjk')
    )
  }

  // Calculate total volumes held (Final Physical + Electronic)
  const calculateTotalVolumes = (data: VolumeHoldingsData | null, ebVolumes: number | null) => {
    const finalPhysical = calculateFinalTotal(data)
    const electronic = formatNumber(ebVolumes)
    return finalPhysical + electronic
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Physical Volume Holdings - Past 5 Years
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
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Physical Volumes Held Previously</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Physical Volumes Added During Year-Gross</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Physical Volumes Withdrawn During Year</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Final Physical Volumes Held</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Total Electronic Books Volumes Held</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Total Volumes Held</th>
              </tr>
              <tr className="bg-teal-600 text-white text-xs">
                {/* Physical Volumes Held Previously */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Physical Volumes Added During Year-Gross */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Physical Volumes Withdrawn During Year */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Final Physical Volumes Held */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
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
                    
                    {/* Physical Volumes Held Previously */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhprevious_year_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhprevious_year_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhprevious_year_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhprevious_year_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.vhprevious_year_subtotal)}
                    </td>
                    
                    {/* Physical Volumes Added During Year-Gross */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhadded_gross_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhadded_gross_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhadded_gross_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhadded_gross_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.vhadded_gross_subtotal)}
                    </td>
                    
                    {/* Physical Volumes Withdrawn During Year */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhwithdrawn_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhwithdrawn_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhwithdrawn_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.vhwithdrawn_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.vhwithdrawn_subtotal)}
                    </td>
                    
                    {/* Final Physical Volumes Held (Calculated) */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinal(data, 'chinese')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinal(data, 'japanese')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinal(data, 'korean')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinal(data, 'noncjk')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {calculateFinalTotal(data)}
                    </td>
                    
                    {/* Total Electronic Books Volumes Held */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-green-50">
                      {formatNumber(yearData.ebVolumes)}
                    </td>
                    
                    {/* Total Volumes Held (Final Physical + Electronic) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-100">
                      {calculateTotalVolumes(data, yearData.ebVolumes)}
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
