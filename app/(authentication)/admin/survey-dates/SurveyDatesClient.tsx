'use client';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Save, CheckCircle, AlertCircle, Loader2, SlashIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { getSurveyDates, formatSurveyDate, formatFiscalYear, formatPublicationDate } from '@/lib/surveyDates';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

interface SurveyDatesClientProps {
  userRoles: string[] | null;
}

export default function SurveyDatesClient({ userRoles }: SurveyDatesClientProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [openingDate, setOpeningDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDates, setFetchingDates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasCustomDates, setHasCustomDates] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);

  // Calculated dates (read-only)
  const [fiscalYearPeriod, setFiscalYearPeriod] = useState('');
  const [publicationMonth, setPublicationMonth] = useState('');

  // Check if user is super admin
  const isSuperAdmin = userRoles && userRoles.includes('1');

  // Fetch current dates when year changes
  useEffect(() => {
    fetchCurrentDates();
  }, [year]);

  // Update calculated dates when opening/closing dates change
  useEffect(() => {
    if (openingDate && closingDate) {
      const dates = getSurveyDates(year, new Date(openingDate), new Date(closingDate));
      setFiscalYearPeriod(formatFiscalYear(year));
      setPublicationMonth(formatPublicationDate(year));
    }
  }, [openingDate, closingDate, year]);

  const fetchCurrentDates = async () => {
    setFetchingDates(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/survey-dates?year=${year}`);
      const data = await response.json();

      if (data.success) {
        setOpeningDate(data.dates.openingDate.split('T')[0]);
        setClosingDate(data.dates.closingDate.split('T')[0]);
        setHasCustomDates(data.hasCustomDates);
        setRecordsCount(data.libraryRecordsCount);
        
        // Set calculated dates
        const dates = getSurveyDates(year, new Date(data.dates.openingDate), new Date(data.dates.closingDate));
        setFiscalYearPeriod(formatFiscalYear(year));
        setPublicationMonth(formatPublicationDate(year));
      } else {
        setError(data.error || 'Failed to load survey dates');
      }
    } catch (err) {
      setError('Error fetching survey dates');
      console.error('Error:', err);
    } finally {
      setFetchingDates(false);
    }
  };

  const handleSaveDates = async () => {
    if (!openingDate || !closingDate) {
      setError('Please select both opening and closing dates');
      return;
    }

    if (new Date(closingDate) <= new Date(openingDate)) {
      setError('Closing date must be after opening date');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/survey-dates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          openingDate,
          closingDate,
          userRoles
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        setHasCustomDates(true);
        
        // Refresh to get updated count
        await fetchCurrentDates();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(data.error || 'Failed to save survey dates');
      }
    } catch (err) {
      setError('Error saving survey dates');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaultDates = getSurveyDates(year);
    setOpeningDate(defaultDates.openingDate.toISOString().split('T')[0]);
    setClosingDate(defaultDates.closingDate.toISOString().split('T')[0]);
  };

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
              Super admin privileges (Role ID 1) are required to manage survey dates.
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
      <div className="max-w-4xl mx-auto">
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
                <BreadcrumbPage>Survey Dates Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">Survey Dates Management</h1>
          <p className="text-gray-600">
            Set and manage survey dates for CEAL member libraries. Changes take effect immediately.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">How This Works:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Set opening and closing dates here (they update immediately)</li>
                <li>Forms page will display these dates right away</li>
                <li>Fiscal year and publication date are calculated automatically</li>
                <li>You can send broadcast notifications separately from the Broadcast page</li>
                <li>{recordsCount > 0 ? `Currently managing ${recordsCount} library records for ${year}` : `No records exist yet for ${year} - they will be created when you save`}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {fetchingDates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading survey dates...</span>
            </div>
          ) : (
            <>
              {/* Year Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Academic Year *
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2020"
                  max="2030"
                />
                {hasCustomDates && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Custom dates are set for {year}
                  </p>
                )}
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Opening Date * (Customizable)
                  </label>
                  <input
                    type="date"
                    value={openingDate}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: October 1, {year}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Closing Date * (Customizable)
                  </label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={openingDate || undefined}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Default: December 1, {year}
                  </p>
                </div>
              </div>

              {/* Automatic Dates (Read-only) */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Automatically Calculated Dates</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiscal Year Period:</span>
                    <span className="font-medium text-gray-900">{fiscalYearPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publication Date:</span>
                    <span className="font-medium text-gray-900">{publicationMonth}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    These dates are calculated automatically and cannot be changed
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleSaveDates}
                  disabled={loading || !openingDate || !closingDate}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Survey Dates
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={resetToDefaults}
                  disabled={loading}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Reset to Defaults
                </Button>

                <Link href="/admin/superguide">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Back to Admin Guide
                  </Button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✅ After saving dates, they will immediately appear on the Forms Management page</p>
                  <p>✅ To send broadcast notifications, visit the <Link href="/admin/broadcast" className="text-blue-600 hover:underline">Broadcast page</Link></p>
                  <p>✅ To open/close forms for editing, use the <Link href="/admin/broadcast" className="text-blue-600 hover:underline">Open/Close Annual Surveys page</Link></p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
