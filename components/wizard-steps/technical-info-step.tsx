"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface TechnicalInfoStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function TechnicalInfoStep({ data, onUpdate }: TechnicalInfoStepProps) {
  const handleChange = (field: string, value: string | boolean) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="integratedSystem">Integrated Library System</Label>
        <Input
          id="integratedSystem"
          placeholder="e.g., Koha, Evergreen, Symphony"
          value={data.integratedSystem || ""}
          onChange={(e) => handleChange("integratedSystem", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="onlineCatalog">Online Catalog URL</Label>
        <Input
          id="onlineCatalog"
          type="url"
          placeholder="https://catalog.library.org"
          value={data.onlineCatalog || ""}
          onChange={(e) => handleChange("onlineCatalog", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="opacCapability">OPAC Capability</Label>
          <Select value={data.opacCapability || ""} onValueChange={(value) => handleChange("opacCapability", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select OPAC type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic Search</SelectItem>
              <SelectItem value="advanced">Advanced Search</SelectItem>
              <SelectItem value="discovery">Discovery Layer</SelectItem>
              <SelectItem value="federated">Federated Search</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bibliographicUtilities">Bibliographic Utilities</Label>
          <Input
            id="bibliographicUtilities"
            placeholder="e.g., OCLC, SkyRiver"
            value={data.bibliographicUtilities || ""}
            onChange={(e) => handleChange("bibliographicUtilities", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Digital Services</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wifi"
              checked={data.hasWifi || false}
              onCheckedChange={(checked) => handleChange("hasWifi", checked)}
            />
            <Label htmlFor="wifi" className="text-sm font-normal">
              Public WiFi Access
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="computers"
              checked={data.hasComputers || false}
              onCheckedChange={(checked) => handleChange("hasComputers", checked)}
            />
            <Label htmlFor="computers" className="text-sm font-normal">
              Public Computer Access
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="printing"
              checked={data.hasPrinting || false}
              onCheckedChange={(checked) => handleChange("hasPrinting", checked)}
            />
            <Label htmlFor="printing" className="text-sm font-normal">
              Printing Services
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="digitalArchive"
              checked={data.hasDigitalArchive || false}
              onCheckedChange={(checked) => handleChange("hasDigitalArchive", checked)}
            />
            <Label htmlFor="digitalArchive" className="text-sm font-normal">
              Digital Archive
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
