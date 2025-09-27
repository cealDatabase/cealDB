'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SingleLibraryType } from "@/types/types"

interface LibraryEditFormProps {
  library: SingleLibraryType
  onSave: () => void
  onCancel: () => void
}

interface Region {
  id: number
  libraryregion: string
}

interface LibraryType {
  id: number
  librarytype: string
}

export default function LibraryEditForm({ library, onSave, onCancel }: LibraryEditFormProps) {
  const [formData, setFormData] = useState(library)
  const [regions, setRegions] = useState<Region[]>([])
  const [libraryTypes, setLibraryTypes] = useState<LibraryType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [regionsResponse, typesResponse] = await Promise.all([
          fetch('/api/reference/regions'),
          fetch('/api/reference/library-types')
        ])

        const regionsData = await regionsResponse.json()
        const typesData = await typesResponse.json()

        if (regionsData.success) setRegions(regionsData.data)
        if (typesData.success) setLibraryTypes(typesData.data)
      } catch (err) {
        console.error('Error fetching reference data:', err)
      }
    }

    fetchReferenceData()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/libraries/${library.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        onSave()
      } else {
        setError(result.error || 'Failed to update library')
      }
    } catch (err) {
      setError('Error updating library')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Library Information</span>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" form="library-edit-form" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <form id="library-edit-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="library_name">Library Name *</Label>
              <Input
                id="library_name"
                value={formData.library_name}
                onChange={(e) => handleInputChange('library_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Library Type</Label>
              <Select
                value={formData.type?.toString() || ''}
                onValueChange={(value) => handleInputChange('type', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select library type" />
                </SelectTrigger>
                <SelectContent>
                  {libraryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.librarytype}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pliregion">Library Region</Label>
              <Select
                value={formData.pliregion?.toString() || ''}
                onValueChange={(value) => handleInputChange('pliregion', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.libraryregion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pliestablishedyear">Established Year</Label>
              <Input
                id="pliestablishedyear"
                value={formData.pliestablishedyear || ''}
                onChange={(e) => handleInputChange('pliestablishedyear', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Contact Person</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plisubmitter_first_name">First Name</Label>
                <Input
                  id="plisubmitter_first_name"
                  value={formData.plisubmitter_first_name || ''}
                  onChange={(e) => handleInputChange('plisubmitter_first_name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="plisubmitter_last_name">Last Name</Label>
                <Input
                  id="plisubmitter_last_name"
                  value={formData.plisubmitter_last_name || ''}
                  onChange={(e) => handleInputChange('plisubmitter_last_name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pliposition_title">Position Title</Label>
                <Input
                  id="pliposition_title"
                  value={formData.pliposition_title || ''}
                  onChange={(e) => handleInputChange('pliposition_title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="plie_mail">Email *</Label>
                <Input
                  id="plie_mail"
                  type="email"
                  value={formData.plie_mail || ''}
                  onChange={(e) => handleInputChange('plie_mail', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pliwork_phone">Phone</Label>
                <Input
                  id="pliwork_phone"
                  value={formData.pliwork_phone || ''}
                  onChange={(e) => handleInputChange('pliwork_phone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="plifax_number">Fax</Label>
                <Input
                  id="plifax_number"
                  value={formData.plifax_number || ''}
                  onChange={(e) => handleInputChange('plifax_number', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Technical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plibibliographic">Bibliographic Utilities</Label>
                <Input
                  id="plibibliographic"
                  value={formData.plibibliographic || ''}
                  onChange={(e) => handleInputChange('plibibliographic', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pliconsortia">Networks or Consortia</Label>
                <Input
                  id="pliconsortia"
                  value={formData.pliconsortia || ''}
                  onChange={(e) => handleInputChange('pliconsortia', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="plisystem_vendor">Integrated System Vendor</Label>
                <Input
                  id="plisystem_vendor"
                  value={formData.plisystem_vendor || ''}
                  onChange={(e) => handleInputChange('plisystem_vendor', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="plihome_page">Library Homepage</Label>
                <Input
                  id="plihome_page"
                  type="url"
                  value={formData.plihome_page || ''}
                  onChange={(e) => handleInputChange('plihome_page', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="plionline_catalog">Library Online Catalog</Label>
                <Input
                  id="plionline_catalog"
                  type="url"
                  value={formData.plionline_catalog || ''}
                  onChange={(e) => handleInputChange('plionline_catalog', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Library Characteristics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="plilaw"
                  checked={formData.plilaw}
                  onCheckedChange={(checked) => handleInputChange('plilaw', checked)}
                />
                <Label htmlFor="plilaw">Law Library</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="plimed"
                  checked={formData.plimed}
                  onCheckedChange={(checked) => handleInputChange('plimed', checked)}
                />
                <Label htmlFor="plimed">Medical Library</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pliopac"
                  checked={formData.pliopac || false}
                  onCheckedChange={(checked) => handleInputChange('pliopac', checked)}
                />
                <Label htmlFor="pliopac">OPAC CJK Display Capability</Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
