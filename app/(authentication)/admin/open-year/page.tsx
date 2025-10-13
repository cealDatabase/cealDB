'use client'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

export default function OpenYearPage() {
    const currentYear = new Date().getFullYear();
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const openNewYearForm = async () => {
        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            console.log('🚀 Starting new year form opening process...');
            console.log('🔗 Connecting to database...');

            const response = await fetch('/api/admin/open-new-year', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
        <>
            <h1>Open Forms for New Year</h1>
            <Container>
                <div className="mb-6">
                    <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Admin Dashboard
                    </Link>
                </div>

                <div className="max-w-2xl">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Open Forms for Year {currentYear}
                                </h2>
                                <p className="text-gray-600">
                                    This action will create new Library_Year records for all libraries, 
                                    enabling them to submit survey data for the year {currentYear}.
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-yellow-900 mb-1">Important</p>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• This will create records for ALL libraries in the system</li>
                                        <li>• Existing records for {currentYear} will be skipped (not overwritten)</li>
                                        <li>• This action cannot be easily undone</li>
                                        <li>• Make sure you want to open forms for {currentYear} before proceeding</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={openNewYearForm}
                            disabled={isProcessing}
                            className="w-full sm:w-auto"
                        >
                            {isProcessing ? 'Processing...' : `Open Forms for ${currentYear}`}
                        </Button>
                    </div>

                    {/* Success Result */}
                    {result && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-green-900 mb-2">
                                        ✅ Successfully opened {result.year} forms!
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
            </Container>
        </>
    );
}
