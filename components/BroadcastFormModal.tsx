'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

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

interface BroadcastFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userRoles: string[];
}

export default function BroadcastFormModal({ isOpen, onClose, userId, userRoles }: BroadcastFormModalProps) {
  const [step, setStep] = useState<'form' | 'preview' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [year, setYear] = useState(new Date().getFullYear());
  const [openingDate, setOpeningDate] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  
  // Current session data
  const [currentSession, setCurrentSession] = useState<FormSession | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Check for existing active sessions
  useEffect(() => {
    if (isOpen) {
      checkCurrentSession();
    }
  }, [isOpen]);

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

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/broadcast?year=${year}&openingDate=${openingDate}`,
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
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          openingDate,
          userId,
          userRoles
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send broadcast');
      }

      const data = await response.json();
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
    if (!currentSession) return;

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
          userId,
          userRoles
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
    setEmailTemplate('');
    setError(null);
  };

  if (!isOpen) return null;

  // Check if user is super admin
  if (!userRoles.includes('1')) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="mb-4">Super admin privileges required to access this feature.</p>
          <Button onClick={onClose} className="w-full">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Form Session Management</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Current Session Status */}
        {currentSession && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Form Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Year:</strong> {currentSession.year}
              </div>
              <div>
                <strong>Total Libraries:</strong> {currentSession.totalLibraries}
              </div>
              <div>
                <strong>Open for Editing:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  currentSession.openLibraries > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {currentSession.openLibraries} libraries
                </span>
              </div>
              <div>
                <strong>Closed:</strong> {currentSession.closedLibraries} libraries
              </div>
              <div className="col-span-2">
                <strong>Last Updated:</strong> {new Date(currentSession.lastUpdated).toLocaleString()}
              </div>
            </div>
            {hasActiveSession && (
              <div className="mt-4">
                <Button 
                  onClick={closeSession}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Closing...' : 'Close All Forms'}
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Form */}
        {step === 'form' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Create New Form Session</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Academic Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2020"
                  max="2030"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Opening Date</label>
                <input
                  type="date"
                  value={openingDate}
                  onChange={(e) => setOpeningDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">What happens when you create a session:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Forms will be opened for editing for all libraries</li>
                <li>• An email notification will be sent to all CEAL members</li>
                <li>• Forms will automatically close after 62 days</li>
                <li>• Members will only be able to edit their own library's forms</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={previewEmail}
                disabled={loading || !openingDate}
                className="flex-1"
              >
                {loading ? 'Loading...' : 'Preview Email & Continue'}
              </Button>
              <Button 
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Email Preview */}
        {step === 'preview' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Email Preview</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                This email will be sent to all members in the broadcast list.
              </p>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto mb-6">
              <div dangerouslySetInnerHTML={{ __html: emailTemplate }} />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                Approve & Send
              </Button>
              <Button 
                onClick={() => setStep('form')}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Back to Edit
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 'confirm' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Final Confirmation</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important: This action cannot be undone</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Email will be sent immediately to all CEAL members</li>
                <li>• All library forms will be opened for editing</li>
                <li>• Forms will close automatically on {
                  new Date(new Date(openingDate).getTime() + 62 * 24 * 60 * 60 * 1000)
                    .toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                }</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={sendBroadcast}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Sending...' : 'Send Broadcast & Open Forms'}
              </Button>
              <Button 
                onClick={() => setStep('preview')}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Broadcast Sent Successfully!</h3>
              <p className="text-gray-600">
                Form session for {year} has been created and notification emails have been sent to all CEAL members.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
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
  );
}
