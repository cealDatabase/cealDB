"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface BasicInfoStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="libraryNumber">Library Number</Label>
          <Input
            id="libraryNumber"
            placeholder="Enter library number"
            value={data.libraryNumber || ""}
            onChange={(e) => handleChange("libraryNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="libraryType">Library Type</Label>
          <Select value={data.libraryType || ""} onValueChange={(value) => handleChange("libraryType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select library type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public Library</SelectItem>
              <SelectItem value="academic">Academic Library</SelectItem>
              <SelectItem value="school">School Library</SelectItem>
              <SelectItem value="special">Special Library</SelectItem>
              <SelectItem value="corporate">Corporate Library</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="libraryName">Library Name</Label>
        <Input
          id="libraryName"
          placeholder="Enter the full library name"
          value={data.libraryName || ""}
          onChange={(e) => handleChange("libraryName", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select value={data.region || ""} onValueChange={(value) => handleChange("region", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="east">East</SelectItem>
              <SelectItem value="west">West</SelectItem>
              <SelectItem value="central">Central</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="established">Established Year</Label>
          <Input
            id="established"
            type="number"
            placeholder="e.g., 1995"
            value={data.established || ""}
            onChange={(e) => handleChange("established", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Library Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the library and its mission"
          rows={4}
          value={data.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
    </div>
  )
}
