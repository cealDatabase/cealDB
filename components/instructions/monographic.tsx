import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, Gift, Plus, BookOpen } from "lucide-react"

export function MonographicInstructions() {
  return (
    <div className="space-y-6" id="monographic">
      {/* Header Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Monographic Acquisitions Form
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </CardTitle>
          <CardDescription className="text-base font-medium pl-6">
            Monographic Titles and Volumes Purchased
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
              <p className="text-sm">Report the number of titles and volumes purchased during the fiscal year.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm">
                Include all paid-for items, even if paid in advance but not yet received during the fiscal year.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm">Include monographs in series and continuations.</p>
            </div>
            <div className="flex items-start flex-col gap-1">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-sm">Record figures separately for: </p>
              </div>
              <div className="px-8 text-sm text-gray-600">
                <ul className="list-disc">
                  <li>Purchased Titles (Chinese, Japanese, Korean, Non-CJK, and subtotal)</li>
                  <li>Purchased Volumes (Chinese, Japanese, Korean, Non-CJK, and subtotal)</li>
                  <li>Non-Purchased Titles (gifts and exchanges)</li>
                  <li>Non-Purchased Volumes (gifts and bound periodicals volumes)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calculator className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm">
                No need to fill in subtotal or total fields. The system will calculate these automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Categories */}
      <div className="space-y-4">
        {/* Purchased Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600" />
              Purchased Items
            </CardTitle>
            <CardDescription className="text-sm">Items purchased with library funds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Purchased Titles */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                Purchased Titles
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>Chinese</span>
                  <Badge variant="outline" className="text-xs">
                    01
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Japanese</span>
                  <Badge variant="outline" className="text-xs">
                    02
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Korean</span>
                  <Badge variant="outline" className="text-xs">
                    03
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Non-CJK</span>
                  <Badge variant="outline" className="text-xs">
                    04
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                  <span className="font-medium text-xs">Subtotal</span>
                  <Badge className="bg-green-100/90 text-green-600 text-xs">Auto Calculated: 01+02+03+04</Badge>
                </div>
              </div>
            </div>

            {/* Purchased Volumes */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                Purchased Volumes
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>Chinese</span>
                  <Badge variant="outline" className="text-xs">
                    06
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Japanese</span>
                  <Badge variant="outline" className="text-xs">
                    07
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Korean</span>
                  <Badge variant="outline" className="text-xs">
                    08
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Non-CJK</span>
                  <Badge variant="outline" className="text-xs">
                    09
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                  <span className="font-medium text-xs">Subtotal</span>
                  <Badge className="bg-green-100/90 text-green-600 text-xs">Auto Calculated: 06+07+08+09</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Non-Purchased Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-600" />
              Non-Purchased Items
            </CardTitle>
            <CardDescription className="text-sm">Gifts, exchanges, and bound periodicals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Non-Purchased Titles */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                Non-Purchased Titles
                <Badge variant="secondary" className="text-xs">
                  Gifts & Exchange
                </Badge>
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>Chinese</span>
                  <Badge variant="outline" className="text-xs">
                    11
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Japanese</span>
                  <Badge variant="outline" className="text-xs">
                    12
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Korean</span>
                  <Badge variant="outline" className="text-xs">
                    13
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Non-CJK</span>
                  <Badge variant="outline" className="text-xs">
                    14
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                  <span className="font-medium text-xs">Subtotal</span>
                  <Badge className="bg-purple-100/90 text-purple-600 text-xs">Auto Calculated: 11+12+13+14</Badge>
                </div>
              </div>
            </div>

            {/* Non-Purchased Volumes */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                Non-Purchased Volumes
                <Badge variant="secondary" className="text-xs">
                  Gifts & Periodicals
                </Badge>
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>Chinese</span>
                  <Badge variant="outline" className="text-xs">
                    16
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Japanese</span>
                  <Badge variant="outline" className="text-xs">
                    17
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Korean</span>
                  <Badge variant="outline" className="text-xs">
                    18
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Non-CJK</span>
                  <Badge variant="outline" className="text-xs">
                    19
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-border mt-2 pt-2">
                  <span className="font-medium text-xs">Subtotal</span>
                  <Badge className="bg-purple-100/90 text-purple-600 text-xs">Auto Calculated: 16+17+18+19</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals Summary */}
        <Card className="border-accent bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-blue-500" />
              Final Totals
            </CardTitle>
            <CardDescription className="text-sm">Automatically calculated by the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                <span className="font-medium text-sm">Title Total</span>
                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto Calculated: 05 + 15</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                <span className="font-medium text-sm">Volume Total</span>
                <Badge className="bg-blue-100/90 text-blue-500 text-xs">Auto Calculated: 10 + 20</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
