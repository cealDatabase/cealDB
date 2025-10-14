'use client'

import React, { useState } from 'react'
import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { AlertCircle, Play, CheckCircle, XCircle, Loader2, TestTube, Mail, Calendar, Database } from 'lucide-react'
import Link from 'next/link'

interface TestingDashboardProps {
  userRoles: string[]
}

interface TestResult {
  success: boolean
  message?: string
  detail?: string
  results?: any
  error?: string
}

export default function TestingDashboard({ userRoles }: TestingDashboardProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [testEmails, setTestEmails] = useState('')
  const [testMode, setTestMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult | null>(null)
  const [testType, setTestType] = useState<'open' | 'close' | null>(null)

  const handleTestCron = async (action: 'open' | 'close') => {
    setLoading(true)
    setResults(null)
    setTestType(action)

    try {
      const emailList = testEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)

      const response = await fetch('/api/admin/test-cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          year,
          userRoles,
          testMode,
          testEmails: emailList
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Test failed')
      }

      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Test execution failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TestTube className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold">Super Admin Testing Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Test form opening/closing and email broadcasts without waiting for scheduled cron jobs.
        </p>
        <Link href="/admin" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          ← Back to Admin
        </Link>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Testing Environment</h3>
            <p className="text-sm text-yellow-700">
              This dashboard bypasses time-based checks and triggers actions immediately. 
              Use <strong>Test Mode</strong> to avoid sending emails to all users.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Test Configuration
        </h2>

        <div className="space-y-4">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Academic Year *
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2025"
            />
            <p className="text-xs text-gray-500 mt-1">
              Year to test form opening/closing
            </p>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="testMode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="testMode" className="font-medium text-blue-900 cursor-pointer">
                Test Mode (Recommended)
              </label>
              <p className="text-sm text-blue-700 mt-1">
                When enabled, emails are only sent to test users (or super admins if no test emails provided).
                Disable to send to ALL active users in the system.
              </p>
            </div>
          </div>

          {/* Test Email Recipients */}
          {testMode && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Test Email Recipients (Optional)
              </label>
              <textarea
                value={testEmails}
                onChange={(e) => setTestEmails(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="test1@example.com, test2@example.com, test3@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated email addresses. Leave empty to send only to super admins.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Actions Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Test Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Open Forms Test */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Open Forms
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Opens all forms for year {year} and sends broadcast email to recipients
            </p>
            <ul className="text-xs text-green-600 mb-4 space-y-1">
              <li>• Sets is_open_for_editing = true</li>
              <li>• Sends opening notification</li>
              <li>• Logs action to AuditLog</li>
            </ul>
            <Button
              onClick={() => handleTestCron('open')}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading && testType === 'open' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Open Forms
                </>
              )}
            </Button>
          </div>

          {/* Close Forms Test */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Close Forms
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Closes all forms for year {year} and sends closure notification
            </p>
            <ul className="text-xs text-red-600 mb-4 space-y-1">
              <li>• Sets is_open_for_editing = false</li>
              <li>• Verifies all forms closed</li>
              <li>• Sends verified confirmation</li>
            </ul>
            <Button
              onClick={() => handleTestCron('close')}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading && testType === 'close' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Test Close Forms
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className={`border rounded-lg shadow-sm p-6 ${
          results.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            {results.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${
                results.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {results.success ? 'Test Completed Successfully' : 'Test Failed'}
              </h3>
              <p className={`text-sm ${
                results.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {results.message}
              </p>
            </div>
          </div>

          {/* Detailed Results */}
          {results.results && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-3">Test Results:</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Action:</dt>
                  <dd className="font-semibold uppercase">{results.results.action}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Year:</dt>
                  <dd className="font-semibold">{results.results.year}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Test Mode:</dt>
                  <dd className={`font-semibold ${results.results.testMode ? 'text-blue-600' : 'text-orange-600'}`}>
                    {results.results.testMode ? 'ENABLED (Safe)' : 'DISABLED (Production)'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Records Updated:</dt>
                  <dd className="font-semibold">{results.results.recordsUpdated}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Emails Sent:</dt>
                  <dd className="font-semibold flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {results.results.emailsSent}
                  </dd>
                </div>
                {results.results.errors && results.results.errors.length > 0 && (
                  <div>
                    <dt className="text-red-600 font-semibold mb-1">Errors:</dt>
                    <dd>
                      <ul className="list-disc list-inside text-red-600">
                        {results.results.errors.map((error: string, idx: number) => (
                          <li key={idx} className="text-xs">{error}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Error Details */}
          {results.error && (
            <div className="bg-white rounded-lg p-4 border border-red-200 mt-4">
              <h4 className="font-semibold text-red-900 mb-2">Error Details:</h4>
              <p className="text-sm text-red-700 font-mono">{results.error}</p>
              {results.detail && (
                <p className="text-xs text-red-600 mt-2">{results.detail}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* How to Verify Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to Verify Tests:</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span><strong>Check Form Status:</strong> Go to Open/Close Annual Surveys page to see current form status</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span><strong>Check Emails:</strong> Look for emails in test recipients' inboxes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span><strong>Check Database:</strong> Query Library_Year table to verify is_open_for_editing status</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span><strong>Check Logs:</strong> Review server logs in Vercel dashboard for detailed execution logs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">5.</span>
            <span><strong>Check Audit Log:</strong> View AuditLog table for TEST_OPEN_FORMS or TEST_CLOSE_FORMS entries</span>
          </li>
        </ol>
      </div>
    </Container>
  )
}
