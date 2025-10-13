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
  vhadded_gross_chinese: number | null;
  vhadded_gross_japanese: number | null;
  vhadded_gross_korean: number | null;
  vhadded_gross_noncjk: number | null;
  vhwithdrawn_chinese: number | null;
  vhwithdrawn_japanese: number | null;
  vhwithdrawn_korean: number | null;
  vhwithdrawn_noncjk: number | null;
}

interface OtherHoldingsData {
  ohmicroform_subtotal: number | null;
  ohcomputer_files_subtotal: number | null;
  ohcarto_graphic_subtotal: number | null;
  ohaudio_subtotal: number | null;
  ohfilm_video_subtotal: number | null;
  ohdvd_subtotal: number | null;
  ohgrandtotal: number | null;
}

interface UnprocessedBacklogData {
  ubchinese: number | null;
  ubjapanese: number | null;
  ubkorean: number | null;
  ubnoncjk: number | null;
  ubtotal: number | null;
}

interface YearData {
  year: number;
  volumeHoldings: VolumeHoldingsData | null;
  ebVolumes: number | null;
  otherHoldings: OtherHoldingsData | null;
  unprocessedBacklog: UnprocessedBacklogData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/unprocessed/past-years?libid=${libid}`)
        
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

  // Calculate Final Physical Volumes Held (from Volume Holdings)
  const calculateFinalPhysical = (data: VolumeHoldingsData | null, language: 'chinese' | 'japanese' | 'korean' | 'noncjk') => {
    if (!data) return 0
    const previous = formatNumber(data[`vhprevious_year_${language}` as keyof VolumeHoldingsData] as number | null)
    const added = formatNumber(data[`vhadded_gross_${language}` as keyof VolumeHoldingsData] as number | null)
    const withdrawn = formatNumber(data[`vhwithdrawn_${language}` as keyof VolumeHoldingsData] as number | null)
    return previous + added - withdrawn
  }

  // Calculate Total Final Physical Volumes
  const calculateFinalPhysicalTotal = (data: VolumeHoldingsData | null) => {
    if (!data) return 0
    return (
      calculateFinalPhysical(data, 'chinese') +
      calculateFinalPhysical(data, 'japanese') +
      calculateFinalPhysical(data, 'korean') +
      calculateFinalPhysical(data, 'noncjk')
    )
  }

  // Calculate Total Other Library Materials (from Other Holdings)
  const calculateTotalOtherMaterials = (data: OtherHoldingsData | null) => {
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

  // Calculate Grand Total Materials Held without E-Books
  const calculateGrandTotalWithoutEBooks = (volumeHoldings: VolumeHoldingsData | null, otherHoldings: OtherHoldingsData | null) => {
    return calculateFinalPhysicalTotal(volumeHoldings) + calculateTotalOtherMaterials(otherHoldings)
  }

  // Calculate Grand Total Materials Held with E-Books
  const calculateGrandTotalWithEBooks = (volumeHoldings: VolumeHoldingsData | null, ebVolumes: number | null, otherHoldings: OtherHoldingsData | null) => {
    return calculateFinalPhysicalTotal(volumeHoldings) + formatNumber(ebVolumes) + calculateTotalOtherMaterials(otherHoldings)
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Unprocessed Backlog Materials - Past 5 Years
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
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Total Physical Volumes Held<br/>(From Table 1, Holding of East Asian Materials)</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Total Electronic Books Volumes Held</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Total Other Library Materials<br/>(From Table 4, Holdings of Other East Asian Materials)</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Grand Total Materials Held<br/>without E-Books</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Grand Total Materials Held<br/>with E-Books</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Number of Unprocessed/Backlog Materials</th>
              </tr>
              <tr className="bg-teal-600 text-white text-xs">
                {/* Total Physical Volumes Held */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Number of Unprocessed/Backlog Materials */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {pastYearsData.map((yearData, index) => {
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
                    
                    {/* Total Physical Volumes Held (Calculated from Volume Holdings) */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinalPhysical(yearData.volumeHoldings, 'chinese')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinalPhysical(yearData.volumeHoldings, 'japanese')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinalPhysical(yearData.volumeHoldings, 'korean')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {calculateFinalPhysical(yearData.volumeHoldings, 'noncjk')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {calculateFinalPhysicalTotal(yearData.volumeHoldings)}
                    </td>
                    
                    {/* Total Electronic Books Volumes Held */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-purple-50">
                      {formatNumber(yearData.ebVolumes)}
                    </td>
                    
                    {/* Total Other Library Materials (from Other Holdings) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-orange-50">
                      {calculateTotalOtherMaterials(yearData.otherHoldings)}
                    </td>
                    
                    {/* Grand Total Materials Held without E-Books (Calculated) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-50">
                      {calculateGrandTotalWithoutEBooks(yearData.volumeHoldings, yearData.otherHoldings)}
                    </td>
                    
                    {/* Grand Total Materials Held with E-Books (Calculated) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-100">
                      {calculateGrandTotalWithEBooks(yearData.volumeHoldings, yearData.ebVolumes, yearData.otherHoldings)}
                    </td>
                    
                    {/* Number of Unprocessed/Backlog Materials */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(yearData.unprocessedBacklog?.ubchinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(yearData.unprocessedBacklog?.ubjapanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(yearData.unprocessedBacklog?.ubkorean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(yearData.unprocessedBacklog?.ubnoncjk)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(yearData.unprocessedBacklog?.ubtotal)}
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
