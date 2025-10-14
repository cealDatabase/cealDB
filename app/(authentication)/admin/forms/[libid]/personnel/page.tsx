"use client"

import { useState } from "react"
import { PersonnelInstructions } from "@/components/instructions/personnel"
import PersonnelForm from "@/components/forms/personnel-form"
import { Button } from "@/components/ui/button"
import { BookOpen, X, History } from "lucide-react"
import { Container } from "@/components/Container"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"

const PersonnelPage = () => {
    const [showInstructions, setShowInstructions] = useState(false)

    return (
        <>
            <Container>
                <AdminBreadcrumb libraryName="Library" />
                <h1 className="text-3xl font-bold text-gray-900 mt-6">
                    Personnel Support
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
                        variant="default"
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                        size="lg"
                        onClick={() => window.open(window.location.pathname + '/past-years', '_blank')}
                    >
                        <History className="h-4 w-4" />
                        View data from past 5 years
                    </Button>
                </div>

                <div className="flex gap-6 max-w-full">
                    {/* Instructions Column - 1/3 width */}
                    {showInstructions && (
                        <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[80vh] sticky top-4">
                            <PersonnelInstructions />
                        </div>
                    )}

                    {/* Form Column - 2/3 width when instructions shown, full width when hidden */}
                    <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
                        <PersonnelForm />
                    </div>
                </div>
            </Container>
        </>
    )
}

export default PersonnelPage