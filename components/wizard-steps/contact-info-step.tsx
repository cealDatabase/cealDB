"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContactInfoStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ContactInfoStep({ data, onUpdate }: ContactInfoStepProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactName">Primary Contact Name</Label>
          <Input
            id="contactName"
            placeholder="Full name of primary contact"
            value={data.contactName || ""}
            onChange={(e) => handleChange("contactName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactTitle">Contact Title</Label>
          <Input
            id="contactTitle"
            placeholder="e.g., Head Librarian"
            value={data.contactTitle || ""}
            onChange={(e) => handleChange("contactTitle", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fax">Fax Number</Label>
          <Input
            id="fax"
            type="tel"
            placeholder="+1 (555) 123-4568"
            value={data.fax || ""}
            onChange={(e) => handleChange("fax", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@library.org"
          value={data.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Library Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://www.library.org"
          value={data.website || ""}
          onChange={(e) => handleChange("website", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Physical Address</Label>
        <Textarea
          id="address"
          placeholder="Complete mailing address including street, city, state, and postal code"
          rows={3}
          value={data.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>
    </div>
  )
}
