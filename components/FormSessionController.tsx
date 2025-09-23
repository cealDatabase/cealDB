'use client';

import React from 'react';
import { useCanEditForm } from '@/hooks/useFormSession';

interface FormSessionControllerProps {
  libraryId: number;
  children: (props: {
    canEdit: boolean;
    isSessionOpen: boolean;
    loading: boolean;
    StatusMessage: React.ComponentType;
  }) => React.ReactNode;
}

export default function FormSessionController({ libraryId, children }: FormSessionControllerProps) {
  const { canEdit, isSessionOpen, loading, userInfo } = useCanEditForm(libraryId);

  const StatusMessage = () => {
    if (loading) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="animate-pulse flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
            <div className="text-gray-600">Checking form access...</div>
          </div>
        </div>
      );
    }

    if (!userInfo) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Authentication Required</h3>
              <p className="text-sm text-red-700">Please sign in to access forms.</p>
            </div>
          </div>
        </div>
      );
    }

    if (!isSessionOpen) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-800">Forms Currently Closed</h3>
              <p className="text-sm text-yellow-700">
                Forms are not currently open for editing. Please contact the CEAL Database Administrator for assistance.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!canEdit) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Access Restricted</h3>
              <p className="text-sm text-red-700">
                You can only edit forms for libraries you are associated with. 
                If you believe this is an error, please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Forms are open and user can edit
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-green-800">Forms Open for Editing</h3>
            <p className="text-sm text-green-700">
              You can now edit and submit this library's forms. Please ensure all data is accurate before submitting.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {children({
        canEdit,
        isSessionOpen,
        loading,
        StatusMessage
      })}
    </>
  );
}

/**
 * Higher-order component to wrap forms with session control
 */
export function withFormSessionControl<P extends object>(
  WrappedComponent: React.ComponentType<P & { disabled?: boolean }>,
  libraryId: number
) {
  const WithFormSessionControl = (props: P) => {
    return (
      <FormSessionController libraryId={libraryId}>
        {({ canEdit, StatusMessage }) => (
          <>
            <StatusMessage />
            <WrappedComponent {...props} disabled={!canEdit} />
          </>
        )}
      </FormSessionController>
    );
  };

  WithFormSessionControl.displayName = `withFormSessionControl(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithFormSessionControl;
}