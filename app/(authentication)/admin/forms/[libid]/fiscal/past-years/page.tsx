"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface FiscalSupportData {
  fschinese_appropriations_monographic: number | null;
  fschinese_appropriations_serial: number | null;
  fschinese_appropriations_other_material: number | null;
  fschinese_appropriations_electronic: number | null;
  fschinese_appropriations_subtotal: number | null;
  fsjapanese_appropriations_monographic: number | null;
  fsjapanese_appropriations_serial: number | null;
  fsjapanese_appropriations_other_material: number | null;
  fsjapanese_appropriations_electronic: number | null;
  fsjapanese_appropriations_subtotal: number | null;
  fskorean_appropriations_monographic: number | null;
  fskorean_appropriations_serial: number | null;
  fskorean_appropriations_other_material: number | null;
  fskorean_appropriations_electronic: number | null;
  fskorean_appropriations_subtotal: number | null;
  fsnoncjk_appropriations_monographic: number | null;
  fsnoncjk_appropriations_serial: number | null;
  fsnoncjk_appropriations_other_material: number | null;
  fsnoncjk_appropriations_electronic: number | null;
  fsnoncjk_appropriations_subtotal: number | null;
  fstotal_appropriations: number | null;
  fsendowments_chinese: number | null;
  fsendowments_japanese: number | null;
  fsendowments_korean: number | null;
  fsendowments_noncjk: number | null;
  fsendowments_subtotal: number | null;
  fsgrants_chinese: number | null;
  fsgrants_japanese: number | null;
  fsgrants_korean: number | null;
  fsgrants_noncjk: number | null;
  fsgrants_subtotal: number | null;
  fseast_asian_program_support_chinese: number | null;
  fseast_asian_program_support_japanese: number | null;
  fseast_asian_program_support_korean: number | null;
  fseast_asian_program_support_noncjk: number | null;
  fseast_asian_program_support_subtotal: number | null;
  fstotal_acquisition_budget: number | null;
}

interface YearData {
  year: number;
  data: FiscalSupportData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/fiscal/past-years?libid=${libid}`)
        
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
    if (value === null || value === undefined) return "$0.00"
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Calculate Total Acquisitions (sum of all category totals)
  const calculateTotalAcquisitions = (data: FiscalSupportData | null) => {
    if (!data) return 0
    const appropriations = Number(data.fstotal_appropriations) || 0
    const endowments = Number(data.fsendowments_subtotal) || 0
    const grants = Number(data.fsgrants_subtotal) || 0
    const programSupport = Number(data.fseast_asian_program_support_subtotal) || 0
    return appropriations + endowments + grants + programSupport
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Fiscal Support - Past 5 Years
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading past years data...</div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" rowSpan={3}>Year</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={21}>Appropriations (US$)</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={5}>Endowments (US$)</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={5}>Grants (US$)</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" colSpan={5}>East Asian Program Support</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold" rowSpan={3}>Total Acquisitions ($US)</th>
              </tr>
              <tr className="bg-teal-600 text-white">
                {/* Appropriations - Language Groups */}
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" colSpan={5}>Chinese</th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" colSpan={5}>Japanese</th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" colSpan={5}>Korean</th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" colSpan={5}>Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1 text-center font-medium" rowSpan={2}>Total<br/>Appropriations<br/>($US)</th>
                
                {/* Endowments */}
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>CHN</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>JPN</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>KOR</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>Total</th>
                
                {/* Grants */}
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>CHN</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>JPN</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>KOR</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>Total</th>
                
                {/* East Asian Program Support */}
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>CHN</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>JPN</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>KOR</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>Non-CJK</th>
                <th className="border border-gray-300 px-2 py-1" rowSpan={2}>Total</th>
              </tr>
              <tr className="bg-teal-500 text-white">
                {/* Appropriations - Chinese */}
                <th className="border border-gray-300 px-1 py-1">Mono</th>
                <th className="border border-gray-300 px-1 py-1">Serial</th>
                <th className="border border-gray-300 px-1 py-1">Other</th>
                <th className="border border-gray-300 px-1 py-1">Elec</th>
                <th className="border border-gray-300 px-1 py-1">Total</th>
                
                {/* Appropriations - Japanese */}
                <th className="border border-gray-300 px-1 py-1">Mono</th>
                <th className="border border-gray-300 px-1 py-1">Serial</th>
                <th className="border border-gray-300 px-1 py-1">Other</th>
                <th className="border border-gray-300 px-1 py-1">Elec</th>
                <th className="border border-gray-300 px-1 py-1">Total</th>
                
                {/* Appropriations - Korean */}
                <th className="border border-gray-300 px-1 py-1">Mono</th>
                <th className="border border-gray-300 px-1 py-1">Serial</th>
                <th className="border border-gray-300 px-1 py-1">Other</th>
                <th className="border border-gray-300 px-1 py-1">Elec</th>
                <th className="border border-gray-300 px-1 py-1">Total</th>
                
                {/* Appropriations - Non-CJK */}
                <th className="border border-gray-300 px-1 py-1">Mono</th>
                <th className="border border-gray-300 px-1 py-1">Serial</th>
                <th className="border border-gray-300 px-1 py-1">Other</th>
                <th className="border border-gray-300 px-1 py-1">Elec</th>
                <th className="border border-gray-300 px-1 py-1">Total</th>
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
                    <td className="border border-gray-300 px-2 py-2 font-semibold text-center bg-yellow-50">
                      {yearData.year}
                    </td>
                    
                    {/* Appropriations - Chinese */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fschinese_appropriations_monographic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fschinese_appropriations_serial)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fschinese_appropriations_other_material)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fschinese_appropriations_electronic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fschinese_appropriations_subtotal)}
                    </td>
                    
                    {/* Appropriations - Japanese */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsjapanese_appropriations_monographic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsjapanese_appropriations_serial)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsjapanese_appropriations_other_material)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsjapanese_appropriations_electronic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fsjapanese_appropriations_subtotal)}
                    </td>
                    
                    {/* Appropriations - Korean */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fskorean_appropriations_monographic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fskorean_appropriations_serial)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fskorean_appropriations_other_material)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fskorean_appropriations_electronic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fskorean_appropriations_subtotal)}
                    </td>
                    
                    {/* Appropriations - Non-CJK */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsnoncjk_appropriations_monographic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsnoncjk_appropriations_serial)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsnoncjk_appropriations_other_material)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsnoncjk_appropriations_electronic)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fsnoncjk_appropriations_subtotal)}
                    </td>
                    
                    {/* Total Appropriations */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-bold bg-purple-50">
                      {formatNumber(data?.fstotal_appropriations)}
                    </td>
                    
                    {/* Endowments */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsendowments_chinese)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsendowments_japanese)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsendowments_korean)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsendowments_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fsendowments_subtotal)}
                    </td>
                    
                    {/* Grants */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsgrants_chinese)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsgrants_japanese)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsgrants_korean)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fsgrants_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fsgrants_subtotal)}
                    </td>
                    
                    {/* East Asian Program Support */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fseast_asian_program_support_chinese)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fseast_asian_program_support_japanese)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fseast_asian_program_support_korean)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs">
                      {formatNumber(data?.fseast_asian_program_support_noncjk)}
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-semibold bg-blue-50">
                      {formatNumber(data?.fseast_asian_program_support_subtotal)}
                    </td>
                    
                    {/* Total Acquisitions (Calculated) */}
                    <td className="border border-gray-300 px-1 py-1 text-right text-xs font-bold bg-green-100">
                      {formatNumber(calculateTotalAcquisitions(data))}
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
