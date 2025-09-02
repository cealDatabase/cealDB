import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, Archive, Map, Headphones, Video, Disc, Monitor, Plus, Minus } from "lucide-react"

export function OtherHoldingsInstructions() {
    return (
        <div className="space-y-6" id="otherHoldings">
            {/* Header Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <Archive className="h-5 w-5 text-blue-500" />
                        Holdings of Other Materials Form
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription className="text-base font-medium pl-6">
                        Total Accumulated Holdings of Non-Book Materials
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
                            <p className="text-sm">Report the library's <strong>total accumulated holdings</strong> of "other materials" — not just new acquisitions for the year.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Minus className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Do not count online subscription accessible items toward the grand total.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Count <strong>individual pieces</strong>, not titles.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Info className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                            <p className="text-sm"><strong>Example:</strong> If one title has several DVDs, report the number of DVDs, not "1"</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calculator className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">No need to fill in subtotal or total fields. The system calculates these automatically.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Scopes of Materials Card */}
            <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                        <Info className="h-4 w-4" />
                        Scopes of Materials
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-3 text-sm text-amber-800">
                        <div className="flex items-start gap-3">
                            <Archive className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Microforms:</p>
                                <p className="text-xs">Include microfilm reels, microcards, microprint, and microfiche sheets. Include all government documents in microform.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Map className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Cartographic and Graphic Materials:</p>
                                <p className="text-xs">Include two- or three-dimensional maps and globes; satellite and aerial photographs/images; prints, pictures, photographs, postcards, slides, transparencies, filmstrips, and similar items.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Headphones className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Audio:</p>
                                <p className="text-xs">Include audiocassettes, phonodiscs, CDs, reel-to-reel tapes, and other sound recordings.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Video className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Video:</p>
                                <p className="text-xs">Include motion pictures, videocassettes, laserdiscs, and other comparable visual materials.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Special Notes Card */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                        <Monitor className="h-4 w-4" />
                        Special Notes for Online Materials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">Before using the "Import from …" feature, update your "Audio/Video Database by Subscription – List" so the system can calculate numbers automatically.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Field Categories */}
            <div className="space-y-4">
                {/* Microforms */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Archive className="h-4 w-4 text-gray-600" />
                            Microforms
                        </CardTitle>
                        <CardDescription className="text-sm">Microfilm reels, microcards, microprint, and microfiche sheets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Microform Chinese</span>
                                <Badge variant="outline" className="text-xs">01</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Microform Japanese</span>
                                <Badge variant="outline" className="text-xs">02</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Microform Korean</span>
                                <Badge variant="outline" className="text-xs">03</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Microform Non-CJK</span>
                                <Badge variant="outline" className="text-xs">04</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Microforms Subtotal</span>
                                <Badge className="bg-gray-100/90 text-gray-600 text-xs">Auto: 01+02+03+04</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cartographic and Graphic Materials */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Map className="h-4 w-4 text-green-600" />
                            Cartographic and Graphic Materials
                        </CardTitle>
                        <CardDescription className="text-sm">Maps, globes, photographs, prints, slides, and visual materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Graphic Chinese</span>
                                <Badge variant="outline" className="text-xs">06</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Graphic Japanese</span>
                                <Badge variant="outline" className="text-xs">07</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Graphic Korean</span>
                                <Badge variant="outline" className="text-xs">08</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Graphic Non-CJK</span>
                                <Badge variant="outline" className="text-xs">09</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Graphics Subtotal</span>
                                <Badge className="bg-green-100/90 text-green-600 text-xs">Auto: 06+07+08+09</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Audio Materials */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-purple-600" />
                            Audio Materials
                        </CardTitle>
                        <CardDescription className="text-sm">Audiocassettes, CDs, phonodiscs, and sound recordings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Audio Chinese</span>
                                <Badge variant="outline" className="text-xs">11</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Audio Japanese</span>
                                <Badge variant="outline" className="text-xs">12</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Audio Korean</span>
                                <Badge variant="outline" className="text-xs">13</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Audio Non-CJK</span>
                                <Badge variant="outline" className="text-xs">14</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Audio Subtotal</span>
                                <Badge className="bg-purple-100/90 text-purple-600 text-xs">Auto: 11+12+13+14</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Video Materials */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Video className="h-4 w-4 text-red-600" />
                            Video Materials
                        </CardTitle>
                        <CardDescription className="text-sm">Motion pictures, videocassettes, and laserdiscs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Video Chinese</span>
                                <Badge variant="outline" className="text-xs">16</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Video Japanese</span>
                                <Badge variant="outline" className="text-xs">17</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Video Korean</span>
                                <Badge variant="outline" className="text-xs">18</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Video Non-CJK</span>
                                <Badge variant="outline" className="text-xs">19</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Video Subtotal</span>
                                <Badge className="bg-red-100/90 text-red-600 text-xs">Auto: 16+17+18+19</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* DVD Materials */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Disc className="h-4 w-4 text-indigo-600" />
                            DVD Materials
                        </CardTitle>
                        <CardDescription className="text-sm">Digital video discs and related media</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>DVD Chinese</span>
                                <Badge variant="outline" className="text-xs">21</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>DVD Japanese</span>
                                <Badge variant="outline" className="text-xs">22</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>DVD Korean</span>
                                <Badge variant="outline" className="text-xs">23</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>DVD Non-CJK</span>
                                <Badge variant="outline" className="text-xs">24</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">DVD Subtotal</span>
                                <Badge className="bg-indigo-100/90 text-indigo-600 text-xs">Auto: 21+22+23+24</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Online Materials */}
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                            <Monitor className="h-4 w-4" />
                            Online Materials
                        </CardTitle>
                        <CardDescription className="text-sm">Subscription-based digital materials (auto-calculated from database)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center p-2 bg-blue-100/50 rounded">
                                <span className="font-medium">Online Maps</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 26-30</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-100/50 rounded">
                                <span className="font-medium">Online Images/Photographs</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 31-35</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-100/50 rounded">
                                <span className="font-medium">Streaming Audio/Music</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 36-40</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-100/50 rounded">
                                <span className="font-medium">Streaming Film/Video</span>
                                <Badge className="bg-blue-100/90 text-blue-600 text-xs">Auto: 41-45</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Fields */}
                <Card className="border-orange-200 bg-orange-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                            <Plus className="h-4 w-4" />
                            Custom Fields
                        </CardTitle>
                        <CardDescription className="text-sm">Additional material types specific to your library</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col justify-start items-start gap-2 p-3 bg-orange-100/50 rounded-lg border border-orange-200">
                            <span className="font-medium text-sm">Custom Materials (All Languages)</span>
                            <Badge className="bg-orange-100/90 text-orange-600 text-xs">Auto: 46-50</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Grand Total */}
                <Card className="border-accent bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calculator className="h-4 w-4 text-blue-500" />
                            Total Other Holdings
                        </CardTitle>
                        <CardDescription className="text-sm">Final total of all other materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col justify-start items-start gap-2 p-3 bg-primary/5 rounded-lg border-2 border-primary/20">
                            <span className="font-bold text-sm text-primary">GRAND TOTAL (Other Materials)</span>
                            <Badge className="bg-primary/10 text-primary text-xs font-medium">Auto: 05+10+15+20+25</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}