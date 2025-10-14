"use client"

import React, { useState } from 'react'
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"
import { Button } from "@/components/ui/button"
import { BookOpen, X, History } from "lucide-react"
import ElectronicForm from "@/components/forms/electronic-form"
import { ElectronicInstructions } from "@/components/instructions/electronic"

const ElectronicPage = () => {
    const [showInstructions, setShowInstructions] = useState(false)

    return (
        <>
            <Container>
                <AdminBreadcrumb libraryName="Library" />
                <h1 className="text-3xl font-bold text-gray-900 mt-6">
                    Electronic
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
                    
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-md font-bold"
                        size="lg"
                        onClick={() => window.open(window.location.pathname + '/past-years', '_blank')}
                    >
                        <History className="h-4 w-4" />
                        View Data From Past 5 Years
                    </Button>
                </div>

                <div className="flex gap-6 max-w-full">
                    {showInstructions && (
                        <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[80vh] sticky top-4">
                            <ElectronicInstructions />
                        </div>
                    )}

                    <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
                        <ElectronicForm />
                    </div>
                </div>
            </Container>
        </>
    )
}

export default ElectronicPage