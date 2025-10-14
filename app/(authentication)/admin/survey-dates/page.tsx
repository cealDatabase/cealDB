'use client'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import React, { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, Calendar, SlashIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default function OpenYearPage() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [openingDate, setOpeningDate] = useState(`${currentYear}-10-01`); // Default: October 1
    const [closingDate, setClosingDate] = useState(`${currentYear}-12-02`); // Default: December 2
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const openNewYearForm = async () => {
        // Validate dates
        if (!openingDate || !closingDate) {
            setError('Please select both opening and closing dates');
            return;
        }

        if (new Date(closingDate) <= new Date(openingDate)) {
            setError('Closing date must be after opening date');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            console.log('🚀 Starting new year form opening process...');
            console.log('📅 Opening Date:', openingDate);
            console.log('📅 Closing Date:', closingDate);

            const response = await fetch('/api/admin/open-new-year', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    year,
                    openingDate,
                    closingDate
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📊 API Response:', data);
                setResult(data);
            } else {
                let errorMessage = 'Error opening new year forms.';
                try {
                    const errorData = await response.json();
                    console.error('❌ API Error Response:', errorData);
                    errorMessage = errorData.error || errorMessage;
                    if (errorData.detail) {
                        errorMessage += `\n${errorData.detail}`;
                    }
                } catch (parseError) {
                    errorMessage += `\nHTTP Status: ${response.status} ${response.statusText}`;
                }
                setError(errorMessage);
            }
        } catch (err) {
            console.error('❌ Network/Connection Error:', err);
            let errorMessage = 'Connection error while opening new year forms.';
            if (err instanceof Error) {
                errorMessage += `\n${err.message}`;
            }
            errorMessage += '\nPlease check your internet connection and try again.';
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

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
                                <BreadcrumbPage>Survey Dates Management</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2">Survey Dates Management</h1>
                    <p className="text-gray-600">
                        Set opening and closing dates for annual surveys. Creates Library_Year records with scheduled dates for automatic form opening/closing.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Open Forms for New Year
                                </h2>
                                <p className="text-gray-600">
                                    Create Library_Year records for all libraries with scheduled opening and closing dates.
                                </p>
                            </div>
                        </div>

                        {/* Year and Date Configuration */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Year *
                                </label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => {
                                        const newYear = parseInt(e.target.value);
                                        setYear(newYear);
                                        // Update date defaults when year changes
                                        setOpeningDate(`${newYear}-10-01`);
                                        setClosingDate(`${newYear}-12-02`);
                                    }}
                                    min="2020"
                                    max="2030"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Opening Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={openingDate}
                                        onChange={(e) => setOpeningDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Forms will open at 12:00 AM Pacific Time</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Closing Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={closingDate}
                                        onChange={(e) => setClosingDate(e.target.value)}
                                        min={openingDate || undefined}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Forms will close at 11:59 PM Pacific Time</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-blue-900 mb-2">What This Does:</p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>✅ Creates Library_Year records for ALL libraries ({year})</li>
                                        <li>✅ Sets opening_date and closing_date in database</li>
                                        <li>✅ Forms remain CLOSED (is_open_for_editing = false)</li>
                                        <li>✅ Existing records for {year} will be skipped (not overwritten)</li>
                                        <li>📧 Does NOT send broadcast emails (do that separately)</li>
                                        <li>🤖 Cron job will automatically open/close on scheduled dates</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={openNewYearForm}
                            disabled={isProcessing || !openingDate || !closingDate}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? 'Setting Dates...' : `Set Dates for ${year}`}
                        </Button>
                    </div>

                    {/* Success Result */}
                    {result && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-green-900 mb-2">
                                        ✅ Successfully set dates for {result.year} forms!
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-green-700 font-medium">Total Libraries</p>
                                        <p className="text-2xl font-bold text-green-900">{result.totalLibraries}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-700 font-medium">New Records Created</p>
                                        <p className="text-2xl font-bold text-green-900">{result.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-700 font-medium">Existing Records Skipped</p>
                                        <p className="text-2xl font-bold text-green-900">{result.skipped || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-700 font-medium">Total Active Records</p>
                                        <p className="text-2xl font-bold text-green-900">{result.totalActiveRecords}</p>
                                    </div>
                                </div>

                                {result.summary && (
                                    <div className="pt-3 border-t border-green-200">
                                        <p className="font-medium text-green-900 mb-2">Breakdown:</p>
                                        <ul className="space-y-1 text-green-800">
                                            <li>• Created: {result.summary.created}</li>
                                            <li>• Skipped: {result.summary.skipped}</li>
                                            {result.summary.errors > 0 && (
                                                <li className="text-red-600">• Errors: {result.summary.errors}</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Result */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-red-900 mb-2">Error</h3>
                                    <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}
