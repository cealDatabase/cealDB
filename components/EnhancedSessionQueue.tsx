'use client'

import React, { useState, useEffect } from 'react'
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Mail,
  FolderOpen,
  FolderClosed,
  XCircle
} from 'lucide-react'

interface ScheduledEvent {
  id: number;
  event_type: 'BROADCAST' | 'FORM_OPENING' | 'FORM_CLOSING';
  year: number;
  scheduled_date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  completed_at?: Date | null;
  cancelled_at?: Date | null;
  notes?: string | null;
  days_until?: number | null;
  is_overdue?: boolean;
}

interface LibraryYearSession {
  year: number;
  opening_date: Date | null;
  closing_date: Date | null;
  status: 'scheduled' | 'active' | 'closed';
  total_libraries: number;
  open_libraries: number;
  closed_libraries: number;
  days_until_open?: number | null;
  days_until_close?: number | null;
}

interface EnhancedSessionQueueProps {
  userRoles?: string[] | null;
  onEventDeleted?: () => void;
}

export default function EnhancedSessionQueue({ userRoles, onEventDeleted }: EnhancedSessionQueueProps) {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [librarySessions, setLibrarySessions] = useState<LibraryYearSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deletingSessionYear, setDeletingSessionYear] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending');

  // Check if user is super admin
  const isSuperAdmin = userRoles && userRoles.includes('1');

  useEffect(() => {
    fetchAllData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch both scheduled events and library year sessions in parallel
      const [eventsResponse, sessionsResponse] = await Promise.all([
        fetch(`/api/admin/scheduled-events?status=${statusFilter}`),
        fetch('/api/admin/pending-sessions')
      ]);

      const eventsData = await eventsResponse.json();
      const sessionsData = await sessionsResponse.json();

      if (eventsData.success) {
        setEvents(eventsData.events || []);
      }

      if (sessionsData.success) {
        setLibrarySessions(sessionsData.sessions || []);
      }

      if (!eventsData.success && !sessionsData.success) {
        setError('Failed to fetch session data');
      }
    } catch (err) {
      setError('Failed to load session queue');
      console.error('Session queue error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = async (eventId: number, eventType: string, year: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel this ${eventType.replace('_', ' ')} event for year ${year}?\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingEventId(eventId);
    try {
      const response = await fetch('/api/admin/scheduled-events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userRoles
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to cancel event');
      }

      console.log('✅ Event cancelled:', data);

      // Refresh all data
      await fetchAllData();

      // Call callback if provided
      if (onEventDeleted) {
        onEventDeleted();
      }

      alert(`${eventType.replace('_', ' ')} for year ${year} has been cancelled.`);
    } catch (err) {
      console.error('Cancel event error:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleDeleteSession = async (year: number, totalLibraries: number) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Delete Survey Session for ${year}?\n\n` +
      `This will DELETE survey dates for ${totalLibraries} libraries.\n\n` +
      `This action cannot be undone. Are you absolutely sure?`
    );

    if (!confirmed) return;

    setDeletingSessionYear(year);
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

      // Refresh all data
      await fetchAllData();

      // Call callback if provided
      if (onEventDeleted) {
        onEventDeleted();
      }

      alert(`Survey session for year ${year} has been deleted. Schedule dates cleared from ${data.deletedCount || totalLibraries} libraries.`);
    } catch (err) {
      console.error('Delete session error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setDeletingSessionYear(null);
    }
  };

  const getEventIcon = (eventType: string, status: string) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5 text-gray-600" />;

    switch (eventType) {
      case 'BROADCAST':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'FORM_OPENING':
        return <FolderOpen className="w-5 h-5 text-green-600" />;
      case 'FORM_CLOSING':
        return <FolderClosed className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: string, status: string) => {
    if (status === 'completed') return 'bg-green-50 border-green-200 text-green-700';
    if (status === 'cancelled') return 'bg-gray-50 border-gray-200 text-gray-500';

    switch (eventType) {
      case 'BROADCAST':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'FORM_OPENING':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'FORM_CLOSING':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'BROADCAST':
        return 'Broadcast Email';
      case 'FORM_OPENING':
        return 'Form Opening';
      case 'FORM_CLOSING':
        return 'Form Closing';
      default:
        return eventType;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Pending</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold">Cancelled</span>;
      default:
        return null;
    }
  };

  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = [];
    }
    acc[event.year].push(event);
    return acc;
  }, {} as Record<number, ScheduledEvent[]>);

  if (loading) {
    return (
      <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading scheduled events...</span>
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

  const pendingCount = events.filter(e => e.status === 'pending').length +
    librarySessions.filter(s => s.status === 'scheduled' || s.status === 'active').length;
  const completedCount = events.filter(e => e.status === 'completed').length;
  const totalCount = events.length + librarySessions.length;

  if (totalCount === 0) {
    return (
      <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Queue
        </h2>
        <p className="text-gray-600">No scheduled events found.</p>
        <p className="text-sm text-gray-500 mt-2">Create a new session via "Survey Dates Management" to schedule events.</p>
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
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Session Queue
          </h2>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-sm rounded-full font-semibold">
              {pendingCount} Pending
            </span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
              {completedCount} Completed
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Filter Toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${statusFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Pending Only
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All Events
            </button>
          </div>

          {/* Library Year Sessions */}
          {librarySessions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Survey Sessions</h3>
              {librarySessions.map((session) => (
                <div
                  key={`session-${session.year}`}
                  className={`border rounded-lg p-4 ${session.status === 'active'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : session.status === 'scheduled'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <div className="font-bold text-lg">
                          Academic Year {session.year}
                        </div>
                        <div className="text-sm opacity-75 mt-1">
                          {session.total_libraries} libraries • {session.open_libraries} open • {session.closed_libraries} closed
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.status === 'active'
                        ? 'bg-green-600 text-white'
                        : session.status === 'scheduled'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-400 text-white'
                        }`}>
                        {session.status === 'active' ? 'Active' : session.status === 'scheduled' ? 'Scheduled' : 'Closed'}
                      </span>

                      {/* Countdown for scheduled sessions */}
                      {session.status === 'scheduled' && session.days_until_open !== null && session.days_until_open !== undefined && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          Opens in {session.days_until_open} day{session.days_until_open !== 1 ? 's' : ''}
                        </span>
                      )}

                      {/* Delete button for super admins */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteSession(session.year, session.total_libraries)}
                          disabled={deletingSessionYear === session.year}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete this survey session"
                        >
                          {deletingSessionYear === session.year ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-current opacity-70">
                    {session.opening_date && (
                      <div className="text-sm">
                        <div className="font-medium opacity-75 mb-1">Opening Date</div>
                        <div className="font-semibold">
                          {new Date(session.opening_date).toLocaleDateString('en-US', {
                            timeZone: "America/New_York"
                          })}
                        </div>
                      </div>
                    )}
                    {session.closing_date && (
                      <div className="text-sm">
                        <div className="font-medium opacity-75 mb-1">Closing Date</div>
                        <div className="font-semibold">
                          {new Date(session.closing_date).toLocaleDateString('en-US', {
                            timeZone: "America/Los_Angeles"
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scheduled Events (from broadcast) */}
          {events.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6">Broadcast Events</h3>
              {Object.entries(eventsByYear)
                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                .map(([year, yearEvents]) => (
                  <div key={year}>
                    <h3 className="text-lg font-bold mb-3 text-gray-700">
                      Academic Year {year}
                    </h3>
                    <div className="space-y-2">
                      {yearEvents
                        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                        .map((event) => (
                          <div
                            key={event.id}
                            className={`border rounded-lg p-4 ${getEventColor(event.event_type, event.status)}`}
                          >
                            {/* Event header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {getEventIcon(event.event_type, event.status)}
                                <div>
                                  <div className="font-bold">
                                    {getEventLabel(event.event_type)}
                                  </div>
                                  <div className="text-sm opacity-75">
                                    Scheduled: {new Date(event.scheduled_date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Status and actions */}
                              <div className="flex items-center gap-2">
                                {getStatusBadge(event.status)}

                                {/* Countdown badge for pending events */}
                                {event.status === 'pending' && event.days_until !== null && event.days_until !== undefined && (
                                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${event.is_overdue
                                    ? 'bg-red-600 text-white'
                                    : 'bg-blue-600 text-white'
                                    }`}>
                                    {event.is_overdue
                                      ? `${Math.abs(event.days_until || 0)} day${Math.abs(event.days_until || 0) !== 1 ? 's' : ''} overdue`
                                      : `In ${event.days_until} day${event.days_until !== 1 ? 's' : ''}`
                                    }
                                  </div>
                                )}

                                {/* Cancel button - only for pending events */}
                                {isSuperAdmin && event.status === 'pending' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelEvent(event.id, event.event_type, event.year);
                                    }}
                                    disabled={deletingEventId === event.id}
                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Cancel this scheduled event"
                                  >
                                    {deletingEventId === event.id ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Event notes */}
                            {event.notes && (
                              <div className="mt-2 text-sm opacity-75 italic">
                                Note: {event.notes}
                              </div>
                            )}

                            {/* Completion/Cancellation timestamps */}
                            {event.completed_at && (
                              <div className="mt-2 text-xs opacity-60">
                                Completed:  {new Date(event.completed_at).toLocaleDateString('en-US', {
                                  timeZone: "America/New_York"
                                })}
                              </div>
                            )}
                            {event.cancelled_at && (
                              <div className="mt-2 text-xs opacity-60">
                                Cancelled: {new Date(event.cancelled_at).toLocaleDateString('en-US', {
                                  timeZone: "America/New_York"
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
