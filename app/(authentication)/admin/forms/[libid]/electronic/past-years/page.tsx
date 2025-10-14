"use client"
import React, { useState, useEffect } from "react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { useParams } from "next/navigation"
import { toast } from "sonner"

export default function PastYearsPage() {
  const params = useParams()
  const [pastYearsData, setPastYearsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const libid = params.libid as string

  useEffect(() => {
    async function fetchPastYearsData() {
      try {
        const response = await fetch(`/api/electronic/past-years?libid=${libid}`)
        if (!response.ok) throw new Error("Failed")
        const result = await response.json()
        setPastYearsData(result.pastYears)
      } catch (error) {
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    if (libid) fetchPastYearsData()
  }, [libid])

  const f = (v: any) => v ?? 0

  return (
    <Container>
      <AdminBreadcrumb libraryName="Library" />
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-900">Electronic - Past 5 Years</h1>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 p-4 bg-yellow-50 border-b">Note: Very wide table. Scroll horizontally.</p>
          <table className="w-full border-collapse" style={{fontSize: '10px'}}>
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={4}>Year</th>
                <th className="border border-gray-300 px-1 py-1 text-center" colSpan={60}>Computer Files</th>
                <th className="border border-gray-300 px-1 py-1 text-center" colSpan={16}>Electronic Resources</th>
              </tr>
              <tr className="bg-teal-600 text-white">
                <th className="border border-gray-300 px-1 py-1" colSpan={10}>1.1 Computer Files<br/>(One-Time/Monographic)</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={10}>1.2 Accompanied Computer Files</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={10}>1.3 Computer Files<br/>(One Time Gift)</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={10}>1.4 Total Computer Files</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={10}>1.5 Previous Year<br/>Total Computer Files</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={10}>1.6 Grand Total<br/>Computer Files</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={5}>2.1 Electronic Indexes<br/>and Reference Tools</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={5}>2.2 Electronic<br/>Full Text Database</th>
                <th className="border border-gray-300 px-1 py-1" colSpan={5}>2.3 Total Electronic</th>
                <th className="border border-gray-300 px-1 py-1" rowSpan={3}>3. Total Electronic<br/>Resources Expenditure</th>
              </tr>
              <tr className="bg-teal-500 text-white">
                {[...Array(6)].map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th className="border px-1 py-1" colSpan={2}>CHN</th>
                    <th className="border px-1 py-1" colSpan={2}>JPN</th>
                    <th className="border px-1 py-1" colSpan={2}>KOR</th>
                    <th className="border px-1 py-1" colSpan={2}>NCJ</th>
                    <th className="border px-1 py-1" colSpan={2}>Sub</th>
                  </React.Fragment>
                ))}
                {[...Array(3)].map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th className="border px-1" rowSpan={2}>CHN</th>
                    <th className="border px-1" rowSpan={2}>JPN</th>
                    <th className="border px-1" rowSpan={2}>KOR</th>
                    <th className="border px-1" rowSpan={2}>NCJ</th>
                    <th className="border px-1" rowSpan={2}>Sub</th>
                  </React.Fragment>
                ))}
              </tr>
              <tr className="bg-teal-400 text-white">
                {[...Array(30)].map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th className="border px-1">T</th>
                    <th className="border px-1">CD</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {pastYearsData.map((yearData, index) => {
                const d = yearData.data
                return (
                  <tr key={yearData.year} className={(index % 2 === 0 ? 'bg-white' : 'bg-gray-50') + ' hover:bg-yellow-100'}>
                    <td className="border px-2 py-1 font-semibold text-center bg-yellow-50">{yearData.year}</td>
                    {/* 1.1 One Time */}
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_cd_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_cd_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_cd_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_title_noncjk)}</td>
                    <td className="border px-1 text-right">{f(d?.eonetime_computer_cd_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eonetime_computer_title_subtotal)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eonetime_computer_cd_subtotal)}</td>
                    {/* 1.2 Accompanied */}
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_cd_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_cd_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_cd_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_title_noncjk)}</td>
                    <td className="border px-1 text-right">{f(d?.eaccompanied_computer_cd_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eaccompanied_computer_title_subtotal)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eaccompanied_computer_cd_subtotal)}</td>
                    {/* 1.3 Gift */}
                    <td className="border px-1 text-right">{f(d?.egift_computer_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_cd_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_cd_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_cd_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_title_noncjk)}</td>
                    <td className="border px-1 text-right">{f(d?.egift_computer_cd_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.egift_computer_title_subtotal)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.egift_computer_cd_subtotal)}</td>
                    {/* 1.4 Total Computer */}
                    <td className="border px-1 text-right">{f(d?.etotal_computer_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_cd_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_cd_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_cd_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_title_noncjk)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_computer_cd_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.etotal_computer_title_subtotal)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.etotal_computer_cd_subtotal)}</td>
                    {/* 1.5 Previous */}
                    <td className="border px-1 text-right">{f(d?.eprevious_total_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_cd_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_cd_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_cd_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_title_noncjk)}</td>
                    <td className="border px-1 text-right">{f(d?.eprevious_total_cd_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eprevious_total_title_subtotal)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eprevious_total_cd_subtotal)}</td>
                    {/* 1.6 Grand Total */}
                    <td className="border px-1 text-right">{f(d?.egrand_total_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_cd_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_cd_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_cd_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_title_noncjk)}</td>
                    <td className="border px-1 text-right">{f(d?.egrand_total_cd_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.egrand_total_title_subtotal)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.egrand_total_cd_subtotal)}</td>
                    {/* 2.1 Index */}
                    <td className="border px-1 text-right">{f(d?.eindex_electronic_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.eindex_electronic_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.eindex_electronic_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.eindex_electronic_title_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.eindex_electronic_title_subtotal)}</td>
                    {/* 2.2 Fulltext */}
                    <td className="border px-1 text-right">{f(d?.efulltext_electronic_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.efulltext_electronic_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.efulltext_electronic_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.efulltext_electronic_title_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.efulltext_electronic_title_subtotal)}</td>
                    {/* 2.3 Total Electronic */}
                    <td className="border px-1 text-right">{f(d?.etotal_electronic_title_chinese)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_electronic_title_japanese)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_electronic_title_korean)}</td>
                    <td className="border px-1 text-right">{f(d?.etotal_electronic_title_noncjk)}</td>
                    <td className="border px-1 text-right bg-blue-50">{f(d?.etotal_electronic_title_subtotal)}</td>
                    {/* 3. Total Electronic Resources Expenditure */}
                    <td className="border px-1 text-right bg-green-100 font-bold">{f(d?.etotal_expenditure_grandtotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && pastYearsData.length === 0 && (
        <div className="text-center py-12 text-gray-500">No data available for the past 5 years.</div>
      )}
    </Container>
  )
}
