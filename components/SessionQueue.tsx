'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Calendar, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { LocalDateTime } from '@/components/LocalDateTime'

interface Session {
  year: number;
  opening_date: Date | null;
  closing_date: Date | null;
  status: 'scheduled' | 'active' | 'closed';
  total_libraries: number;
  open_libraries: number;
  closed_libraries: number;
  days_until_open: number | null;
  days_until_close: number | null;
}

interface SessionQueueProps {
  userRoles?: string[] | null;
  onSessionDeleted?: () => void; // Callback when session is deleted
}

export default function SessionQueue({ userRoles, onSessionDeleted }: SessionQueueProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [deletingYear, setDeletingYear] = useState<number | null>(null);

  // Check if user is super admin
  const isSuperAdmin = userRoles && userRoles.includes('1');

  useEffect(() => {
    fetchSessions();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSessions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/pending-sessions');
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError(data.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('Failed to load session queue');
      console.error('Session queue error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (year: number, status: string) => {
    const statusNote = status === 'active' 
      ? '\n\n⚠️ Note: Forms are currently OPEN. Deleting the schedule will NOT close them - they will remain open.'
      : '';
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the scheduled session for year ${year}?` +
      `\n\nThis will remove the schedule dates but will NOT change the current open/closed status of forms.${statusNote}` +
      `\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingYear(year);
    try {
      const response = await fetch('/api/admin/delete-session', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          userRoles
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to delete session');
      }

      console.log('✅ Session deleted:', data);
      
      // Refresh sessions list
      await fetchSessions();
      
      // Call callback if provided
      if (onSessionDeleted) {
        onSessionDeleted();
      }

      alert(`Session for year ${year} has been deleted successfully.`);
    } catch (err) {
      console.error('Delete session error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setDeletingYear(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'active':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'closed':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'active':
        return 'Active Now';
      case 'closed':
        return 'Recently Closed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading session queue...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Queue
        </h2>
        <p className="text-gray-600">No pending or active form sessions found.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header with expand/collapse */}
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Queue
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-full">
            {sessions.length}
          </span>
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-4">
            Scheduled, active, and recently closed form sessions
          </p>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.year}
                className={`border rounded-lg p-4 ${getStatusColor(session.status)}`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="font-bold text-lg">
                        Academic Year {session.year}
                      </div>
                      <div className="text-sm opacity-75">
                        {getStatusLabel(session.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Countdown badges and delete button */}
                  <div className="flex items-center gap-2">
                    {session.status === 'scheduled' && session.days_until_open !== null && (
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Opens in {session.days_until_open} day{session.days_until_open !== 1 ? 's' : ''}
                      </div>
                    )}
                    {session.status === 'active' && session.days_until_close !== null && (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Closes in {session.days_until_close} day{session.days_until_close !== 1 ? 's' : ''}
                      </div>
                    )}
                    
                    {/* Delete button - show for super admin for all sessions */}
                    {isSuperAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.year, session.status);
                        }}
                        disabled={deletingYear === session.year}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete this scheduled session"
                      >
                        {deletingYear === session.year ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Date details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {session.opening_date && (
                    <div className="text-sm">
                      <div className="font-medium opacity-75 mb-1">Opening Date</div>
                      <div className="font-semibold">
                        <LocalDateTime dateString={session.opening_date.toString()} />
                      </div>
                    </div>
                  )}
                  {session.closing_date && (
                    <div className="text-sm">
                      <div className="font-medium opacity-75 mb-1">Closing Date</div>
                      <div className="font-semibold">
                        <LocalDateTime dateString={session.closing_date.toString()} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Library stats */}
                <div className="flex gap-4 text-sm pt-3 border-t border-current opacity-30">
                  <div>
                    <span className="opacity-75">Total:</span>{' '}
                    <span className="font-semibold">{session.total_libraries}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Open:</span>{' '}
                    <span className="font-semibold">{session.open_libraries}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Closed:</span>{' '}
                    <span className="font-semibold">{session.closed_libraries}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
