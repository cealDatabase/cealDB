'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationalStructureExport() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear() - 1;
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear - i);
    }
    setAvailableYears(years);
    setSelectedYear(currentYear.toString());
  }, []);

  const handleExport = async () => {
    if (!selectedYear) {
      toast.error('Please select a year first');
      return;
    }

    setLoading(true);
    setExported(false);

    try {
      const response = await fetch(
        `/api/export/organizational-structure?year=${selectedYear}`
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Export failed';
        
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || 'Export failed';
        } else {
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Organizational_Structure-${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExported(true);
      toast.success(`Organizational Structure report for ${selectedYear} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Organizational Structure Export
        </CardTitle>
        <p className="text-gray-600 text-sm mt-2">
          Export comprehensive data about participating libraries' organizational structure and operation status. 
          This report includes collection administration details, building services information, and operational characteristics by library.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-600 flex-shrink-0 mt-0.5">
              ℹ️
            </div>
            <div className="space-y-2">
              <p className="font-medium text-blue-900">What's included in this report:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Collection Administration:</strong> Organizational structure, head positions, reporting hierarchies</li>
                <li>• <strong>Collection Building & Services:</strong> Collection types, shelving, consultation, teaching services</li>
                <li>• <strong>Technical Services:</strong> Acquisition, cataloging, and circulation information</li>
                <li>• <strong>Language Expertise:</strong> Law and medicine language support availability</li>
                <li>• <strong>System Details:</strong> Online catalog URLs, bibliographic utilities, consortia memberships</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Year
            </label>
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
            </div>
          </div>

          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Participating Libraries Organizational Structure and Operation Status</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Organizational_Structure-{selectedYear}.xlsx
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel format with UTF-8 encoding • Includes all participating libraries for {selectedYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {exported && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                <Button
                  onClick={handleExport}
                  disabled={!selectedYear || loading}
                  size="lg"
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This export is available to all visitors without requiring login. 
            The report provides public information about participating CEAL member libraries' organizational structures and operational characteristics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
