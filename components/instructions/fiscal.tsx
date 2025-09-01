import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, DollarSign, AlertTriangle, BookOpen } from "lucide-react"

export const FiscalInstructions = () => {
    return (
        <div className="space-y-6" id="fiscal">
            {/* Header Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        Fiscal Support Form
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription className="text-base font-medium pl-6">
                        Budget and Financial Support for Acquisitions
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
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">This is the only form where you may enter subtotals and totals manually without filling in the breakdown fields.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <DollarSign className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">All amounts must be reported in U.S. dollars.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Enter numbers without dollar signs or commas (e.g., 50600 not $50,600).</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Round all figures to the nearest dollar.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Include funds from the regular institutional budget, research grants, endowments, and East Asian program support for acquisitions.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calculator className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Cell 37 (Total Acquisitions Budget) must be filled manually. The system will not calculate this value.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appropriations Options */}
            <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                        <Info className="h-4 w-4" />
                        Appropriations Entry Options
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-amber-800">
                        <p>In the Appropriations section, you can:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Enter data directly in subtotal fields 5, 10, 15, and 20 without filling 01–04, 06–09, 11–14, or 16–19.</li>
                            <li>Enter cell 21 (Total Appropriations) and leave fields 01–20 blank.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Field Categories */}
            <div className="space-y-4">
                {/* Chinese Appropriations */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Chinese Appropriations
                        </CardTitle>
                        <CardDescription className="text-sm">Funds for Chinese language materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Monographic</span>
                                <Badge variant="outline" className="text-xs">01</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Serial</span>
                                <Badge variant="outline" className="text-xs">02</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Other Materials</span>
                                <Badge variant="outline" className="text-xs">03</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Electronic Resources</span>
                                <Badge variant="outline" className="text-xs">04</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Total</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">05: Auto Calculated</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Japanese Appropriations */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-green-600" />
                            Japanese Appropriations
                        </CardTitle>
                        <CardDescription className="text-sm">Funds for Japanese language materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Monographic</span>
                                <Badge variant="outline" className="text-xs">06</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Serial</span>
                                <Badge variant="outline" className="text-xs">07</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Other Materials</span>
                                <Badge variant="outline" className="text-xs">08</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Electronic Resources</span>
                                <Badge variant="outline" className="text-xs">09</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Total</span>
                                <Badge className="bg-green-100/90 text-green-600 text-xs">10: Auto Calculated</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Korean Appropriations */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            Korean Appropriations
                        </CardTitle>
                        <CardDescription className="text-sm">Funds for Korean language materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Monographic</span>
                                <Badge variant="outline" className="text-xs">11</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Serial</span>
                                <Badge variant="outline" className="text-xs">12</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Other Materials</span>
                                <Badge variant="outline" className="text-xs">13</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Electronic Resources</span>
                                <Badge variant="outline" className="text-xs">14</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Total</span>
                                <Badge className="bg-purple-100/90 text-purple-600 text-xs">15: Auto Calculated</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Non-CJK Appropriations */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-600" />
                            Non-CJK Appropriations
                        </CardTitle>
                        <CardDescription className="text-sm">Funds for non-CJK language materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Monographic</span>
                                <Badge variant="outline" className="text-xs">16</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Serial</span>
                                <Badge variant="outline" className="text-xs">17</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Other Materials</span>
                                <Badge variant="outline" className="text-xs">18</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Electronic Resources</span>
                                <Badge variant="outline" className="text-xs">19</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Total</span>
                                <Badge className="bg-orange-100/90 text-orange-600 text-xs">20: Auto Calculated</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Appropriations */}
                <Card className="border-2 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                            <Calculator className="h-4 w-4" />
                            Total Appropriations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border">
                            <span className="font-medium text-sm">Total Appropriations</span>
                            <Badge className="bg-blue-100/90 text-blue-600 text-xs">21: Auto Calculated (05+10+15+20)</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Other Funding Sources */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            Additional Funding Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Endowments */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Endowments (22-26)</h4>
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span>Chinese, Japanese, Korean, Non-CJK</span>
                                    <Badge variant="outline" className="text-xs">22-25</Badge>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                    <span className="font-medium">Total</span>
                                    <Badge className="bg-emerald-100/90 text-emerald-600 text-xs">26: Auto Calculated</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Grants */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Grants (27-31)</h4>
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span>Chinese, Japanese, Korean, Non-CJK</span>
                                    <Badge variant="outline" className="text-xs">27-30</Badge>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                    <span className="font-medium">Total</span>
                                    <Badge className="bg-emerald-100/90 text-emerald-600 text-xs">31: Auto Calculated</Badge>
                                </div>
                            </div>
                        </div>

                        {/* East Asian Program Support */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">East Asian Program Support (32-36)</h4>
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span>Chinese, Japanese, Korean, Non-CJK</span>
                                    <Badge variant="outline" className="text-xs">32-35</Badge>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                    <span className="font-medium">Total</span>
                                    <Badge className="bg-emerald-100/90 text-emerald-600 text-xs">36: Auto Calculated</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Final Total */}
                <Card className="border-4 border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-green-700">
                            <Calculator className="h-4 w-4" />
                            Total Acquisitions Budget
                        </CardTitle>
                        <CardDescription className="text-sm text-green-600">Must be filled manually</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-200">
                            <span className="font-bold text-sm">Total Acquisitions Budget</span>
                            <Badge className="bg-green-200 text-green-700 text-xs font-semibold">37: Manual Entry Required</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}