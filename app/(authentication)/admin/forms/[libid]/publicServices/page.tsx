"use client"

import React, { useState } from 'react'
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { Button } from "@/components/ui/button"
import { BookOpen, X } from "lucide-react"

const PublicServicesPage = () => {
    const [showInstructions, setShowInstructions] = useState(false)

    return (
        <>
            <Container>
                <AdminBreadcrumb libraryName="Library" />
                <h1 className="text-3xl font-bold text-gray-900 mt-6">
                    Public Services
                </h1>
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-md font-bold"
                        size="lg"
                        onClick={() => setShowInstructions(!showInstructions)}
                    >
                        {showInstructions ? (
                            <>
                                <X className="h-4 w-4" />
                                Hide Instructions
                            </>
                        ) : (
                            <>
                                <BookOpen className="h-4 w-4" />
                                View Instructions
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex gap-6 max-w-full">
                    {showInstructions && (
                        <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[80vh] sticky top-4">
                            <div className="text-gray-600">
                                <p>Public Services instructions will be added here.</p>
                            </div>
                        </div>
                    )}

                    <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Public Services Form</h2>
                            <p className="text-gray-600">Public Services form will be implemented here.</p>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    )
}

export default PublicServicesPage