'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import Link from 'next/link'
import { formatSimpleDate, formatDateWithWeekday } from '@/lib/dateFormatting'

interface SurveySession {
  id: number
  academicYear: number
  openingDate: string
  closingDate: string
  isOpen: boolean
  notifiedOnOpen: boolean
  notifiedOnClose: boolean
  createdAt: string
  updatedAt: string
}

interface FormStatus {
  year: number
  totalLibraries: number
  openLibraries: number
  closedLibraries: number
  lastUpdated: string
}

export default function SurveySchedulePage() {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear())
  const [openingDate, setOpeningDate] = useState('')
  const [closingDate, setClosingDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<SurveySession[]>([])
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch existing sessions on mount
  useEffect(() => {
    fetchSessions()
    fetchFormStatus()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/survey-sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const fetchFormStatus = async () => {
    try {
      const response = await fetch(`/api/admin/form-status?year=${academicYear}`)
      if (response.ok) {
        const data = await response.json()
        setFormStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch form status:', error)
    }
  }

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate dates are filled
    if (!openingDate || !closingDate) {
      setMessage({ type: 'error', text: 'Please fill in all fields before previewing.' })
      return
    }
    setMessage(null)
    setShowPreview(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)
    setShowPreview(false)

    try {
      // Parse the date components and create Pacific Time dates
      const [openYear, openMonth, openDay] = openingDate.split('-').map(Number)
      const [closeYear, closeMonth, closeDay] = closingDate.split('-').map(Number)
      
      // Convert to Pacific Time: 12:00 AM Pacific = 8:00 AM UTC
      const openDateTime = new Date(Date.UTC(openYear, openMonth - 1, openDay, 8, 0, 0)).toISOString()
      // Convert to Pacific Time: 11:59 PM Pacific on day D = 7:59 AM UTC on day D+1
      const closeDateTime = new Date(Date.UTC(closeYear, closeMonth - 1, closeDay + 1, 7, 59, 0)).toISOString()

      const response = await fetch('/api/admin/survey-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          academicYear,
          openingDate: openDateTime,
          closingDate: closeDateTime
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchSessions()
        fetchFormStatus()
        // Reset form
        setOpeningDate('')
        setClosingDate('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create schedule' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (year: number) => {
    if (!confirm(`Are you sure you want to delete the schedule for year ${year}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/survey-sessions?year=${year}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Schedule for year ${year} deleted successfully` })
        fetchSessions()
        fetchFormStatus()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to delete schedule' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
  }

  const formatDate = (dateString: string) => {
    return formatSimpleDate(dateString)
  }

  const getSessionStatus = (session: SurveySession) => {
    const now = new Date()
    const openDate = new Date(session.openingDate)
    const closeDate = new Date(session.closingDate)

    if (now < openDate) {
      return { label: '🗓️ Scheduled', color: 'bg-blue-100 text-blue-800' }
    } else if (now >= openDate && now < closeDate && session.isOpen) {
      return { label: '🟢 Forms Opened', color: 'bg-green-100 text-green-800' }
    } else if (now >= closeDate || !session.isOpen) {
      return { label: '🔴 Forms Closed', color: 'bg-red-100 text-red-800' }
    }
    return { label: '🗓️ Scheduled', color: 'bg-blue-100 text-blue-800' }
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Link href="/admin/superguide" className="text-blue-600 hover:text-blue-800">
          ← Back to Admin Guide
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Open/Close Annual Surveys</h1>
        <p className="text-gray-600">
          Manage form access for CEAL member libraries and send broadcast notifications via Resend.
        </p>
      </div>

      {/* Current Form Status */}
      {formStatus && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📊 Current Form Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Academic Year</div>
              <div className="text-2xl font-bold">{formStatus.year}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600">Total Libraries</div>
              <div className="text-2xl font-bold">{formStatus.totalLibraries}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-green-700">🟢 Open for Editing</div>
              <div className="text-2xl font-bold text-green-700">{formStatus.openLibraries}</div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-sm text-red-700">🔴 Closed</div>
              <div className="text-2xl font-bold text-red-700">{formStatus.closedLibraries}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Last Updated: {formStatus.lastUpdated}
          </div>
        </div>
      )}

      {/* Create New Session */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📅 Create New Form Session</h2>
        
        {message && (
          <div className={`mb-4 p-4 rounded ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePreview} className="space-y-4">
          {/* Horizontal layout for all three fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <input
                type="number"
                value={academicYear}
                onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={2000}
                max={2100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Date * <span className="text-xs text-gray-500">(12:00 AM Pacific)</span>
              </label>
              <input
                type="date"
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Date * <span className="text-xs text-gray-500">(11:59 PM Pacific)</span>
              </label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            Preview Email & Continue →
          </Button>
        </form>
      </div>

      {/* Existing Sessions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Scheduled Sessions</h2>
        
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No scheduled sessions yet. Create one above to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opening Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closing Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {session.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(session.openingDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(session.closingDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const status = getSessionStatus(session)
                        return (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteSession(session.academicYear)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">ℹ️ How This Works</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Vercel Cron:</strong> Runs every 12 hours to check for scheduled openings and closings</li>
          <li>• <strong>Automatic Updates:</strong> Library_Year records are automatically updated when dates are reached</li>
          <li>• <strong>Email Notifications:</strong> All active users receive notifications via Resend when forms open or close</li>
          <li>• <strong>Admin Alerts:</strong> Super admins receive separate notifications with system statistics</li>
          <li>• <strong>Audit Trail:</strong> All actions are logged in the audit log for tracking and compliance</li>
        </ul>
      </div>

      {/* Email Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Forms Opened Email Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">📧 Member Notification: Forms Opened</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2"><strong>To:</strong> All Active CEAL Members</p>
                    <p className="text-sm text-gray-600 mb-4"><strong>Subject:</strong> 🔓 CEAL Statistics Database Forms Open for {academicYear} - Action Required</p>
                    
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h5 className="font-bold text-lg mb-2">CEAL Statistics Database Forms Are Now Open</h5>
                      <p className="mb-3">The data collection forms for academic year <strong>{academicYear}</strong> are now open for submission.</p>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                        <p className="text-sm"><strong>📅 Submission Period:</strong></p>
                        <p className="text-sm"><strong>Opens:</strong> {openingDate ? `${formatSimpleDate(openingDate)} at 12:00 AM Pacific` : 'Not set'}</p>
                        <p className="text-sm"><strong>Closes:</strong> {closingDate ? `${formatSimpleDate(closingDate)} at 11:59 PM Pacific` : 'Not set'}</p>
                      </div>
                      
                      <p className="mb-3 text-sm">Please submit your library's statistical data before the closing date. You can access the forms by signing in to your account.</p>
                      
                      <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Access Forms →</button>
                    </div>
                  </div>
                </div>

                {/* Admin Alert Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">📧 Super Admin Alert</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2"><strong>To:</strong> Super Admins Only</p>
                    <p className="text-sm text-gray-600 mb-4"><strong>Subject:</strong> ✅ Admin Alert: Forms Automatically Opened for {academicYear}</p>
                    
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <h5 className="font-bold text-lg mb-2">System Action: Forms Opened</h5>
                      <p className="mb-3 text-sm">The automated system has successfully opened forms for academic year <strong>{academicYear}</strong>.</p>
                      
                      <div className="bg-green-50 p-3 rounded mb-3">
                        <p className="text-sm"><strong>📊 Statistics:</strong></p>
                        <p className="text-sm">• Libraries Updated: {formStatus?.totalLibraries || 0}</p>
                        <p className="text-sm">• Notification Emails Sent: ~{formStatus?.totalLibraries || 0}</p>
                        <p className="text-sm">• Opening Date: {openingDate ? `${formatSimpleDate(openingDate)} at 12:00 AM Pacific` : 'Not set'}</p>
                        <p className="text-sm">• Closing Date: {closingDate ? `${formatSimpleDate(closingDate)} at 11:59 PM Pacific` : 'Not set'}</p>
                      </div>
                      
                      <p className="text-sm text-gray-600">No manual action required. The system will automatically close forms on the scheduled date.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back to Edit
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating Schedule...' : 'Confirm & Create Schedule'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
