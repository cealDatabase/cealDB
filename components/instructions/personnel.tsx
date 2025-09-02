import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Info, Calculator, Users, GraduationCap, UserCheck, Building } from "lucide-react"

export const PersonnelInstructions = () => {
  return (
    <div className="space-y-6" id="personnel">
      {/* Header Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Users className="h-5 w-5 text-blue-500" />
            Personnel Support Form
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </CardTitle>
          <CardDescription className="text-base font-medium pl-6">
            Full-Time Equivalent Staff and Language Expertise
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
              <p className="text-sm">Report the number of FTE (full-time equivalent) staff, including filled positions and those that are only temporarily vacant.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm">Use decimals where appropriate (e.g., 0.5 FTE).</p>
            </div>
            <div className="flex items-start gap-3">
              <Calculator className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <p className="text-sm">No need to fill in subtotal or total fields. The system will calculate them automatically.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Assignment Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-purple-500" />
            Language Assignment Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">For staff working across multiple languages:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Option 1:</strong> Estimate the percentage split under each CJK language</li>
              <li>• <strong>Option 2:</strong> Report them under East Asian fields</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Professional Staff Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-green-500" />
            Professional Staff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Staff your library considers professional.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-2">Fields 01-04:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 01. Professional Chinese</li>
                  <li>• 02. Professional Japanese</li>
                  <li>• 03. Professional Korean</li>
                  <li>• 04. Professional East Asian</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Field 05:</p>
                <p className="text-sm text-blue-700">Professional Total (auto-calculated)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Staff Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-orange-500" />
            Support Staff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Staff not included as professional staff.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-2">Fields 06-09:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 06. Support Chinese</li>
                  <li>• 07. Support Japanese</li>
                  <li>• 08. Support Korean</li>
                  <li>• 09. Support East Asian</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Field 10:</p>
                <p className="text-sm text-blue-700">Support Total (auto-calculated)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Assistants Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            Student Assistants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Total FTE of student assistants employed hourly, paid either from library funds or other institutional budgets (including work-study programs).</p>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Exclude:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Maintenance and custodial staff</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-2">Fields 11-14:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 11. Student Chinese</li>
                  <li>• 12. Student Japanese</li>
                  <li>• 13. Student Korean</li>
                  <li>• 14. Student East Asian</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Field 15:</p>
                <p className="text-sm text-blue-700">Student Total (auto-calculated)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Others and Totals Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5 text-teal-500" />
            Others & Totals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-2">Field 16 - Others, FTE:</p>
              <p className="text-sm text-gray-700">Staff in the parent institution significantly involved in processing/servicing East Asian materials or hired for special projects.</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Field 17 - Total Personnel:</p>
              <p className="text-sm text-blue-700">Auto-calculated: Professional Total + Support Total + Student Total + Others</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outsourcing Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5 text-amber-500" />
            Outsourcing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-2">Field 18 - Acquisition Outsourcing:</p>
                <p className="text-sm text-gray-700">Select Yes or No</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-2">Field 19 - Processing Outsourcing:</p>
                <p className="text-sm text-gray-700">Select Yes or No</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}