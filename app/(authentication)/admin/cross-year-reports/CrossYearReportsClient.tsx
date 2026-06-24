'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  SlashIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  X,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Institution {
  id: number;
  library_name: string;
}

interface YearDataRow {
  year: number;
  institutionCount: number;
  materials: {
    grandTotalWithEBooks: number | null;
    grandTotalWithEBooksGrowth: number | null;
    grandTotalWithoutEBooks: number | null;
    grandTotalWithoutEBooksGrowth: number | null;
    totalVolumesWithEBooks: number | null;
    totalVolumesWithEBooksGrowth: number | null;
    totalVolumesWithoutEBooks: number | null;
    totalVolumesWithoutEBooksGrowth: number | null;
    totalOtherMaterials: number | null;
    totalOtherMaterialsGrowth: number | null;
    monographAdditions: number | null;
    monographAdditionsGrowth: number | null;
    serials: number | null;
    serialsGrowth: number | null;
  };
  fiscal: {
    appropriations: number | null;
    appropriationsGrowth: number | null;
    grants: number | null;
    grantsGrowth: number | null;
    programSupport: number | null;
    programSupportGrowth: number | null;
    endowments: number | null;
    endowmentsGrowth: number | null;
    totalBudget: number | null;
    totalBudgetGrowth: number | null;
  };
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-700">
        <TrendingUp className="w-3 h-3" />+{value.toFixed(2)}%
      </span>
    );
  if (value < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600">
        <TrendingDown className="w-3 h-3" />
        {value.toFixed(2)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" />
      0.00%
    </span>
  );
}

function fmt(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString();
}

function fmtCurrency(value: number | null): string {
  if (value === null) return '—';
  return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function CrossYearReportsClient() {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');
  const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [reportData, setReportData] = useState<YearDataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load years and institutions on mount
  useEffect(() => {
    async function init() {
      try {
        const [yearsRes, instRes] = await Promise.all([
          fetch('/api/cross-year-reports?action=years', { credentials: 'include' }),
          fetch('/api/cross-year-reports?action=institutions', { credentials: 'include' }),
        ]);

        if (yearsRes.ok) {
          const yearsData = await yearsRes.json();
          const years: number[] = yearsData.years ?? [];
          setAvailableYears(years);
          // Default: earliest available as start, latest as end
          if (years.length >= 2) {
            setEndYear(years[0].toString()); // years are desc
            setStartYear(years[years.length - 1].toString());
          } else if (years.length === 1) {
            setEndYear(years[0].toString());
          }
        }

        if (instRes.ok) {
          const instData = await instRes.json();
          setInstitutions(instData.institutions ?? []);
        }
      } catch (err) {
        toast.error('Failed to load initial data');
      }
    }
    init();
  }, []);

  const startYearNum = parseInt(startYear);
  const endYearNum = parseInt(endYear);

  // Filtered institutions for dropdown search
  const filteredInstitutions = institutions.filter((inst) =>
    inst.library_name.toLowerCase().includes(institutionSearch.toLowerCase())
  );

  function toggleInstitution(id: number) {
    setSelectedInstitutions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedInstitutions(institutions.map((i) => i.id));
  }

  function clearAll() {
    setSelectedInstitutions([]);
  }

  // Validate year selection
  const endYearsForDropdown = availableYears.filter(
    (y) => !startYear || y > parseInt(startYear)
  );

  const canGenerate =
    startYear &&
    endYear &&
    parseInt(endYear) > parseInt(startYear) &&
    availableYears.includes(parseInt(endYear));

  async function handleGenerate() {
    if (!canGenerate) {
      toast.error('Please select a valid year range');
      return;
    }

    setLoading(true);
    try {
      const institutionParam =
        selectedInstitutions.length > 0 ? selectedInstitutions.join(',') : '';

      const url =
        `/api/cross-year-reports?action=data` +
        `&startYear=${startYear}&endYear=${endYear}` +
        (institutionParam ? `&institutionIds=${institutionParam}` : '');

      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to generate report');
      }

      const json = await res.json();
      setReportData(json.data ?? []);
      setHasLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  const institutionLabel =
    selectedInstitutions.length === 0
      ? 'All Institutions'
      : selectedInstitutions.length === institutions.length
      ? 'All Institutions'
      : `${selectedInstitutions.length} Institution${selectedInstitutions.length !== 1 ? 's' : ''} Selected`;

  return (
    <main className="min-h-screen bg-background">
      <Container className="py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Cross-Year Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Cross-Year Reports: Multi-Year Report
          </h1>
          <p className="text-muted-foreground">
            View yearly growth rate trends across multiple years for materials
            and fiscal support data. Select a year range and filter by
            institution to generate the report.
          </p>
        </div>

        {/* Selection Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>
              Select a year range and optionally filter by institution(s).
              Leave institutions empty (or use &ldquo;Select All&rdquo;) to
              include all institutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Year Range Row */}
            <div className="flex flex-wrap items-end gap-4">
              {/* Beginning Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Beginning Year
                </label>
                <Select
                  value={startYear}
                  onValueChange={(val) => {
                    setStartYear(val);
                    // Reset end year if it's no longer valid
                    if (endYear && parseInt(endYear) <= parseInt(val)) {
                      setEndYear('');
                    }
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...availableYears].reverse().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-muted-foreground pb-2 font-medium">to</span>

              {/* Ending Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Ending Year
                </label>
                <Select
                  value={endYear}
                  onValueChange={setEndYear}
                  disabled={!startYear}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {endYearsForDropdown.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {startYear && endYearsForDropdown.length === 0 && (
                  <p className="text-xs text-red-500">
                    No available years after {startYear}
                  </p>
                )}
              </div>
            </div>

            {/* Institution Multi-Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Institutions
              </label>
              <div className="relative w-full max-w-lg">
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span className="text-foreground">{institutionLabel}</span>
                  {dropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    {/* Search + action buttons */}
                    <div className="p-2 border-b space-y-1.5">
                      <input
                        type="text"
                        placeholder="Search institutions..."
                        value={institutionSearch}
                        onChange={(e) => setInstitutionSearch(e.target.value)}
                        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={selectAll}
                        >
                          <CheckSquare className="w-3 h-3" />
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={clearAll}
                        >
                          <X className="w-3 h-3" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                    {/* Institution list */}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredInstitutions.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground text-center">
                          No institutions found
                        </p>
                      ) : (
                        filteredInstitutions.map((inst) => (
                          <label
                            key={inst.id}
                            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedInstitutions.includes(inst.id)}
                              onChange={() => toggleInstitution(inst.id)}
                              className="rounded border-gray-300"
                            />
                            {inst.library_name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected badges */}
              {selectedInstitutions.length > 0 &&
                selectedInstitutions.length < institutions.length && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedInstitutions.slice(0, 5).map((id) => {
                      const inst = institutions.find((i) => i.id === id);
                      return inst ? (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="gap-1 text-xs"
                        >
                          {inst.library_name}
                          <button
                            onClick={() => toggleInstitution(id)}
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    {selectedInstitutions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedInstitutions.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              size="lg"
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Results */}
        {hasLoaded && reportData.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No data found for the selected year range and institutions.
              </p>
            </CardContent>
          </Card>
        )}

        {hasLoaded && reportData.length > 0 && (
          <div className="space-y-8">
            {/* ── Materials Growth Rate ── */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl">
                  Materials Yearly Growth Rate Data from {startYear} to{' '}
                  {endYear}
                </CardTitle>
                <CardDescription>
                  Aggregated totals and year-over-year growth rates across{' '}
                  {institutionLabel.toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-foreground min-w-[260px]">
                          Category
                        </th>
                        {reportData.map((row) => (
                          <th
                            key={row.year}
                            className="text-right px-4 py-3 font-medium text-foreground min-w-[120px]"
                          >
                            {row.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Grand Total With E-Books */}
                      <MaterialRow
                        label="Grand Total Materials (with E-Books as volumes)"
                        rows={reportData}
                        getValue={(r) => r.materials.grandTotalWithEBooks}
                        getGrowth={(r) => r.materials.grandTotalWithEBooksGrowth}
                      />
                      {/* Grand Total Without E-Books */}
                      <MaterialRow
                        label="Grand Total Materials (without E-Books as volumes)"
                        rows={reportData}
                        getValue={(r) => r.materials.grandTotalWithoutEBooks}
                        getGrowth={(r) =>
                          r.materials.grandTotalWithoutEBooksGrowth
                        }
                        shade
                      />
                      {/* Total Volumes With E-Books */}
                      <MaterialRow
                        label="Total Volumes (with E-Books)"
                        rows={reportData}
                        getValue={(r) => r.materials.totalVolumesWithEBooks}
                        getGrowth={(r) =>
                          r.materials.totalVolumesWithEBooksGrowth
                        }
                      />
                      {/* Total Volumes Without E-Books */}
                      <MaterialRow
                        label="Total Volumes (without E-Books)"
                        rows={reportData}
                        getValue={(r) => r.materials.totalVolumesWithoutEBooks}
                        getGrowth={(r) =>
                          r.materials.totalVolumesWithoutEBooksGrowth
                        }
                        shade
                      />
                      {/* Total Other Materials */}
                      <MaterialRow
                        label="Total Other Materials"
                        rows={reportData}
                        getValue={(r) => r.materials.totalOtherMaterials}
                        getGrowth={(r) =>
                          r.materials.totalOtherMaterialsGrowth
                        }
                      />
                      {/* Monograph Additions */}
                      <MaterialRow
                        label="Monograph Additions"
                        rows={reportData}
                        getValue={(r) => r.materials.monographAdditions}
                        getGrowth={(r) => r.materials.monographAdditionsGrowth}
                        shade
                      />
                      {/* Serials */}
                      <MaterialRow
                        label="Serials"
                        rows={reportData}
                        getValue={(r) => r.materials.serials}
                        getGrowth={(r) => r.materials.serialsGrowth}
                      />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* ── Fiscal Support Growth Rate ── */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl">
                  Fiscal Support Yearly Growth Rate Data from {startYear} to{' '}
                  {endYear}
                </CardTitle>
                <CardDescription>
                  Aggregated fiscal support totals and year-over-year growth
                  rates across {institutionLabel.toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-foreground min-w-[260px]">
                          Category
                        </th>
                        {reportData.map((row) => (
                          <th
                            key={row.year}
                            className="text-right px-4 py-3 font-medium text-foreground min-w-[120px]"
                          >
                            {row.year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <FiscalRow
                        label="Appropriations"
                        rows={reportData}
                        getValue={(r) => r.fiscal.appropriations}
                        getGrowth={(r) => r.fiscal.appropriationsGrowth}
                      />
                      <FiscalRow
                        label="Grants"
                        rows={reportData}
                        getValue={(r) => r.fiscal.grants}
                        getGrowth={(r) => r.fiscal.grantsGrowth}
                        shade
                      />
                      <FiscalRow
                        label="Program Support"
                        rows={reportData}
                        getValue={(r) => r.fiscal.programSupport}
                        getGrowth={(r) => r.fiscal.programSupportGrowth}
                      />
                      <FiscalRow
                        label="Endowments"
                        rows={reportData}
                        getValue={(r) => r.fiscal.endowments}
                        getGrowth={(r) => r.fiscal.endowmentsGrowth}
                        shade
                      />
                      <FiscalRow
                        label="Total Budget"
                        rows={reportData}
                        getValue={(r) => r.fiscal.totalBudget}
                        getGrowth={(r) => r.fiscal.totalBudgetGrowth}
                        bold
                      />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Info card */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">Report Notes</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • Growth rates are calculated year-over-year; the first
                        year in the range shows no growth rate (—).
                      </li>
                      <li>
                        • Data is aggregated across all selected institutions
                        (or all institutions if none are selected).
                      </li>
                      <li>
                        • Fiscal values are in US dollars. Institutions are
                        asked to convert all currencies to USD.
                      </li>
                      <li>
                        • &ldquo;Grand Total Materials&rdquo; includes physical
                        volumes, e-book volumes (where noted), and other
                        holdings.
                      </li>
                      <li>
                        • Institution count shows how many institutions
                        reported data for that year.
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  rows: YearDataRow[];
  getValue: (row: YearDataRow) => number | null;
  getGrowth: (row: YearDataRow) => number | null;
  shade?: boolean;
  bold?: boolean;
  currency?: boolean;
}

function MaterialRow({ label, rows, getValue, getGrowth, shade, bold, currency }: RowProps) {
  return (
    <tr className={shade ? 'bg-muted/20' : ''}>
      <td className={`px-4 py-3 border-b ${bold ? 'font-semibold' : 'font-medium'} text-foreground`}>
        {label}
      </td>
      {rows.map((row) => (
        <td key={row.year} className="px-4 py-3 border-b text-right">
          <div className={bold ? 'font-semibold text-foreground' : 'text-foreground'}>
            {currency ? fmtCurrency(getValue(row)) : fmt(getValue(row))}
          </div>
          <GrowthBadge value={getGrowth(row)} />
        </td>
      ))}
    </tr>
  );
}

function FiscalRow({ label, rows, getValue, getGrowth, shade, bold }: RowProps) {
  return (
    <tr className={shade ? 'bg-muted/20' : ''}>
      <td className={`px-4 py-3 border-b ${bold ? 'font-semibold' : 'font-medium'} text-foreground`}>
        {label}
      </td>
      {rows.map((row) => (
        <td key={row.year} className="px-4 py-3 border-b text-right">
          <div className={bold ? 'font-semibold text-foreground' : 'text-foreground'}>
            {fmtCurrency(getValue(row))}
          </div>
          <GrowthBadge value={getGrowth(row)} />
        </td>
      ))}
    </tr>
  );
}
