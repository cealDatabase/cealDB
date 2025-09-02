import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, Package, AlertTriangle } from "lucide-react"

export const UnprocessedInstructions = () => {
    return (
        <div className="space-y-6" id="unprocessed">
            {/* Header Card */}
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-primary">
                        <Package className="h-5 w-5 text-blue-500" />
                        Unprocessed Backlog Materials Form
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                    </CardTitle>
                    <CardDescription className="text-base font-medium pl-6">
                        Volumes or Pieces Currently in Backlog
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
                            <p className="text-sm">Report the amount of volumes, pieces, or other items currently in backlog (not yet processed) in whole numbers.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">Include materials in all formats.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calculator className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">No need to fill in subtotal or total fields. The system will calculate it automatically.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schema Notice */}
            {/* <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        Development Notice
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-800">
                        This form is currently in development. Database schema integration is pending.
                        Form fields are placeholder implementations until the schema is finalized.
                    </p>
                </CardContent>
            </Card> */}

            {/* Field Categories */}
            <div className="space-y-4">
                {/* Unprocessed Materials */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-600" />
                            Unprocessed Materials by Language
                        </CardTitle>
                        <CardDescription className="text-sm">Materials currently in backlog, not yet processed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Unprocessed Chinese</span>
                                <Badge variant="outline" className="text-xs">01</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Unprocessed Japanese</span>
                                <Badge variant="outline" className="text-xs">02</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Unprocessed Korean</span>
                                <Badge variant="outline" className="text-xs">03</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span>Unprocessed Non-CJK</span>
                                <Badge variant="outline" className="text-xs">04</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                                <span className="font-medium text-xs">Total</span>
                                <Badge className="bg-gray-100/90 text-gray-600 text-xs">05: Auto Calculated (01+02+03+04)</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes Section */}
                {/* <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="h-4 w-4 text-gray-600" />
                            Additional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span>Memo/Footnote for this form</span>
                                <Badge variant="outline" className="text-xs">06</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    )
}