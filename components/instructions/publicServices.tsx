import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, Users, BookOpen, ArrowRightLeft, Presentation } from "lucide-react"

export const PublicServicesInstructions = () => {
  return (
    <div className="space-y-6" id="public-services">
      {/* Header Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Users className="h-5 w-5 text-blue-500" />
            Public Services Form
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </CardTitle>
          <CardDescription className="text-base font-medium pl-6">
            Presentations, Reference Transactions, Circulation, and Interlibrary Loans
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
              <p className="text-sm">Report activities related to presentations, reference transactions, circulation, and interlibrary loan (ILL).</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm">Use sampling/estimation if needed. Add note in comments if figures are sampled.</p>
            </div>
            <div className="flex items-start gap-3">
              <Calculator className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <p className="text-sm">No need to fill in subtotal or total fields. The system calculates values automatically.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presentations Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Presentation className="h-5 w-5 text-purple-500" />
            Presentations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Count the total number of class sessions, orientations, tours, and/or bibliographic instruction sessions.</p>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Include:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Multi-session or credit courses (count each session)</li>
                <li>• Both on- and off-site sessions if sponsored by the library</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Exclude:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Meetings held by outside groups in library space</li>
                <li>• Staff training sessions</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Presentation Participants:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Count the number of attendees</li>
                <li>• For multi-session classes with constant enrollment, count each person only once</li>
                <li>• One-on-one instruction should be counted under reference transactions, not presentations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference Transactions Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Reference Transactions
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            See ARL Reference Transaction; ANSI/NISO Z39.7-2013
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Count all information contacts where staff provide knowledge, recommendations, interpretation, or instruction in using information sources.</p>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Include:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Printed/non-printed materials, databases, catalogs</li>
                <li>• External libraries</li>
                <li>• In-person, phone, email, web, and chat interactions</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Exclude:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Purely directional questions (unless combined with reference service, then count as one)</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Duration of the transaction is not a determining factor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interlibrary Loans Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5 text-teal-500" />
            Interlibrary Loans (ILL)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Report requests to other libraries (lending) and from other libraries (borrowing), both filled and unfilled.</p>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Include:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Originals, photocopies, electronic transmission</li>
                <li>• Patron-initiated transactions</li>
                <li>• Document delivery stats when appropriate</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Exclude:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Requests for locally owned/accessible items</li>
                <li>• Transactions between main and branch libraries of the same institution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}