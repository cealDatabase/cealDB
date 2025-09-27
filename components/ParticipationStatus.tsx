'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ParticipationData {
  libraryId: number
  libraryName: string
  region: string
  year: number
  libraryYearId: number
  forms: {
    fiscal_support: boolean
    monographic_acquisitions: boolean
    other_holdings: boolean
    personnel_support_fte: boolean
    public_services: boolean
    serials: boolean
    unprocessed_backlog_materials: boolean
    volume_holdings: boolean
    electronic: boolean
    electronic_books: boolean
    espublished: boolean
  }
}

interface ApiResponse {
  success: boolean
  data: ParticipationData[]
  year: number
  totalLibraries: number
  error?: string
}

const formLabels = {
  fiscal_support: 'Fiscal Support',
  monographic_acquisitions: 'Monographic',
  other_holdings: 'Other Holdings',
  personnel_support_fte: 'Personnel Support',
  public_services: 'Public Services',
  serials: 'Serials',
  unprocessed_backlog_materials: 'Backlog Materials',
  volume_holdings: 'Volume Holdings',
  electronic: 'Electronic',
  electronic_books: 'Electronic Books',
  espublished: 'Published'
}

export default function ParticipationStatus() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [participationData, setParticipationData] = useState<ParticipationData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch('/api/participation-status/years')
        const data = await response.json()
        
        if (data.success) {
          setAvailableYears(data.years)
          // Set current year as default if available
          const currentYear = new Date().getFullYear()
          if (data.years.includes(currentYear)) {
            setSelectedYear(currentYear)
          } else if (data.years.length > 0) {
            setSelectedYear(data.years[0])
          }
        } else {
          setError('Failed to load available years')
        }
      } catch (err) {
        setError('Error fetching available years')
        console.error('Error:', err)
      }
    }

    fetchYears()
  }, [])

  // Fetch participation data when year changes
  useEffect(() => {
    if (selectedYear === null) return

    const fetchParticipationData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/participation-status/${selectedYear}`)
        const data: ApiResponse = await response.json()
        
        if (data.success) {
          setParticipationData(data.data)
        } else {
          setError(data.error || 'Failed to load participation data')
        }
      } catch (err) {
        setError('Error fetching participation data')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchParticipationData()
  }, [selectedYear])

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <span className="text-green-600 font-bold text-lg">✓</span>
    ) : (
      <span className="text-red-600 font-bold text-lg">✗</span>
    )
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-6 w-48" />
          {Object.keys(formLabels).map((_, j) => (
            <Skeleton key={j} className="h-6 w-6" />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Participating Libraries Information for Year</span>
            <Select
              value={selectedYear?.toString() || ''}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <LoadingSkeleton />
          ) : participationData.length > 0 ? (
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="text-left p-3 font-semibold min-w-[250px] border-r border-gray-300">Institution</th>
                    {Object.values(formLabels).map((label) => (
                      <th key={label} className="text-center p-2 font-semibold min-w-[90px] border-r border-gray-300 text-xs">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participationData.map((library, index) => {
                    // Determine row color based on completion status
                    const completedForms = Object.values(library.forms).filter(Boolean).length;
                    const totalForms = Object.keys(library.forms).length;
                    const isFullyCompleted = completedForms === totalForms;
                    const hasPartialCompletion = completedForms > 0 && completedForms < totalForms;
                    
                    let rowClass = 'bg-white';
                    if (hasPartialCompletion) {
                      rowClass = 'bg-pink-100'; // Light pink for partial completion
                    } else if (!isFullyCompleted && completedForms === 0) {
                      rowClass = 'bg-red-50'; // Light red for no completion
                    }
                    
                    return (
                      <tr 
                        key={library.libraryYearId} 
                        className={`${rowClass} border-b border-gray-200 hover:bg-gray-50`}
                      >
                        <td className="p-3 font-medium text-blue-600 border-r border-gray-300">
                          {library.libraryName}
                        </td>
                        {Object.keys(formLabels).map((formKey) => (
                          <td key={formKey} className="p-3 text-center border-r border-gray-300">
                            <StatusIcon 
                              status={library.forms[formKey as keyof typeof library.forms]} 
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="mt-4 text-sm text-gray-600 pb-3 px-3">
                Total libraries participating in {selectedYear}: {participationData.length}
              </div>
            </div>
          ) : selectedYear && !loading ? (
            <div className="text-gray-600 text-center py-8">
              No participation data found for year {selectedYear}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
