"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, CheckCircle, XCircle, AlertCircle, FileBarChart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FORMS = [
  { id: "monographic", name: "1. Monographic Acquisitions" },
  { id: "volumeHoldings", name: "2. Physical Volume Holdings" },
  { id: "serials", name: "3. Serial Titles" },
  { id: "otherHoldings", name: "4. Holdings of Other Materials" },
  { id: "unprocessed", name: "5. Unprocessed BackLog Materials" },
  { id: "fiscal", name: "6. Fiscal Support" },
  { id: "personnel", name: "7. Personnel Support" },
  { id: "publicServices", name: "8. Public Services" },
  { id: "electronic", name: "9. Electronic" },
  { id: "electronicBooks", name: "10. Electronic Books" },
];

interface Library {
  id: number;
  library_name: string;
}

interface UserInfo {
  roleIds: string[];
  libraryId: number | null;
  libraryName: string | null;
}

export default function InstitutionalReportsPage() {
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    fetchUserInfo();
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    if (userInfo) {
      const isSuperAdminOrEditor = userInfo.roleIds.includes("1") || userInfo.roleIds.includes("3");
      if (isSuperAdminOrEditor) {
        fetchAllLibraries();
      } else if (userInfo.libraryId) {
        setSelectedLibrary(userInfo.libraryId.toString());
      }
    }
  }, [userInfo]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/user-info");
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const fetchAllLibraries = async () => {
    try {
      const response = await fetch("/api/libraries");
      if (response.ok) {
        const result = await response.json();
        const sortedLibraries = (result.data || []).sort((a: Library, b: Library) => 
          a.library_name.localeCompare(b.library_name)
        );
        setLibraries(sortedLibraries);
      }
    } catch (error) {
      console.error("Failed to fetch libraries:", error);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const response = await fetch("/api/available-years");
      if (response.ok) {
        const data = await response.json();
        setAvailableYears(data.years);
      }
    } catch (error) {
      console.error("Failed to fetch available years:", error);
    }
  };

  const handleYearToggle = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleFormToggle = (formId: string) => {
    setSelectedForms((prev) =>
      prev.includes(formId) ? prev.filter((f) => f !== formId) : [...prev, formId]
    );
  };

  const handleSelectAllForms = () => {
    if (selectedForms.length === FORMS.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(FORMS.map((f) => f.id));
    }
  };

  const handleExport = async () => {
    if (!selectedLibrary) {
      toast({
        title: "Selection Required",
        description: "Please select an institution.",
        variant: "destructive",
      });
      return;
    }

    if (selectedYears.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one year.",
        variant: "destructive",
      });
      return;
    }

    if (selectedForms.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one form.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setExportStatus("generating");
    setErrorMessage("");

    try {
      const response = await fetch("/api/export-institutional-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libraryId: parseInt(selectedLibrary),
          years: selectedYears,
          forms: selectedForms,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const libraryName = libraries.find(l => l.id.toString() === selectedLibrary)?.library_name || userInfo?.libraryName || "Institution";
      const fileName = `${libraryName.replace(/[^a-z0-9]/gi, '_')}_Report_${selectedYears.join('-')}.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus("success");
      toast({
        title: "Export Successful",
        description: `Report downloaded successfully: ${fileName}`,
      });

      setTimeout(() => setExportStatus("idle"), 3000);
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate report");
      toast({
        title: "Export Failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdminOrEditor = userInfo?.roleIds.includes("1") || userInfo?.roleIds.includes("3");
  const canSelectLibrary = isSuperAdminOrEditor && libraries.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileBarChart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Institutional Reports</h1>
                <p className="text-muted-foreground">Export cross-year statistics reports in Excel format</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                {isSuperAdminOrEditor
                  ? "Select an institution, years, and forms to generate a comprehensive report"
                  : "Select years and forms to generate a report for your institution"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {canSelectLibrary && (
                <div className="space-y-2">
                  <Label htmlFor="library">Institution *</Label>
                  <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                    <SelectTrigger id="library">
                      <SelectValue placeholder="Select an institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {libraries.map((library) => (
                        <SelectItem key={library.id} value={library.id.toString()}>
                          {library.library_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!canSelectLibrary && userInfo?.libraryName && (
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{userInfo.libraryName}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Select Years *</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {availableYears.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={selectedYears.includes(year)}
                        onCheckedChange={() => handleYearToggle(year)}
                      />
                      <Label htmlFor={`year-${year}`} className="cursor-pointer">
                        {year}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedYears.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedYears.length} year{selectedYears.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Forms *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllForms}
                  >
                    {selectedForms.length === FORMS.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {FORMS.map((form) => (
                    <div key={form.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`form-${form.id}`}
                        checked={selectedForms.includes(form.id)}
                        onCheckedChange={() => handleFormToggle(form.id)}
                      />
                      <Label htmlFor={`form-${form.id}`} className="cursor-pointer">
                        {form.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedForms.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedForms.length} form{selectedForms.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {exportStatus === "generating" && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Generating your report... This may take a moment.
                  </AlertDescription>
                </Alert>
              )}

              {exportStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    Report generated successfully! Your download should start automatically.
                  </AlertDescription>
                </Alert>
              )}

              {exportStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-900">
                    {errorMessage || "Failed to generate report. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Report will be exported in .xlsx format with UTF-8 encoding
                  </p>
                </div>
                <Button
                  onClick={handleExport}
                  disabled={loading || !selectedLibrary || selectedYears.length === 0 || selectedForms.length === 0}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
