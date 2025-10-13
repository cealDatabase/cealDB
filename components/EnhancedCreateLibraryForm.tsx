"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronLeft, ChevronRight, Check, Building2, User, Globe } from "lucide-react";
import { SingleLibraryType, Reflibraryregion, Reflibrarytype } from "@/types/types";


const steps = [
  { id: "basic", title: "Basic Information", description: "Library details and type", icon: Building2 },
  { id: "contact", title: "Contact Information", description: "Location and contact details", icon: User },
  { id: "technical", title: "Technical Setup", description: "Systems and capabilities", icon: Globe },
  { id: "collection", title: "Collection Details", description: "Administration and policies", icon: Building2 },
  { id: "review", title: "Review & Submit", description: "Confirm your information", icon: Check },
];

type MyChildComponentProps = {
  data: any[];
};

export function EnhancedCreateLibraryForm({ data }: MyChildComponentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // State for the form
  const [formData, setFormData] = useState<Partial<SingleLibraryType>>({
    library_name: "",
    type: 0,
    plilaw: false,
    plimed: false,
    plisubmitter_first_name: null,
    plisubmitter_last_name: null,
    pliposition_title: null,
    pliwork_phone: null,
    plie_mail: "",
    plifax_number: null,
    pliinput_as_of_date: null,
    password: null,
    hideinlibrarylist: false,
    pliregion: null,
    pliestablishedyear: null,
    plibibliographic: null,
    pliconsortia: null,
    pliopac: false,
    plihome_page: null,
    plionline_catalog: null,
    plisystem_vendor: null,
  });

  // State for dropdown options
  const [libraryTypes, setLibraryTypes] = useState<Reflibrarytype[]>([]);
  const [libaryRegions, setLibraryRegions] = useState<Reflibraryregion[]>([]);

  // State for collection_librarian_groups
  const [librarianGroups, setLibrarianGroups] = useState<string[]>([]);
  const [acquisitionTypes, setAcquisitionTypes] = useState<string[]>([]);
  const [catalogingTypes, setCatalogingTypes] = useState<string[]>([]);
  const [circulationTypes, setCirculationTypes] = useState<string[]>([]);

  // Options
  const librarianGroupOptions = [
    "International/global studies",
    "Subject librarians/consultant group",
    "Collection development",
    "Research and learning group",
    "Technical processing group",
    "Public services group",
    "Special collections group",
    'Other (input additional information in "Notes" box at the end of this form)',
  ];

  const acquisitionOptions = ["On Site", "Centralized", "Out-sourced"];
  const catalogingOptions = ["On Site", "Centralized", "Out-sourced"];
  const circulationOptions = ["On Site", "Centralized"];

  useEffect(() => {
    const fetchLibraryTypesandRegions = async () => {
      setLibraryTypes(await data[0]);
      setLibraryRegions(await data[1]);
    };
    fetchLibraryTypesandRegions();
  }, [data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && name === "collection_librarians_groups") {
      let updatedLibrarianGroups;
      if (librarianGroups.includes(value)) {
        updatedLibrarianGroups = librarianGroups.filter((item) => item !== value);
      } else {
        updatedLibrarianGroups = [...librarianGroups, value];
      }
      setLibrarianGroups(updatedLibrarianGroups);
      const responseString = updatedLibrarianGroups.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        collection_librarians_groups: responseString,
      }));
    } else if (type === "checkbox" && name === "acquisition_type") {
      let updatedAcquisitionTypes;
      if (acquisitionTypes.includes(value)) {
        updatedAcquisitionTypes = acquisitionTypes.filter((item) => item !== value);
      } else {
        updatedAcquisitionTypes = [...acquisitionTypes, value];
      }
      setAcquisitionTypes(updatedAcquisitionTypes);
      const responseStringAcquisition = updatedAcquisitionTypes.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        acquisition_type: responseStringAcquisition,
      }));
    } else if (type === "checkbox" && name === "cataloging_type") {
      let updatedCatalogingTypes;
      if (catalogingTypes.includes(value)) {
        updatedCatalogingTypes = catalogingTypes.filter((item) => item !== value);
      } else {
        updatedCatalogingTypes = [...catalogingTypes, value];
      }
      setCatalogingTypes(updatedCatalogingTypes);
      const responseStringCataloging = updatedCatalogingTypes.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        cataloging_type: responseStringCataloging,
      }));
    } else if (type === "checkbox" && name === "circulation_type") {
      let updatedCirculationTypes;
      if (circulationTypes.includes(value)) {
        updatedCirculationTypes = circulationTypes.filter((item) => item !== value);
      } else {
        updatedCirculationTypes = [...circulationTypes, value];
      }
      setCirculationTypes(updatedCirculationTypes);
      const responseStringCirculation = updatedCirculationTypes.join(", ");
      setFormData((prevFormData) => ({
        ...prevFormData,
        circulation_type: responseStringCirculation,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => [...prev.filter((s) => s !== currentStep), currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps, -1) + 1) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error submitting the form");
      }

      const result = await res.json();
      console.log("Library created:", result);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        window.location.href = '/admin'; // Redirect to admin page
      }, 2000);
      
    } catch (error) {
      console.error("Error creating library:", error);
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1>Create a New Library</h1>
        <p className="text-muted-foreground text-pretty">
          Set up your library profile with all the essential information and services
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
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
                  {completedSteps.includes(index) ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:block font-medium">{step.title}</span>
                <span className="hidden md:block text-xs text-muted-foreground">{step.description}</span>
              </button>
            );
          })}
        </div>
      </div>

        <form onSubmit={handleSubmit}>
          {/* Error and Success Messages */}
          {submitError && (
            <Card className="mb-4 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-800">
                  <span className="font-medium">Error: </span>
                  <span className="ml-2">{submitError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {submitSuccess && (
            <Card className="mb-4 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-800">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">Library created successfully! Redirecting...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Library Number */}
                  <div className="sm:col-span-1">
                    <label htmlFor="library_number" className="block text-sm font-medium mb-2">
                      Library Number
                    </label>
                    <input
                      id="library_number"
                      name="library_number"
                      type="text"
                      placeholder="4-digit library number"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.library_number ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Library Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="library_name" className="block text-sm font-medium mb-2">
                      Library Name
                    </label>
                    <input
                      id="library_name"
                      name="library_name"
                      type="text"
                      placeholder="Library full name"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.library_name ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Library Type */}
                  <div className="sm:col-span-1">
                    <label htmlFor="type" className="block text-sm font-medium mb-2">
                      Library Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.type ?? ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a library type</option>
                      {libraryTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.librarytype}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Library Region */}
                  <div className="sm:col-span-1">
                    <label htmlFor="pliregion" className="block text-sm font-medium mb-2">
                      Library Region
                    </label>
                    <select
                      id="pliregion"
                      name="pliregion"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.pliregion ?? ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a region</option>
                      {libaryRegions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.libraryregion}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hide in library listing */}
                  <div className="sm:col-span-1">
                    <label htmlFor="hideinlibrarylist" className="block text-sm font-medium mb-2">
                      Hide in library Listing?
                    </label>
                    <select
                      id="hideinlibrarylist"
                      name="hideinlibrarylist"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.hideinlibrarylist ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          hideinlibrarylist: value === "true",
                        }));
                      }}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>

                  {/* Established Year */}
                  <div className="sm:col-span-1">
                    <label htmlFor="pliestablishedyear" className="block text-sm font-medium mb-2">
                      Established Year (4-digit)
                    </label>
                    <input
                      id="pliestablishedyear"
                      name="pliestablishedyear"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.pliestablishedyear ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Law */}
                  <div className="sm:col-span-1">
                    <label htmlFor="plilaw" className="block text-sm font-medium mb-2">
                      Law
                    </label>
                    <select
                      id="plilaw"
                      name="plilaw"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plilaw ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          plilaw: value === "true",
                        }));
                      }}
                      required
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>

                  {/* Medical */}
                  <div className="sm:col-span-1">
                    <label htmlFor="plimed" className="block text-sm font-medium mb-2">
                      Medical
                    </label>
                    <select
                      id="plimed"
                      name="plimed"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plimed ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          plimed: value === "true",
                        }));
                      }}
                      required
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Contact Information Fields */}
                  <div className="sm:col-span-1">
                    <label htmlFor="plisubmitter_first_name" className="block text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      id="plisubmitter_first_name"
                      name="plisubmitter_first_name"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plisubmitter_first_name ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="plisubmitter_last_name" className="block text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      id="plisubmitter_last_name"
                      name="plisubmitter_last_name"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plisubmitter_last_name ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="pliposition_title" className="block text-sm font-medium mb-2">
                      Position Title
                    </label>
                    <input
                      id="pliposition_title"
                      name="pliposition_title"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.pliposition_title ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="pliwork_phone" className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      id="pliwork_phone"
                      name="pliwork_phone"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.pliwork_phone ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="plie_mail" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      id="plie_mail"
                      name="plie_mail"
                      type="email"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plie_mail ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="plifax_number" className="block text-sm font-medium mb-2">
                      Fax Number
                    </label>
                    <input
                      id="plifax_number"
                      name="plifax_number"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plifax_number ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Technical Setup Fields */}
                  <div className="sm:col-span-2">
                    <label htmlFor="plihome_page" className="block text-sm font-medium mb-2">
                      Library Home Page
                    </label>
                    <input
                      id="plihome_page"
                      name="plihome_page"
                      type="url"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plihome_page ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="plionline_catalog" className="block text-sm font-medium mb-2">
                      Online Catalog
                    </label>
                    <input
                      id="plionline_catalog"
                      name="plionline_catalog"
                      type="url"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plionline_catalog ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="plibibliographic" className="block text-sm font-medium mb-2">
                      Bibliographic Utilities
                    </label>
                    <input
                      id="plibibliographic"
                      name="plibibliographic"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plibibliographic ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="pliconsortia" className="block text-sm font-medium mb-2">
                      Networks or Consortia
                    </label>
                    <input
                      id="pliconsortia"
                      name="pliconsortia"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.pliconsortia ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="plisystem_vendor" className="block text-sm font-medium mb-2">
                      Integrated System Vendor
                    </label>
                    <input
                      id="plisystem_vendor"
                      name="plisystem_vendor"
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.plisystem_vendor ?? ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="pliopac" className="block text-sm font-medium mb-2">
                      OPAC Capability of CJK Display
                    </label>
                    <select
                      id="pliopac"
                      name="pliopac"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={formData.pliopac ? "true" : "false"}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prevData) => ({
                          ...prevData,
                          pliopac: value === "true",
                        }));
                      }}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Institutional Structure of Your East Asian Collection</h3>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="collection_title" className="block text-sm font-medium mb-2">
                          Full title of East Asian collection
                        </label>
                        <input
                          id="collection_title"
                          name="collection_title"
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={formData.collection_title ?? ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-base font-medium mb-3">Collection Administration</h4>
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor="collection_incharge_title" className="block text-sm font-medium mb-2">
                          Position title in charge of East Asian collection
                        </label>
                        <input
                          id="collection_incharge_title"
                          name="collection_incharge_title"
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={formData.collection_incharge_title ?? ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor="collection_head_reports_to" className="block text-sm font-medium mb-2">
                          Head of E.Asian collection reports to what position title
                        </label>
                        <input
                          id="collection_head_reports_to"
                          name="collection_head_reports_to"
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={formData.collection_head_reports_to ?? ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-base font-medium mb-3">Collection Librarian Groups</h4>
                        <div className="space-y-2">
                          {librarianGroupOptions.map((option) => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="collection_librarians_groups"
                                value={option}
                                checked={librarianGroups.includes(option)}
                                onChange={handleInputChange}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-base font-medium mb-3">Acquisitions (Order and Receiving)</h4>
                        <div className="space-y-2">
                          {acquisitionOptions.map((option) => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="acquisition_type"
                                value={option}
                                checked={acquisitionTypes.includes(option)}
                                onChange={handleInputChange}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-base font-medium mb-3">Cataloging and Processing</h4>
                        <div className="space-y-2">
                          {catalogingOptions.map((option) => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="cataloging_type"
                                value={option}
                                checked={catalogingTypes.includes(option)}
                                onChange={handleInputChange}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <h4 className="text-base font-medium mb-3">Circulation</h4>
                        <div className="space-y-2">
                          {circulationOptions.map((option) => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="circulation_type"
                                value={option}
                                checked={circulationTypes.includes(option)}
                                onChange={handleInputChange}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="pliinput_as_of_date" className="block text-sm font-medium mb-2">
                          Date Last Changed
                        </label>
                        <DatePicker
                          date={selectedDate}
                          onDateChange={(newDate) => {
                            setSelectedDate(newDate);
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              pliinput_as_of_date: newDate || null,
                            }));
                          }}
                          placeholder="Select date last changed"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium mb-2">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={4}
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={formData.notes ?? ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Review Your Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium">Library Name:</span> {formData.library_name || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Library Number:</span> {formData.library_number || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {libraryTypes.find(t => t.id === Number(formData.type))?.librarytype || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Region:</span> {libaryRegions.find(r => r.id === Number(formData.pliregion))?.libraryregion || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {formData.plie_mail || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {formData.pliwork_phone || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Date Last Changed:</span> {formData.pliinput_as_of_date ? new Date(formData.pliinput_as_of_date).toLocaleDateString() : "Not specified"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button 
                type="submit" 
                disabled={isSubmitting || submitSuccess}
                className="flex items-center gap-2"
              >
                {isSubmitting ? "Creating..." : submitSuccess ? "Created!" : "Submit"}
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
    </div>
  );
}
