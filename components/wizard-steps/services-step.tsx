"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ServicesStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ServicesStep({ data, onUpdate }: ServicesStepProps) {
  const handleChange = (field: string, value: string | boolean | number) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="totalStaff">Total Staff Count</Label>
          <Input
            id="totalStaff"
            type="number"
            placeholder="Number of staff members"
            value={data.totalStaff || ""}
            onChange={(e) => handleChange("totalStaff", Number.parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalStaff">Professional Librarians</Label>
          <Input
            id="professionalStaff"
            type="number"
            placeholder="Number of professional librarians"
            value={data.professionalStaff || ""}
            onChange={(e) => handleChange("professionalStaff", Number.parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="operatingHours">Operating Hours</Label>
        <Textarea
          id="operatingHours"
          placeholder="e.g., Monday-Friday: 9AM-8PM, Saturday: 10AM-6PM, Sunday: 1PM-5PM"
          rows={3}
          value={data.operatingHours || ""}
          onChange={(e) => handleChange("operatingHours", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Services Offered</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="referenceService"
              checked={data.hasReferenceService || false}
              onCheckedChange={(checked) => handleChange("hasReferenceService", checked)}
            />
            <Label htmlFor="referenceService" className="text-sm font-normal">
              Reference Services
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="researchAssistance"
              checked={data.hasResearchAssistance || false}
              onCheckedChange={(checked) => handleChange("hasResearchAssistance", checked)}
            />
            <Label htmlFor="researchAssistance" className="text-sm font-normal">
              Research Assistance
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="interlibraryLoan"
              checked={data.hasInterlibraryLoan || false}
              onCheckedChange={(checked) => handleChange("hasInterlibraryLoan", checked)}
            />
            <Label htmlFor="interlibraryLoan" className="text-sm font-normal">
              Interlibrary Loan
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="programsEvents"
              checked={data.hasProgramsEvents || false}
              onCheckedChange={(checked) => handleChange("hasProgramsEvents", checked)}
            />
            <Label htmlFor="programsEvents" className="text-sm font-normal">
              Programs & Events
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="meetingRooms"
              checked={data.hasMeetingRooms || false}
              onCheckedChange={(checked) => handleChange("hasMeetingRooms", checked)}
            />
            <Label htmlFor="meetingRooms" className="text-sm font-normal">
              Meeting Rooms
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="studySpaces"
              checked={data.hasStudySpaces || false}
              onCheckedChange={(checked) => handleChange("hasStudySpaces", checked)}
            />
            <Label htmlFor="studySpaces" className="text-sm font-normal">
              Study Spaces
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="childrenPrograms"
              checked={data.hasChildrenPrograms || false}
              onCheckedChange={(checked) => handleChange("hasChildrenPrograms", checked)}
            />
            <Label htmlFor="childrenPrograms" className="text-sm font-normal">
              Children's Programs
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="digitalLiteracy"
              checked={data.hasDigitalLiteracy || false}
              onCheckedChange={(checked) => handleChange("hasDigitalLiteracy", checked)}
            />
            <Label htmlFor="digitalLiteracy" className="text-sm font-normal">
              Digital Literacy Training
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialServices">Special Services & Notes</Label>
        <Textarea
          id="specialServices"
          placeholder="Any additional services, accessibility features, or special programs"
          rows={4}
          value={data.specialServices || ""}
          onChange={(e) => handleChange("specialServices", e.target.value)}
        />
      </div>
    </div>
  )
}
