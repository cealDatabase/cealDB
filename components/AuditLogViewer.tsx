'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: number;
  user_id?: number | null;
  username?: string | null;
  action: string;
  table_name?: string | null;
  record_id?: string | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  timestamp: string | Date;
  success: boolean;
  error_message?: string | null;
  User?: {
    id: number;
    username: string;
    firstname?: string | null;
    lastname?: string | null;
  } | null;
}

interface Props {
  logs: AuditLog[];
  total: number;
  currentPage: number;
  filter: string;
}

export default function AuditLogViewer({ logs, total, currentPage, filter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchFilter, setSearchFilter] = useState(filter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchFilter) {
      params.set('filter', searchFilter);
    } else {
      params.delete('filter');
    }
    params.set('page', '1');
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const getActionBadgeColor = (action: string, success: boolean) => {
    if (!success) return 'bg-red-100 text-red-800';
    
    switch (action) {
      case 'SIGNIN':
        return 'bg-green-100 text-green-800';
      case 'SIGNOUT':
        return 'bg-gray-100 text-gray-800';
      case 'CREATE':
        return 'bg-blue-100 text-blue-800';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'SIGNIN_FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by username, action, table, or error message..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
          {filter && (
            <button
              type="button"
              onClick={() => {
                setSearchFilter('');
                router.push('/admin/audit-logs');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {logs.length} of {total} audit logs
          {filter && ` (filtered by "${filter}")`}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
            <li key={log.id}>
              <div className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action, log.success)}`}>
                        {log.action}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {log.User?.firstname && log.User?.lastname 
                            ? `${log.User.firstname} ${log.User.lastname}`
                            : log.username || 'Unknown User'
                          }
                        </p>
                        {log.table_name && (
                          <span className="text-sm text-gray-500">
                            → {log.table_name}
                            {log.record_id && ` (ID: ${log.record_id})`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </p>
                        {log.ip_address && (
                          <span className="text-xs text-gray-400">
                            • IP: {log.ip_address}
                          </span>
                        )}
                        {!log.success && log.error_message && (
                          <span className="text-xs text-red-600">
                            • Error: {log.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Audit Log Details
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(selectedLog.action, selectedLog.success)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.User?.firstname && selectedLog.User?.lastname 
                        ? `${selectedLog.User.firstname} ${selectedLog.User.lastname} (${selectedLog.username})`
                        : selectedLog.username || 'Unknown'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.ip_address || 'Unknown'}
                    </p>
                  </div>
                  
                  {selectedLog.table_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Table</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.table_name}</p>
                    </div>
                  )}
                  
                  {selectedLog.record_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Record ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLog.record_id}</p>
                    </div>
                  )}
                </div>
                
                {selectedLog.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Error Message</label>
                    <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}
                
                {selectedLog.old_values && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previous Values</label>
                    <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.new_values && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Values</label>
                    <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.user_agent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-xs text-gray-600 break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
