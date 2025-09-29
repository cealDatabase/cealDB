"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CheckCircle, Edit } from "lucide-react"

interface ReviewStepProps {
  data: any
}

export function ReviewStep({ data }: ReviewStepProps) {
  const handleSubmit = () => {
    console.log("Submitting library data:", data)
    // Handle form submission here
  }

  const renderSection = (title: string, fields: Array<{ label: string; value: any; type?: string }>) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Edit className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground font-medium">{field.label}:</span>
            <span className="text-sm text-right max-w-xs">
              {field.type === "boolean" ? (
                field.value ? (
                  <Badge variant="secondary">Yes</Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )
              ) : field.type === "array" ? (
                <div className="flex flex-wrap gap-1">
                  {field.value?.map((item: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                field.value || <span className="text-muted-foreground">Not specified</span>
              )}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Review Your Information</h3>
        <p className="text-muted-foreground">Please review all details before submitting</p>
      </div>

      {renderSection("Basic Information", [
        { label: "Library Name", value: data.libraryName },
        { label: "Library Number", value: data.libraryNumber },
        { label: "Library Type", value: data.libraryType },
        { label: "Region", value: data.region },
        { label: "Established", value: data.established },
        { label: "Description", value: data.description },
      ])}

      {renderSection("Contact Information", [
        { label: "Primary Contact", value: data.contactName },
        { label: "Title", value: data.contactTitle },
        { label: "Phone", value: data.phone },
        { label: "Email", value: data.email },
        { label: "Website", value: data.website },
        { label: "Address", value: data.address },
      ])}

      {renderSection("Technical Setup", [
        { label: "Integrated System", value: data.integratedSystem },
        { label: "Online Catalog", value: data.onlineCatalog },
        { label: "OPAC Capability", value: data.opacCapability },
        { label: "WiFi Access", value: data.hasWifi, type: "boolean" },
        { label: "Public Computers", value: data.hasComputers, type: "boolean" },
        { label: "Printing Services", value: data.hasPrinting, type: "boolean" },
      ])}

      {renderSection("Collection & Services", [
        { label: "Collection Size", value: data.collectionSize },
        { label: "Annual Budget", value: data.annualBudget ? `$${data.annualBudget}` : null },
        { label: "Total Staff", value: data.totalStaff },
        { label: "Professional Librarians", value: data.professionalStaff },
        { label: "Reference Services", value: data.hasReferenceService, type: "boolean" },
        { label: "Research Assistance", value: data.hasResearchAssistance, type: "boolean" },
        { label: "Interlibrary Loan", value: data.hasInterlibraryLoan, type: "boolean" },
      ])}

      <Separator />

      <div className="flex justify-center">
        <Button onClick={handleSubmit} size="lg" className="px-8">
          Create Library Profile
        </Button>
      </div>
    </div>
  )
}
