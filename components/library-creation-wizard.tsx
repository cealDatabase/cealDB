"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { BasicInfoStep } from "./wizard-steps/basic-info-step"
import { ContactInfoStep } from "./wizard-steps/contact-info-step"
import { TechnicalInfoStep } from "./wizard-steps/technical-info-step"
import { CollectionStep } from "./wizard-steps/collection-step"
import { ServicesStep } from "./wizard-steps/services-step"
import { ReviewStep } from "./wizard-steps/review-step"

const steps = [
  { id: "basic", title: "Basic Information", description: "Library details and type" },
  { id: "contact", title: "Contact Information", description: "Location and contact details" },
  { id: "technical", title: "Technical Setup", description: "Systems and capabilities" },
  { id: "collection", title: "Collection Details", description: "Administration and policies" },
  { id: "services", title: "Services & Staff", description: "Building and services offered" },
  { id: "review", title: "Review & Submit", description: "Confirm your information" },
]

export function LibraryCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const updateFormData = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => [...prev.filter((s) => s !== currentStep), currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps, -1) + 1) {
      setCurrentStep(stepIndex)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep data={formData} onUpdate={updateFormData} />
      case 1:
        return <ContactInfoStep data={formData} onUpdate={updateFormData} />
      case 2:
        return <TechnicalInfoStep data={formData} onUpdate={updateFormData} />
      case 3:
        return <CollectionStep data={formData} onUpdate={updateFormData} />
      case 4:
        return <ServicesStep data={formData} onUpdate={updateFormData} />
      case 5:
        return <ReviewStep data={formData} />
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Create a New Library</h1>
        <p className="text-muted-foreground text-pretty">
          Set up your library profile with all the essential information and services
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                index === currentStep
                  ? "text-primary"
                  : index <= Math.max(...completedSteps, -1)
                    ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-muted-foreground/50 cursor-not-allowed"
              }`}
              disabled={index > Math.max(...completedSteps, -1) + 1}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                  completedSteps.includes(index)
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30"
                }`}
              >
                {completedSteps.includes(index) ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="hidden sm:block font-medium">{step.title}</span>
              <span className="hidden md:block text-xs text-muted-foreground">{step.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button onClick={handleNext} disabled={currentStep === steps.length - 1} className="flex items-center gap-2">
          {currentStep === steps.length - 1 ? "Submit" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
