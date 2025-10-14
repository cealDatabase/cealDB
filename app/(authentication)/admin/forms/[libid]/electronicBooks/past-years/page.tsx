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
        const response = await fetch(`/api/electronicBooks/past-years?libid=${libid}`)
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
        <h1 className="text-3xl font-bold text-gray-900">Electronic Books - Past 5 Years</h1>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 p-4 bg-yellow-50 border-b sticky top-0 z-10">
            Note: Very wide table. Scroll horizontally.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="border border-gray-300 px-2 py-2 text-center" rowSpan={4}>Year</th>
                  <th className="border border-gray-300 px-2 py-2 text-center" colSpan={26}>Titles</th>
                  <th className="border border-gray-300 px-2 py-2 text-center" colSpan={26}>Volumes</th>
                </tr>
                <tr className="bg-teal-600 text-white">
                  <th className="border px-1 py-1 text-center" colSpan={15}>Purchased</th>
                  <th className="border px-1 py-1 text-center" colSpan={5}>Non-Purchased</th>
                  <th className="border px-1 py-1 text-center" colSpan={5}>Subscription</th>
                  <th className="border px-1 py-1 text-center" rowSpan={3}>Titles<br/>Total</th>
                  <th className="border px-1 py-1 text-center" colSpan={15}>Purchased</th>
                  <th className="border px-1 py-1 text-center" colSpan={5}>Non-Purchased</th>
                  <th className="border px-1 py-1 text-center" colSpan={5}>Subscription</th>
                  <th className="border px-1 py-1 text-center" rowSpan={3}>Volumes<br/>Total</th>
                </tr>
                <tr className="bg-teal-500 text-white text-xs">
                  {[...Array(2)].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <th className="border px-1 py-1" colSpan={5}>Held Previous Year</th>
                      <th className="border px-1 py-1" colSpan={5}>Added This Year</th>
                      <th className="border px-1 py-1" colSpan={5}>Total This Year</th>
                      <th className="border px-1 py-1" colSpan={5}></th>
                      <th className="border px-1 py-1" colSpan={5}></th>
                    </React.Fragment>
                  ))}
                </tr>
                <tr className="bg-teal-400 text-white text-xs">
                  {[...Array(10)].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <th className="border px-1">CHN</th>
                      <th className="border px-1">JPN</th>
                      <th className="border px-1">KOR</th>
                      <th className="border px-1">NCJ</th>
                      <th className="border px-1">Total</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pastYearsData.map((yearData, index) => {
                  const d = yearData.data
                  return (
                    <tr key={yearData.year} className={(index % 2 === 0 ? 'bg-white' : 'bg-gray-50') + ' hover:bg-yellow-100'}>
                      <td className="border px-2 py-2 font-semibold text-center bg-yellow-50">{yearData.year}</td>
                      {/* TITLES - Purchased - Held Previous Year */}
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_titles_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_titles_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_titles_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_titles_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_purchased_prev_titles_subtotal)}</td>
                      {/* TITLES - Purchased - Added This Year */}
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_titles_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_titles_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_titles_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_titles_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_purchased_add_titles_subtotal)}</td>
                      {/* TITLES - Purchased - Total This Year */}
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_titles_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_titles_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_titles_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_titles_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_purchased_titles_subtotal)}</td>
                      {/* TITLES - Non-Purchased */}
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_titles_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_titles_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_titles_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_titles_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_nonpurchased_titles_subtotal)}</td>
                      {/* TITLES - Subscription */}
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_titles_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_titles_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_titles_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_titles_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_subscription_titles_subtotal)}</td>
                      {/* TITLES Total (Purchased + Non-Purchased + Subscription) */}
                      <td className="border px-1 text-right bg-green-100 font-bold">
                        {f(d?.ebooks_purchased_titles_subtotal) + f(d?.ebooks_nonpurchased_titles_subtotal) + f(d?.ebooks_subscription_titles_subtotal)}
                      </td>
                      {/* VOLUMES - Purchased - Held Previous Year */}
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_volumes_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_volumes_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_volumes_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_prev_volumes_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_purchased_prev_volumes_subtotal)}</td>
                      {/* VOLUMES - Purchased - Added This Year */}
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_volumes_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_volumes_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_volumes_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_add_volumes_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_purchased_add_volumes_subtotal)}</td>
                      {/* VOLUMES - Purchased - Total This Year */}
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_volumes_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_volumes_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_volumes_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_purchased_volumes_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_purchased_volumes_subtotal)}</td>
                      {/* VOLUMES - Non-Purchased */}
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_volumes_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_volumes_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_volumes_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_nonpurchased_volumes_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_nonpurchased_volumes_subtotal)}</td>
                      {/* VOLUMES - Subscription */}
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_volumes_chinese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_volumes_japanese)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_volumes_korean)}</td>
                      <td className="border px-1 text-right">{f(d?.ebooks_subscription_volumes_noncjk)}</td>
                      <td className="border px-1 text-right bg-blue-50">{f(d?.ebooks_subscription_volumes_subtotal)}</td>
                      {/* VOLUMES Total (Purchased + Non-Purchased + Subscription) */}
                      <td className="border px-1 text-right bg-green-100 font-bold">
                        {f(d?.ebooks_purchased_volumes_subtotal) + f(d?.ebooks_nonpurchased_volumes_subtotal) + f(d?.ebooks_subscription_volumes_subtotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!isLoading && pastYearsData.length === 0 && (
        <div className="text-center py-12 text-gray-500">No data available for the past 5 years.</div>
      )}
    </Container>
  )
}
