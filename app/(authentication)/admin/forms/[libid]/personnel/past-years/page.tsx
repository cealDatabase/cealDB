"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface PersonnelSupportData {
  psfprofessional_chinese: number | null;
  psfprofessional_japanese: number | null;
  psfprofessional_korean: number | null;
  psfprofessional_eastasian: number | null;
  psfprofessional_subtotal: number | null;
  psfsupport_staff_chinese: number | null;
  psfsupport_staff_japanese: number | null;
  psfsupport_staff_korean: number | null;
  psfsupport_staff_eastasian: number | null;
  psfsupport_staff_subtotal: number | null;
  psfstudent_assistants_chinese: number | null;
  psfstudent_assistants_japanese: number | null;
  psfstudent_assistants_korean: number | null;
  psfstudent_assistants_eastasian: number | null;
  psfstudent_assistants_subtotal: number | null;
  psfothers: number | null;
  psfosacquisition: boolean | null;
  psfosprocessing: boolean | null;
  psftotal: number | null;
}

interface YearData {
  year: number;
  data: PersonnelSupportData | null;
}

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/personnel/past-years?libid=${libid}`)
        
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
    if (value === null || value === undefined) return "0"
    // Round to 4 decimal places to fix floating point precision
    const rounded = Math.round(Number(value) * 10000) / 10000
    // Convert to string with up to 4 decimals, then remove trailing zeros
    return rounded.toFixed(4).replace(/\.?0+$/, '')
  }

  const formatBoolean = (value: boolean | null | undefined) => {
    if (value === null || value === undefined) return "No"
    return value ? "Yes" : "No"
  }

  // Calculate Total (Professional + Support Staff + Student Assistants)
  const calculateTotal = (data: PersonnelSupportData | null) => {
    if (!data) return 0
    const professional = Number(data.psfprofessional_subtotal) || 0
    const supportStaff = Number(data.psfsupport_staff_subtotal) || 0
    const studentAssistants = Number(data.psfstudent_assistants_subtotal) || 0
    return professional + supportStaff + studentAssistants
  }

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Personnel Support - Past 5 Years
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
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Professional Staff, FTE</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Support Staff, FTE</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={5}>Student Assistant, FTE</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={1}>Others FTE</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" colSpan={2}>Outsourcing</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold" rowSpan={2}>Total</th>
              </tr>
              <tr className="bg-teal-600 text-white text-xs">
                {/* Professional Staff */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">East Asian</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Support Staff */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">East Asian</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Student Assistant */}
                <th className="border border-gray-300 px-2 py-1">CHN</th>
                <th className="border border-gray-300 px-2 py-1">JPN</th>
                <th className="border border-gray-300 px-2 py-1">KOR</th>
                <th className="border border-gray-300 px-2 py-1">East Asian</th>
                <th className="border border-gray-300 px-2 py-1">Total</th>
                
                {/* Others FTE */}
                <th className="border border-gray-300 px-2 py-1">Others</th>
                
                {/* Outsourcing */}
                <th className="border border-gray-300 px-2 py-1">Acquisitions</th>
                <th className="border border-gray-300 px-2 py-1">Processing</th>
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
                    
                    {/* Professional Staff */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfprofessional_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfprofessional_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfprofessional_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfprofessional_eastasian)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.psfprofessional_subtotal)}
                    </td>
                    
                    {/* Support Staff */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfsupport_staff_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfsupport_staff_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfsupport_staff_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfsupport_staff_eastasian)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.psfsupport_staff_subtotal)}
                    </td>
                    
                    {/* Student Assistant */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfstudent_assistants_chinese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfstudent_assistants_japanese)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfstudent_assistants_korean)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfstudent_assistants_eastasian)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-blue-50">
                      {formatNumber(data?.psfstudent_assistants_subtotal)}
                    </td>
                    
                    {/* Others FTE */}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatNumber(data?.psfothers)}
                    </td>
                    
                    {/* Outsourcing (Boolean values) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-medium">
                      {formatBoolean(data?.psfosacquisition)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-medium">
                      {formatBoolean(data?.psfosprocessing)}
                    </td>
                    
                    {/* Total (Calculated: Professional + Support + Student) */}
                    <td className="border border-gray-300 px-2 py-2 text-center font-bold bg-green-100">
                      {formatNumber(calculateTotal(data))}
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
