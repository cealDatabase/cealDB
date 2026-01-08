'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const supplementaryReports = [
  { id: 'organizational', name: 'Participating Libraries Organizational Structure and Operation Status', filename: 'Organizational_Structure' },
  { id: 'av', name: 'Audio/Visual Database', filename: 'AudioVisual_Database' },
  { id: 'ebook', name: 'E-Book Database', filename: 'EBook_Database' },
  { id: 'ejournal', name: 'E-Journal Database', filename: 'EJournal_Database' }
];

export default function SupplementaryReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loadingSupplementary, setLoadingSupplementary] = useState<string | null>(null);
  const [exportedSupplementary, setExportedSupplementary] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentYear = new Date().getFullYear() - 1;
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear - i);
    }
    setAvailableYears(years);
    setSelectedYear(currentYear.toString());
  }, []);

  const handleExportSupplementary = async (reportType: string, reportName: string) => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingSupplementary(reportType);

    try {
      const response = await fetch(
        `/api/export/supplementary-reports?year=${selectedYear}&reportType=${reportType}`,
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

      setExportedSupplementary(prev => new Set(prev).add(reportType));

      toast.success(`${reportName} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setLoadingSupplementary(null);
    }
  };

  const handleExportSupplementaryBatch = async () => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoadingSupplementary('batch');

    try {
      const response = await fetch(
        `/api/export/supplementary-reports?year=${selectedYear}&reportType=batch`,
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
      a.download = `Supplementary_Reports_${selectedYear}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportedSupplementary(new Set(supplementaryReports.map(r => r.id)));

      toast.success(`All supplementary reports exported successfully for year ${selectedYear}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export reports');
    } finally {
      setLoadingSupplementary(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Supplementary Reports</h1>
          <p className="text-muted-foreground">
            Export library organizational structure and global collection information by year.
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
                onClick={handleExportSupplementaryBatch}
                disabled={!selectedYear || loadingSupplementary !== null}
                size="lg"
                className="gap-2"
              >
                {loadingSupplementary === 'batch' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting All Reports...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export All 4 Reports (Zip)
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
              Export each report separately. All exports are in .xlsx format with UTF-8 encoding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {supplementaryReports.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.filename}-{selectedYear}.xlsx
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exportedSupplementary.has(report.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <Button
                      onClick={() => handleExportSupplementary(report.id, report.filename)}
                      disabled={!selectedYear || loadingSupplementary !== null}
                      variant="outline"
                      size="sm"
                    >
                      {loadingSupplementary === report.id ? (
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

        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                ℹ️
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-900">Report Information</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Organizational Structure:</strong> Collection administration and building services by library</li>
                  <li>• <strong>AV/E-Book/E-Journal Databases:</strong> Global collection details with total counts</li>
                  <li>• Batch export creates a ZIP file containing all 4 reports</li>
                  <li>• All exports are in .xlsx format with UTF-8 encoding</li>
                  <li>• Reports include total library/collection counts at the end</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
