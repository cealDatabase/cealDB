"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface CollectionStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function CollectionStep({ data, onUpdate }: CollectionStepProps) {
  const handleChange = (field: string, value: string | boolean) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="collectionSize">Total Collection Size</Label>
          <Input
            id="collectionSize"
            type="number"
            placeholder="Number of items"
            value={data.collectionSize || ""}
            onChange={(e) => handleChange("collectionSize", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualBudget">Annual Collection Budget</Label>
          <Input
            id="annualBudget"
            type="number"
            placeholder="Budget in USD"
            value={data.annualBudget || ""}
            onChange={(e) => handleChange("annualBudget", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="collectionPolicy">Collection Development Policy</Label>
        <Textarea
          id="collectionPolicy"
          placeholder="Brief overview of collection development guidelines and focus areas"
          rows={4}
          value={data.collectionPolicy || ""}
          onChange={(e) => handleChange("collectionPolicy", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Collection Types</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="books"
              checked={data.hasBooks || false}
              onCheckedChange={(checked) => handleChange("hasBooks", checked)}
            />
            <Label htmlFor="books" className="text-sm font-normal">
              Books & Monographs
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="periodicals"
              checked={data.hasPeriodicals || false}
              onCheckedChange={(checked) => handleChange("hasPeriodicals", checked)}
            />
            <Label htmlFor="periodicals" className="text-sm font-normal">
              Periodicals & Journals
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="multimedia"
              checked={data.hasMultimedia || false}
              onCheckedChange={(checked) => handleChange("hasMultimedia", checked)}
            />
            <Label htmlFor="multimedia" className="text-sm font-normal">
              Multimedia Resources
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="digitalResources"
              checked={data.hasDigitalResources || false}
              onCheckedChange={(checked) => handleChange("hasDigitalResources", checked)}
            />
            <Label htmlFor="digitalResources" className="text-sm font-normal">
              Digital Resources
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="specialCollections"
              checked={data.hasSpecialCollections || false}
              onCheckedChange={(checked) => handleChange("hasSpecialCollections", checked)}
            />
            <Label htmlFor="specialCollections" className="text-sm font-normal">
              Special Collections
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="archives"
              checked={data.hasArchives || false}
              onCheckedChange={(checked) => handleChange("hasArchives", checked)}
            />
            <Label htmlFor="archives" className="text-sm font-normal">
              Archives & Manuscripts
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalogingStandards">Cataloging Standards</Label>
        <Select
          value={data.catalogingStandards || ""}
          onValueChange={(value) => handleChange("catalogingStandards", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cataloging standards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aacr2">AACR2</SelectItem>
            <SelectItem value="rda">RDA (Resource Description and Access)</SelectItem>
            <SelectItem value="dublin-core">Dublin Core</SelectItem>
            <SelectItem value="marc21">MARC 21</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
