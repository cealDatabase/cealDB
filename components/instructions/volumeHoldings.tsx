import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, BookOpen, Plus, Minus, Database } from "lucide-react"

export function VolumeHoldingsInstructions() {
    return (
        <div className="space-y-6" id="volumeHoldings">
            {/* Header Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        Physical Total Volume Holdings Form
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription className="text-base font-medium pl-6">
                        Monographs Held by the Institution
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Essential Information Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-5 w-5 text-blue-500" />
                        Essential Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Database className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Previously reported holdings are pre-filled from the CEAL database (fields 01–05).</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">New libraries must enter data based on their own collection counts.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Include duplicates and bound volumes of periodicals.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Minus className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Exclude microforms, maps, non-print materials, and uncataloged items.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">For "volumes added," count only those cataloged, classified, and ready for use.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calculator className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">No need to fill in subtotal or total fields. The system will calculate them automatically.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Definition Card */}
            <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                        <Info className="h-4 w-4" />
                        Definition of "Volume" (ANSI Z39.7-1995)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-800 leading-relaxed">
                        A single physical unit of any printed, typewritten, handwritten, mimeographed, or processed work,
                        distinguished from other units by a separate binding, encasement, portfolio, or other clear distinction,
                        which has been cataloged, classified, and made ready for use, and which is typically the unit used to
                        charge circulation transactions. Either a serial volume is bound, or it comprises the serial issues that
                        would be bound together if the library bound all serials.
                    </p>
                </CardContent>
            </Card>

            {/* Field Categories */}
            <div className="space-y-4">
                {/* Previous Year Holdings */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-primary text-base flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Physical Volume Numbers from Last Year
                        </CardTitle>
                        <CardDescription className="text-sm">Auto-filled from database if available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Previous Chinese</span>
                                <Badge variant="outline" className="text-xs">01</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Previous Japanese</span>
                                <Badge variant="outline" className="text-xs">02</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Previous Korean</span>
                                <Badge variant="outline" className="text-xs">03</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Previous Non-CJK</span>
                                <Badge variant="outline" className="text-xs">04</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Subtotal</span>
                                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto Calculated: 01+02+03+04</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Volumes Added This Year */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Plus className="h-4 w-4 text-green-600" />
                            Physical Volumes Added This Year
                        </CardTitle>
                        <CardDescription className="text-sm">Cataloged, including bound serials arranged in alphabetical order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Added Chinese</span>
                                <Badge variant="outline" className="text-xs">06</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Added Japanese</span>
                                <Badge variant="outline" className="text-xs">07</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Added Korean</span>
                                <Badge variant="outline" className="text-xs">08</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Added Non-CJK</span>
                                <Badge variant="outline" className="text-xs">09</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start py-1 gap-2 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Added Subtotal</span>
                                <Badge className="bg-green-100/90 text-green-600 text-xs">Auto Calculated: 06+07+08+09</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Volumes Withdrawn This Year */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Minus className="h-4 w-4 text-red-600" />
                            Physical Volumes Withdrawn This Year
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Withdrawn Chinese</span>
                                <Badge variant="outline" className="text-xs">11</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Withdrawn Japanese</span>
                                <Badge variant="outline" className="text-xs">12</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Withdrawn Korean</span>
                                <Badge variant="outline" className="text-xs">13</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Withdrawn Non-CJK</span>
                                <Badge variant="outline" className="text-xs">14</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Withdrawn Subtotal</span>
                                <Badge className="bg-red-100/90 text-red-600 text-xs">Auto Calculated: 11+12+13+14</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Grand Total */}
                <Card className="border-accent bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calculator className="h-4 w-4 text-blue-500" />
                            Total Physical Volume Holdings
                        </CardTitle>
                        <CardDescription className="text-sm">Automatically calculated by the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col justify-start items-start p-3 gap-2 bg-background rounded-lg border">
                            <p className="font-medium text-sm">Grand Total (Physical Vols)</p>
                            <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto Calculated: 05 + 10 − 15</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}