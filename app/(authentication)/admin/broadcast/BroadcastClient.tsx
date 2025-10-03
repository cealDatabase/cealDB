'use client'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Send, CheckCircle, AlertCircle, Loader2, SlashIcon } from 'lucide-react'
import Link from 'next/link'
import { LocalDateTime } from '@/components/LocalDateTime'
import { getSurveyDates, formatSurveyDate } from '@/lib/surveyDates'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

interface FormSession {
  year: number;
  totalLibraries: number;
  openLibraries: number;
  closedLibraries: number;
  lastUpdated: string;
  libraries: {
    id: number;
    libraryId: number | null;
    libraryName: string | null;
    isOpen: boolean | null;
    isActive: boolean | null;
    adminNotes: string | null;
  }[];
}

interface BroadcastClientProps {
  userRoles: string[] | null;
}

/**
 * Client Component for Broadcast Management
 * Only checks for role ID 1 (super admin) - NO userId needed
 * Reference: https://resend.com/blog/broadcast-api
 */
export default function BroadcastClient({ userRoles }: BroadcastClientProps) {
  const [step, setStep] = useState<'form' | 'preview' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [year, setYear] = useState(new Date().getFullYear());
  const [openingDate, setOpeningDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  
  // Current session data
  const [currentSession, setCurrentSession] = useState<FormSession | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Set default dates when component mounts or year changes
  useEffect(() => {
    const defaultDates = getSurveyDates(year);
    setOpeningDate(defaultDates.openingDate.toISOString().split('T')[0]);
    setClosingDate(defaultDates.closingDate.toISOString().split('T')[0]);
  }, [year]);

  // Check current session on mount
  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      const response = await fetch('/api/admin/form-session');
      const data = await response.json();
      
      if (data.session) {
        setCurrentSession(data.session);
        setHasActiveSession(data.isOpen && data.session.openLibraries > 0);
      }
    } catch (error) {
      console.error('Failed to check current session:', error);
    }
  };

  const previewEmail = async () => {
    if (!openingDate) {
      setError('Please select an opening date');
      return;
    }

    if (!closingDate) {
      setError('Please select a closing date');
      return;
    }

    if (new Date(closingDate) <= new Date(openingDate)) {
      setError('Closing date must be after opening date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/broadcast?year=${year}&openingDate=${openingDate}&closingDate=${closingDate}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to generate email preview');
      }

      const data = await response.json();
      setEmailTemplate(data.template);
      setStep('preview');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to preview email');
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!userRoles) {
      setError('User roles not found. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send broadcast using Resend Broadcast API - no userId needed!
      // Reference: https://resend.com/blog/broadcast-api
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          openingDate,
          closingDate,
          userRoles // Only need roles for authorization check
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send broadcast');
      }

      const data = await response.json();
      console.log('✅ Broadcast sent successfully:', data);
      setStep('success');
      
      // Refresh session data
      await checkCurrentSession();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!currentSession || !userRoles) return;

    const confirmed = window.confirm(
      `Are you sure you want to close all forms for year ${currentSession.year}? This will prevent all libraries from editing their data.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/form-session', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: currentSession.year,
          action: 'close',
          userRoles // Only need roles for authorization
        })
      });

      if (!response.ok) {
        throw new Error('Failed to close forms');
      }

      await checkCurrentSession();
      alert('All forms closed successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to close forms');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setYear(new Date().getFullYear());
    setOpeningDate('');
    setClosingDate('');
    setEmailTemplate('');
    setError(null);
  };

  // Check if user is super admin (role ID 1)
  const isSuperAdmin = userRoles && userRoles.includes('1');

  if (!userRoles || !isSuperAdmin) {
    return (
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Access Denied</h2>
            </div>
            <p className="text-red-800 mb-4">
              Super admin privileges (Role ID 1) are required to access the broadcast management feature.
            </p>
            <Link href="/admin/superguide">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Guide
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="my-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="no-underline">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin" className="no-underline">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/superguide" className="no-underline">Super Admin Tools</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              
              <BreadcrumbItem>
                <BreadcrumbPage>Open/Close Annual Surveys</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">Open/Close Annual Surveys</h1>
          <p className="text-gray-600">
            Manage form access for CEAL member libraries and send broadcast notifications via Resend.
          </p>
        </div>

        {/* Current Session Status */}
        {currentSession && (
          <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Form Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Year</div>
                <div className="text-2xl font-bold">{currentSession.year}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Total Libraries</div>
                <div className="text-2xl font-bold">{currentSession.totalLibraries}</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-green-600">Open for Editing</div>
                <div className="text-2xl font-bold text-green-800">
                  {currentSession.openLibraries}
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="text-sm text-red-600">Closed</div>
                <div className="text-2xl font-bold text-red-800">
                  {currentSession.closedLibraries}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Last Updated:</strong> <LocalDateTime dateString={currentSession.lastUpdated} />
            </div>
            {hasActiveSession && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  onClick={closeSession}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    'Close All Forms'
                  )}
                </Button>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Warning: This will immediately prevent all libraries from editing their data.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {/* Step 1: Form */}
          {step === 'form' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Create New Form Session</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Academic Year *
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2020"
                    max="2030"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Opening Date *
                  </label>
                  <input
                    type="date"
                    value={openingDate}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Closing Date *
                  </label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={openingDate || undefined}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Automated Schedule Process:
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Opening Date:</strong> Forms will automatically open on the selected date. Members will receive broadcast email when forms open.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Closing Date:</strong> Forms will automatically close at 11:59 PM Pacific Time on the selected date.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Super Admin Notification:</strong> You will receive an email notification 30 seconds after forms automatically close, confirming all forms are closed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>No Manual Action Required:</strong> Everything happens automatically based on your schedule.</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={previewEmail}
                  disabled={loading || !openingDate || !closingDate}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Preview Email & Continue
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </>
                  )}
                </Button>
                <Link href="/admin/superguide">
                  <Button className="bg-gray-500 hover:bg-gray-600">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Email Preview */}
          {step === 'preview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  This email is preview only. You can not edit it. It will be sent to all members in your CEAL broadcast audience.
                </p>
              </div>

              <div className="border border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto mb-6 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: emailTemplate }} />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep('confirm')}
                  className="flex-1"
                >
                  Approve & Continue
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
                <Button 
                  onClick={() => setStep('form')}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {step === 'confirm' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Final Confirmation</h2>
              
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
                <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  ⚠️ Review Schedule Details
                </h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>
                      <strong>Opening:</strong> {
                        new Date(openingDate)
                          .toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>
                      <strong>Closing:</strong> {
                        new Date(closingDate)
                          .toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      } at <strong>11:59 PM Pacific Time</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>Forms will <strong>automatically open</strong> on the opening date and broadcast email will be sent to all CEAL members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>Forms will <strong>automatically close</strong> at 11:59 PM PT on closing date - no manual action required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>Super admins will receive confirmation email 30 seconds after automatic closure</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={sendBroadcast}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Schedule...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Confirm & Create Schedule
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setStep('preview')}
                  disabled={loading}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  Schedule Created Successfully!
                </h2>
                <p className="text-gray-700 text-lg mb-2">
                  Form schedule for <strong>{year}</strong> has been created.
                </p>
                <p className="text-gray-600">
                  Forms will automatically open on the scheduled date, and members will receive notification emails at that time.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-2">What Happens Next:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Forms will automatically open on <strong>{new Date(openingDate).toLocaleDateString()}</strong></li>
                  <li>• Broadcast email sent to members when forms open</li>
                  <li>• Forms will automatically close on <strong>{new Date(closingDate).toLocaleDateString()}</strong> at 11:59 PM PT</li>
                  <li>• You will receive confirmation email 30 seconds after automatic closure</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href="/admin/superguide">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Return to Admin Guide
                  </Button>
                </Link>
                <Button 
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Create Another Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
