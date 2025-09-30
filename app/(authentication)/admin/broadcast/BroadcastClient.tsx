'use client'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Send, CheckCircle, AlertCircle, Loader2, SlashIcon } from 'lucide-react'
import Link from 'next/link'
import { LocalDateTime } from '@/components/LocalDateTime'
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
                  What happens when you create a session:
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>All library forms will be opened for editing immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Broadcast email sent to all CEAL members via Resend Broadcast API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Forms will remain open until you manually close them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Each member can only edit their own library's forms</span>
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
                  ⚠️ Important: This action cannot be undone
                </h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>Broadcast email will be sent <strong>immediately</strong> to all CEAL members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>All library forms will be <strong>opened for editing</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>
                      Planned closing date: <strong>{
                        new Date(closingDate)
                          .toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      }</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-1">•</span>
                    <span>You will need to manually close forms using the "Close All Forms" button</span>
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
                      Send Broadcast & Open Forms
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
                  Broadcast Sent Successfully!
                </h2>
                <p className="text-gray-700 text-lg mb-2">
                  Form session for <strong>{year}</strong> has been created.
                </p>
                <p className="text-gray-600">
                  Notification emails have been sent to all CEAL members via Resend.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Monitor library submissions through the admin dashboard</li>
                  <li>• Close forms manually when data collection period ends</li>
                  <li>• Check audit logs to track form activity</li>
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
