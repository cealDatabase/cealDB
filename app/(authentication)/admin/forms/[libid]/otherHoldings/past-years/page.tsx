"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface OtherHoldingsData {
  ohmicroform_chinese: number | null;
  ohmicroform_japanese: number | null;
  ohmicroform_korean: number | null;
  ohmicroform_noncjk: number | null;
  ohmicroform_subtotal: number | null;
  ohcomputer_files_chinese: number | null;
  ohcomputer_files_japanese: number | null;
  ohcomputer_files_korean: number | null;
  ohcomputer_files_noncjk: number | null;
  ohcomputer_files_subtotal: number | null;
  ohcarto_graphic_chinese: number | null;
  ohcarto_graphic_japanese: number | null;
  ohcarto_graphic_korean: number | null;
  ohcarto_graphic_noncjk: number | null;
  ohcarto_graphic_subtotal: number | null;
  ohaudio_chinese: number | null;
  ohaudio_japanese: number | null;
  ohaudio_korean: number | null;
  ohaudio_noncjk: number | null;
  ohaudio_subtotal: number | null;
  ohfilm_video_chinese: number | null;
  ohfilm_video_japanese: number | null;
  ohfilm_video_korean: number | null;
  ohfilm_video_noncjk: number | null;
  ohfilm_video_subtotal: number | null;
  ohdvd_chinese: number | null;
  ohdvd_japanese: number | null;
  ohdvd_korean: number | null;
  ohdvd_noncjk: number | null;
  ohdvd_subtotal: number | null;
  ohgrandtotal: number | null;
}

interface YearData {
  year: number;
  data: OtherHoldingsData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/otherHoldings/past-years?libid=${libid}`)
        
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

  // Calculate Total Other Library Materials (sum of all category totals)
  const calculateGrandTotal = (data: OtherHoldingsData | null) => {
    if (!data) return 0
    return (
      formatNumber(data.ohmicroform_subtotal) +
      formatNumber(data.ohcomputer_files_subtotal) +
      formatNumber(data.ohcarto_graphic_subtotal) +
      formatNumber(data.ohaudio_subtotal) +
      formatNumber(data.ohfilm_video_subtotal) +
      formatNumber(data.ohdvd_subtotal)
    )
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Holdings of Other Materials - Past 5 Years
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
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Microform</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Computer Files</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={20}>Audiovisual Materials</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={3}>Total Other Library Materials</th>
              </tr>
              <tr className="bg-teal-600 text-white">
                {/* Microform headers */}
                <th className="border border-gray-300 px-2 py-1 text-xs" colSpan={5}></th>
                {/* Computer Files headers */}
                <th className="border border-gray-300 px-2 py-1 text-xs" colSpan={5}></th>
                {/* Audiovisual Materials subcategories */}
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Cartographic/Graphic Materials</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Audio</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>Film and Video</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-medium" colSpan={5}>DVD</th>
              </tr>
              <tr className="bg-teal-500 text-white text-xs">
                {/* Microform languages */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Computer Files languages */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Cartographic/Graphic Materials languages */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Audio languages */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Film and Video languages */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* DVD languages */}
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
                    
                    {/* Microform */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohmicroform_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohmicroform_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohmicroform_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohmicroform_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.ohmicroform_subtotal)}
                    </td>
                    
                    {/* Computer Files */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcomputer_files_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcomputer_files_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcomputer_files_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcomputer_files_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.ohcomputer_files_subtotal)}
                    </td>
                    
                    {/* Cartographic/Graphic Materials */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcarto_graphic_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcarto_graphic_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcarto_graphic_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohcarto_graphic_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.ohcarto_graphic_subtotal)}
                    </td>
                    
                    {/* Audio */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohaudio_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohaudio_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohaudio_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohaudio_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.ohaudio_subtotal)}
                    </td>
                    
                    {/* Film and Video */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohfilm_video_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohfilm_video_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohfilm_video_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohfilm_video_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.ohfilm_video_subtotal)}
                    </td>
                    
                    {/* DVD */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohdvd_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohdvd_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohdvd_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.ohdvd_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.ohdvd_subtotal)}
                    </td>
                    
                    {/* Total Other Library Materials (Calculated) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-100">
                      {calculateGrandTotal(data)}
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
