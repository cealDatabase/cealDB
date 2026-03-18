'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, CheckCircle2, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

const reports = [
  { id: 'characteristics', name: 'Participating Library Characteristics and Contact Information', filename: 'Library_Characteristics' },
  { id: 'completion', name: 'CEAL Statistics Table Completion', filename: 'Statistics_Completion' }
];

export default function ParticipationReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [exportedReports, setExportedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentYear = new Date().getFullYear() - 1;
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear - i);
    }
    setAvailableYears(years);
    setSelectedYear(currentYear.toString());
  }, []);

  const handleExport = async (reportType: string, reportName: string) => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingReport(reportType);

    try {
      const response = await fetch(
        `/api/export/participation-reports?year=${selectedYear}&reportType=${reportType}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Export failed';
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
      a.download = `${reportName}-${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportedReports(prev => new Set(prev).add(reportType));

      toast.success(`${reportName} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setLoadingReport(null);
    }
  };

  const handleExportWord = async (reportId: string, reportFilename: string) => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingReport(`word-${reportId}`);

    try {
      const response = await fetch(
        `/api/export/participation-reports-word?year=${selectedYear}&reportType=${reportId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Word export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Word export failed';
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
      a.download = `${reportFilename}-${selectedYear}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportedReports(prev => new Set([...prev, reportId]));
      toast.success(`${reportFilename} exported to Word successfully`);
    } catch (error) {
      console.error('Word export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export Word document');
    } finally {
      setLoadingReport(null);
    }
  };

  const handleExportBatchWord = async () => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingReport('batch-word');

    try {
      const response = await fetch(
        `/api/export/participation-reports-word?year=${selectedYear}&reportType=batch`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Export failed';
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
      a.download = `Participation_Reports_Word_${selectedYear}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportedReports(new Set(reports.map(r => r.id)));

      toast.success(`Both reports exported to Word successfully for year ${selectedYear}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export Word reports');
    } finally {
      setLoadingReport(null);
    }
  };

  const handleExportBatch = async () => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingReport('batch');

    try {
      const response = await fetch(
        `/api/export/participation-reports?year=${selectedYear}&reportType=batch`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Export failed';
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
      a.download = `Participation_Reports_${selectedYear}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportedReports(new Set(reports.map(r => r.id)));

      toast.success(`Both reports exported successfully for year ${selectedYear}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export reports');
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Participation Reports</h1>
          <p className="text-muted-foreground">
            Export library participation and statistics completion reports in Excel format.
          </p>
        </div>

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
                onClick={handleExportBatch}
                disabled={!selectedYear || loadingReport !== null}
                size="lg"
                className="gap-2"
              >
                {loadingReport === 'batch' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Excel (Zip)
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportBatchWord}
                disabled={!selectedYear || loadingReport !== null}
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                {loadingReport === 'batch-word' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Word (Zip)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Individual Reports</CardTitle>
            <CardDescription>
              Export each report separately in Excel (.xlsx) or Word (.docx) format with landscape orientation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.filename}-{selectedYear} (.xlsx/.docx)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exportedReports.has(report.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <Button
                      onClick={() => handleExport(report.id, report.filename)}
                      disabled={!selectedYear || loadingReport !== null}
                      variant="outline"
                      size="sm"
                    >
                      {loadingReport === report.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Excel
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleExportWord(report.id, report.filename)}
                      disabled={!selectedYear || loadingReport !== null}
                      variant="secondary"
                      size="sm"
                    >
                      {loadingReport === `word-${report.id}` ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Word
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                ℹ️
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-900">Report Information</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Library Characteristics:</strong> Contact information and institutional details</li>
                  <li>• <strong>Statistics Completion:</strong> Form submission status across all categories</li>
                  <li>• Exports available in Excel (.xlsx) and Word (.docx) formats</li>
                  <li>• Word exports use landscape orientation for better data visibility</li>
                  <li>• Batch export creates a ZIP file containing both reports in selected format</li>
                  <li>• Reports include total library count at the end</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
