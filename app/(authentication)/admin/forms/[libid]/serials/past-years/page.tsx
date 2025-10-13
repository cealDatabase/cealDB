"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface SerialsData {
  spurchased_chinese: number | null;
  spurchased_japanese: number | null;
  spurchased_korean: number | null;
  spurchased_noncjk: number | null;
  spurchased_subtotal: number | null;
  snonpurchased_chinese: number | null;
  snonpurchased_japanese: number | null;
  snonpurchased_korean: number | null;
  snonpurchased_noncjk: number | null;
  snonpurchased_subtotal: number | null;
  stotal_chinese: number | null;
  stotal_japanese: number | null;
  stotal_korean: number | null;
  stotal_noncjk: number | null;
  s_etotal_chinese: number | null;
  s_etotal_japanese: number | null;
  s_etotal_korean: number | null;
  s_etotal_noncjk: number | null;
}

interface YearData {
  year: number;
  data: SerialsData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/serials/past-years?libid=${libid}`)
        
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

  // Calculate Print and Other Formats (Total - Electronic)
  const calculatePrintFormats = (data: SerialsData | null, language: 'chinese' | 'japanese' | 'korean' | 'noncjk') => {
    if (!data) return 0
    const total = formatNumber(data[`stotal_${language}` as keyof SerialsData] as number | null)
    const electronic = formatNumber(data[`s_etotal_${language}` as keyof SerialsData] as number | null)
    return total - electronic
  }

  // Calculate total for print formats
  const calculatePrintFormatsTotal = (data: SerialsData | null) => {
    if (!data) return 0
    return (
      calculatePrintFormats(data, 'chinese') +
      calculatePrintFormats(data, 'japanese') +
      calculatePrintFormats(data, 'korean') +
      calculatePrintFormats(data, 'noncjk')
    )
  }

  // Calculate total for electronic formats
  const calculateElectronicTotal = (data: SerialsData | null) => {
    if (!data) return 0
    return (
      formatNumber(data.s_etotal_chinese) +
      formatNumber(data.s_etotal_japanese) +
      formatNumber(data.s_etotal_korean) +
      formatNumber(data.s_etotal_noncjk)
    )
  }

  // Calculate total for current serials
  const calculateCurrentSerialsTotal = (data: SerialsData | null) => {
    if (!data) return 0
    return (
      formatNumber(data.stotal_chinese) +
      formatNumber(data.stotal_japanese) +
      formatNumber(data.stotal_korean) +
      formatNumber(data.stotal_noncjk)
    )
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Serial Titles: Purchased and Non-Purchased - Past 5 Years
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
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>A. Purchased<br/>(All subscriptions including electronic)</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>B. Not Purchased<br/>(Both print and electronic)</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>C. Print and Other Formats<br/>(excluding electronic)</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>D. Electronic<br/>(excluding print and other formats)</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Total Number of Current Serials</th>
              </tr>
              <tr className="bg-teal-600 text-white text-xs">
                {/* A. Purchased */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* B. Not Purchased */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* C. Print and Other Formats */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* D. Electronic */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Total Number of Current Serials */}
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
                    
                    {/* A. Purchased */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.spurchased_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.spurchased_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.spurchased_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.spurchased_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.spurchased_subtotal)}
                    </td>
                    
                    {/* B. Not Purchased */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.snonpurchased_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.snonpurchased_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.snonpurchased_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.snonpurchased_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.snonpurchased_subtotal)}
                    </td>
                    
                    {/* C. Print and Other Formats (Calculated: Total - Electronic) */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculatePrintFormats(data, 'chinese')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculatePrintFormats(data, 'japanese')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculatePrintFormats(data, 'korean')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculatePrintFormats(data, 'noncjk')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {calculatePrintFormatsTotal(data)}
                    </td>
                    
                    {/* D. Electronic */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.s_etotal_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.s_etotal_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.s_etotal_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.s_etotal_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {calculateElectronicTotal(data)}
                    </td>
                    
                    {/* Total Number of Current Serials */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {formatNumber(data?.stotal_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {formatNumber(data?.stotal_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {formatNumber(data?.stotal_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {formatNumber(data?.stotal_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-100">
                      {calculateCurrentSerialsTotal(data)}
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
