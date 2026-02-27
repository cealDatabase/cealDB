'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const forms = [
  { id: 'monographic', name: '1. Monographs', filename: '1_Monographs' },
  { id: 'volumeHoldings', name: '2. Physical Volume Holdings', filename: '2_VolumeHoldings' },
  { id: 'serials', name: '3. Serial Titles', filename: '3_Serials' },
  { id: 'otherHoldings', name: '4. Holdings of Other Materials', filename: '4_OtherHoldings' },
  { id: 'unprocessed', name: '5. Unprocessed Backlog Materials', filename: '5_GrandTotalHolding' },
  { id: 'fiscal', name: '6. Fiscal Appropriations', filename: '6_FiscalAppropriations' },
  { id: 'personnel', name: '7. Personnel Support', filename: '7_PersonnelSupport' },
  { id: 'publicServices', name: '8. Public Services', filename: '8_PublicServices' },
  { id: 'electronic', name: '9. Electronic', filename: '9_Electronic' },
  { id: 'electronicBooks', name: '10. Electronic Books', filename: '10_ElectronicBooks' }
];

export default function YearEndReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loadingForm, setLoadingForm] = useState<string | null>(null);
  const [exportedForms, setExportedForms] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Generate available years (current year and past 10 years)
    const currentYear = new Date().getFullYear() - 1;
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear - i);
    }
    setAvailableYears(years);
    setSelectedYear(currentYear.toString());
  }, []);

  const handleExport = async (formType: string, formName: string) => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingForm(formType);

    try {
      const response = await fetch(
        `/api/export/year-end-reports?year=${selectedYear}&formType=${formType}`,
        {
          credentials: 'include', // Include cookies for authentication
        }
      );

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Export failed';
        } else {
          // HTML error page or other non-JSON response
          const text = await response.text();
          if (response.status === 401) {
            errorMessage = 'Unauthorized - Please sign in again';
          } else if (response.status === 403) {
            errorMessage = 'Access denied - Super Admin or E-Resource Editor role required';
          } else {
            errorMessage = `Server error (${response.status})`;
          }
          console.error('Non-JSON error response:', text.substring(0, 200));
        }
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formName}-${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportedForms(prev => new Set(prev).add(formType));

      toast.success(`${formName} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setLoadingForm(null);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingForm('pdf');

    try {
      const response = await fetch(
        `/api/export/year-end-pdf?year=${selectedYear}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'PDF export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'PDF export failed';
        } else {
          if (response.status === 401) {
            errorMessage = 'Unauthorized - Please sign in again';
          } else if (response.status === 403) {
            errorMessage = 'Access denied - Super Admin or E-Resource Editor role required';
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CEAL_Statistics_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`PDF report exported successfully for year ${selectedYear}`);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export PDF report');
    } finally {
      setLoadingForm(null);
    }
  };

  const handleExportAll = async () => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingForm('all');

    try {
      const response = await fetch(
        `/api/export/year-end-reports?year=${selectedYear}&formType=all`,
        {
          credentials: 'include', // Include cookies for authentication
        }
      );

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Export failed';
        } else {
          // HTML error page or other non-JSON response
          const text = await response.text();
          if (response.status === 401) {
            errorMessage = 'Unauthorized - Please sign in again';
          } else if (response.status === 403) {
            errorMessage = 'Access denied - Super Admin or E-Resource Editor role required';
          } else {
            errorMessage = `Server error (${response.status})`;
          }
          console.error('Non-JSON error response:', text.substring(0, 200));
        }
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CEAL_Statistics_All_Forms_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mark all forms as exported
      setExportedForms(new Set(forms.map(f => f.id)));

      toast.success(`All forms exported successfully for year ${selectedYear}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export all forms');
    } finally {
      setLoadingForm(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Year-End Reports</h1>
          <p className="text-muted-foreground">
            Generate annual statistics in Excel or PDF format across multiple years and all categories, including data from all participating institutions for the selected year regardless of final submission status. 
          </p>
        </div>

        {/* Year Selection Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Year</CardTitle>
            <CardDescription>Choose the year for which you want to export reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleExportAll}
                disabled={!selectedYear || loadingForm !== null}
                size="lg"
                className="gap-2"
              >
                {loadingForm === 'all' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting All Forms...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export All Forms (Excel)
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={!selectedYear || loadingForm !== null}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                {loadingForm === 'pdf' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Export PDF Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Forms Export */}
        <Card>
          <CardHeader>
            <CardTitle>Export Individual Forms</CardTitle>
            <CardDescription>
              Export each form separately. All exports are in .xlsx format with UTF-8 encoding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {forms.map(form => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{form.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {form.filename}-{selectedYear}.xlsx
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exportedForms.has(form.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <Button
                      onClick={() => handleExport(form.id, form.filename)}
                      disabled={!selectedYear || loadingForm !== null}
                      variant="outline"
                      size="sm"
                    >
                      {loadingForm === form.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                ℹ️
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-900">Export Information</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Individual form exports are in Excel (.xlsx) format with UTF-8 encoding</li>
                  <li>• Each export includes institution names, all data fields, and notes</li>
                  <li>• Excel batch export creates a single file with all 10 forms as separate worksheets</li>
                  <li>• PDF report generates all tables in a single landscape PDF with totals and footnotes</li>
                  <li>• Data is sorted alphabetically by institution name</li>
                  <li>• Empty fields are displayed as blank cells</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
