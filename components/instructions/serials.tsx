import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, BookOpen, Plus, Minus, Database, Monitor, FileText, Gift } from "lucide-react"

export function SerialsInstructions() {
    return (
        <div className="space-y-6" id="serials">
            {/* Header Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        Serial Titles Form
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription className="text-base font-medium pl-6">
                        Purchased and Non-Purchased Serial Titles
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
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Report the total number of unique serial titles, both purchased and non-purchased.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-sm"><strong>Purchased serials titles</strong> = active subscriptions currently being received (electronic or print).</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                            <p className="text-sm"><strong>Non-purchased serials titles</strong> = all other serials held, including ceased titles or those without a current subscription.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Count each title only once (no duplicate counting).</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Include government document serials if possible, even if located separately.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Minus className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Exclude unnumbered monographic series and publisher's series.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Count electronic serials in bundles or packages by title, even if uncataloged, as long as they are accessible.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calculator className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">No need to fill in subtotal or total fields. The system calculates these automatically.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Definition Card */}
            <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                        <Info className="h-4 w-4" />
                        Definition of "Serial" (ANSI Z39.7-1995)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-800 leading-relaxed">
                        A publication in any medium issued in successive parts bearing numerical or chronological designations and intended to be continued indefinitely. This definition includes periodicals, newspapers, and annuals (reports, yearbooks, etc.); the journals, memoirs, proceedings, transactions, etc. of societies; and numbered monographic series.
                    </p>
                </CardContent>
            </Card>

            {/* Special Notes Card */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                        <Monitor className="h-4 w-4" />
                        Special Notes for Electronic Serials
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-start gap-3">
                            <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p>Before using the "Import from E-Journal Database by Subscription" feature, update your "E-Journals Database by Subscription – List" so the system can calculate numbers automatically.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p>Under consortial agreements, count any titles your library pays for in part or in full.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p>Include all titles in bundles or aggregated packages, even if payment is partial.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p>If a database includes both full-text and abstract-only titles, count full-text titles.</p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium">If you cannot separate purchased from non-purchased counts:</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc">
                            <li>Report only the total number of current subscribed serial titles on line 15</li>
                            <li>Enter "0" in all other fields</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Field Categories */}
            <div className="space-y-4">
                {/* Purchased Serials - Electronic */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-green-600" />
                            Purchased Serials - Electronic
                        </CardTitle>
                        <CardDescription className="text-sm">Active electronic subscriptions currently being received</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Chinese</span>
                                <Badge variant="outline" className="text-xs">01</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Japanese</span>
                                <Badge variant="outline" className="text-xs">02</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Korean</span>
                                <Badge variant="outline" className="text-xs">03</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Non-CJK</span>
                                <Badge variant="outline" className="text-xs">04</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Purchased Electronic Total</span>
                                <Badge className="bg-green-100/90 text-green-600 text-xs">Auto Calculated: 01+02+03+04</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchased Serials - Print */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            Purchased Serials - Print and Other Formats
                        </CardTitle>
                        <CardDescription className="text-sm">Active print subscriptions currently being received</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Chinese</span>
                                <Badge variant="outline" className="text-xs">06</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Japanese</span>
                                <Badge variant="outline" className="text-xs">07</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Korean</span>
                                <Badge variant="outline" className="text-xs">08</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Purchased Non-CJK</span>
                                <Badge variant="outline" className="text-xs">09</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Purchased Print Total</span>
                                <Badge className="bg-green-100/90 text-green-600 text-xs">Auto Calculated: 06+07+08+09</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Non-Purchased Serials - Electronic */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-purple-600" />
                            Non-Purchased Serials - Electronic
                        </CardTitle>
                        <CardDescription className="text-sm">Electronic serials including gifts, ceased titles, and non-subscription access</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Chinese</span>
                                <Badge variant="outline" className="text-xs">11</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Japanese</span>
                                <Badge variant="outline" className="text-xs">12</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Korean</span>
                                <Badge variant="outline" className="text-xs">13</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Non-CJK</span>
                                <Badge variant="outline" className="text-xs">14</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Non-Purchased Electronic Total</span>
                                <Badge className="bg-purple-100/90 text-purple-600 text-xs">Auto Calculated: 11+12+13+14</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Non-Purchased Serials - Print */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Gift className="h-4 w-4 text-purple-600" />
                            Non-Purchased Serials - Print and Other Formats
                        </CardTitle>
                        <CardDescription className="text-sm">Print serials including gifts, ceased titles, and non-subscription holdings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Chinese</span>
                                <Badge variant="outline" className="text-xs">16</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Japanese</span>
                                <Badge variant="outline" className="text-xs">17</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Korean</span>
                                <Badge variant="outline" className="text-xs">18</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Non-Purchased Non-CJK</span>
                                <Badge variant="outline" className="text-xs">19</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Non-Purchased Print Total</span>
                                <Badge className="bg-purple-100/90 text-purple-600 text-xs">Auto Calculated: 16+17+18+19</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Electronic Totals */}
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                            <Monitor className="h-4 w-4" />
                            Electronic Totals
                        </CardTitle>
                        <CardDescription className="text-sm">Combined electronic serials (purchased + non-purchased)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Total Chinese Electronic</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 01+11</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Total Japanese Electronic</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 02+12</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Total Korean Electronic</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 03+13</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Total Non-CJK Electronic</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 04+14</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Grand Electronic Total</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 05+15</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Print Totals */}
                <Card className="border-orange-200 bg-orange-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                            <FileText className="h-4 w-4" />
                            Print and Other Format Totals
                        </CardTitle>
                        <CardDescription className="text-sm">Combined print serials (purchased + non-purchased)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Total Chinese Print</span>
                                <Badge className="bg-orange-100/90 text-orange-600 text-xs">Auto: 06+16</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Total Japanese Print</span>
                                <Badge className="bg-orange-100/90 text-orange-600 text-xs">Auto: 07+17</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Total Korean Print</span>
                                <Badge className="bg-orange-100/90 text-orange-600 text-xs">Auto: 08+18</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Total Non-CJK Print</span>
                                <Badge className="bg-orange-100/90 text-orange-600 text-xs">Auto: 09+19</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Grand Print Total</span>
                                <Badge className="bg-orange-100/90 text-orange-600 text-xs">Auto: 10+20</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Grand Totals */}
                <Card className="border-accent bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calculator className="h-4 w-4 text-blue-500" />
                            Grand Totals
                        </CardTitle>
                        <CardDescription className="text-sm">Final combined totals across all formats and languages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex flex-col justify-start items-start gap-2 p-3 bg-background rounded-lg border">
                                <span className="font-medium text-sm">Total Chinese (All Formats)</span>
                                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto: 21+26</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 p-3 bg-background rounded-lg border">
                                <span className="font-medium text-sm">Total Japanese (All Formats)</span>
                                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto: 22+27</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 p-3 bg-background rounded-lg border">
                                <span className="font-medium text-sm">Total Korean (All Formats)</span>
                                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto: 23+28</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 p-3 bg-background rounded-lg border">
                                <span className="font-medium text-sm">Total Non-CJK (All Formats)</span>
                                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto: 24+29</Badge>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 p-3 bg-primary/5 rounded-lg border-2 border-primary/20">
                                <span className="font-bold text-sm text-primary">GRAND TOTAL (All Serials)</span>
                                <Badge className="bg-primary/10 text-primary text-xs font-medium">Auto: 25+30</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}