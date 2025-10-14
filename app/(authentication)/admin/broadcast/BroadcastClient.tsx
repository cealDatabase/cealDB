'use client'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Send, CheckCircle, AlertCircle, Loader2, SlashIcon } from 'lucide-react'
import Link from 'next/link'
import { LocalDateTime } from '@/components/LocalDateTime'
import { getSurveyDates, formatSurveyDate } from '@/lib/surveyDates'
import SessionQueue from '@/components/SessionQueue'
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
  const [step, setStep] = useState<'preview' | 'confirm' | 'success'>('preview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email and session data
  const [emailTemplate, setEmailTemplate] = useState('');
  const [scheduledSession, setScheduledSession] = useState<any>(null);
  
  // Current session data
  const [currentSession, setCurrentSession] = useState<FormSession | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Check current session and scheduled sessions on mount
  useEffect(() => {
    checkCurrentSession();
    loadScheduledSession();
  }, []);

  const loadScheduledSession = async () => {
    try {
      // Load scheduled session from Session Queue (reads from Library_Year)
      const response = await fetch('/api/admin/pending-sessions');
      const data = await response.json();
      
      if (data.success && data.sessions && data.sessions.length > 0) {
        // Get the first scheduled or active session
        const session = data.sessions[0];
        setScheduledSession(session);
        
        // Auto-preview email for this session
        if (session.opening_date && session.closing_date) {
          await previewEmailForSession(session);
        }
      }
    } catch (error) {
      console.error('Failed to load scheduled session:', error);
    }
  };

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

  const previewEmailForSession = async (session: any) => {
    setLoading(true);
    setError(null);

    try {
      const openingDate = new Date(session.opening_date).toISOString().split('T')[0];
      const closingDate = new Date(session.closing_date).toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/admin/broadcast?year=${session.year}&openingDate=${openingDate}&closingDate=${closingDate}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to generate email preview');
      }

      const data = await response.json();
      setEmailTemplate(data.template);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to preview email');
    } finally {
      setLoading(false);
    }
  };

  const refreshEmailPreview = () => {
    if (scheduledSession) {
      previewEmailForSession(scheduledSession);
    }
  };

  const sendBroadcast = async () => {
    if (!userRoles) {
      setError('User roles not found. Please refresh and try again.');
      return;
    }

    if (!scheduledSession) {
      setError('No scheduled session found. Please create a session first via "Survey Dates Management" page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const openingDate = new Date(scheduledSession.opening_date).toISOString().split('T')[0];
      const closingDate = new Date(scheduledSession.closing_date).toISOString().split('T')[0];

      // Send broadcast using Resend Broadcast API
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: scheduledSession.year,
          openingDate,
          closingDate,
          userRoles
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to send broadcast');
      }

      console.log('✅ Broadcast sent successfully:', data);
      setStep('success');
      
      // Refresh session data
      await checkCurrentSession();
      await loadScheduledSession();
      
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
    setStep('preview');
    setEmailTemplate('');
    setError(null);
    loadScheduledSession(); // Reload session data
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
                  <Link href="/admin" className="no-underline">Super Admin Tools</Link>
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


        {/* Session Queue */}
        <SessionQueue 
          userRoles={userRoles} 
          onSessionDeleted={() => {
            // Refresh current session status when a session is deleted
            checkCurrentSession();
          }}
        />

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {/* Email Preview */}
          {step === 'preview' && (
            <div>
              {!scheduledSession ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">No Scheduled Session Found</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    Please create Library_Year records first via the "Survey Dates Management" page.
                  </p>
                  <Link href="/admin/open-year">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Go to Survey Dates Management
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">Broadcast Email Preview</h2>
                  
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Scheduled Session Details:</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Year:</strong> {scheduledSession.year}</p>
                      <p><strong>Opens:</strong> <LocalDateTime dateString={scheduledSession.opening_date} /></p>
                      <p><strong>Closes:</strong> <LocalDateTime dateString={scheduledSession.closing_date} /></p>
                      <p><strong>Status:</strong> {scheduledSession.status}</p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      This email preview is based on the scheduled session above. You cannot edit it. It will be sent to all members in your CEAL broadcast audience when you click "Send Broadcast".
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-3 text-gray-600">Loading email preview...</span>
                    </div>
                  ) : emailTemplate ? (
                    <div className="border border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto mb-6 bg-gray-50">
                      <div dangerouslySetInnerHTML={{ __html: emailTemplate }} />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No email template available
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setStep('confirm')}
                      disabled={!emailTemplate}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Send Broadcast
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                    <Button 
                      onClick={refreshEmailPreview}
                      disabled={loading}
                      className="bg-gray-500 hover:bg-gray-600"
                    >
                      Refresh Preview
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {step === 'confirm' && scheduledSession && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Send Broadcast</h2>
              
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
                <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  ⚠️ Confirm Broadcast Details
                </h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>
                      <strong>Year:</strong> {scheduledSession.year}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>
                      <strong>Opening:</strong> <LocalDateTime dateString={scheduledSession.opening_date} />
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>
                      <strong>Closing:</strong> <LocalDateTime dateString={scheduledSession.closing_date} /> at <strong>11:59 PM PT</strong>
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
                    <span>Super admins will receive VERIFIED confirmation email after all forms are closed</span>
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
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Broadcast Now
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
          {step === 'success' && scheduledSession && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  Broadcast Scheduled Successfully!
                </h2>
                <p className="text-gray-700 text-lg mb-2">
                  Broadcast for <strong>{scheduledSession.year}</strong> has been scheduled.
                </p>
                <p className="text-gray-600">
                  Forms will automatically open on the scheduled date, and members will receive notification emails at that time.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-2">What Happens Next:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Forms will automatically open on <LocalDateTime dateString={scheduledSession.opening_date} /></li>
                  <li>• Broadcast email sent to all CEAL members when forms open</li>
                  <li>• Forms will automatically close on <LocalDateTime dateString={scheduledSession.closing_date} /> at 11:59 PM PT</li>
                  <li>• You will receive VERIFIED confirmation email after all forms are closed</li>
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
