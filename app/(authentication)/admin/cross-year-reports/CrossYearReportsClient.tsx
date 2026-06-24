'use client';

import { useState, useEffect } from 'react';
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
  Building2,
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface Institution {
  id: number;
  library_name: string;
}

interface MaterialsMetrics {
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
}

interface FiscalMetrics {
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
}

interface YearDataRow {
  year: number;
  institutionCount?: number;
  materials: MaterialsMetrics;
  fiscal: FiscalMetrics;
}

interface InstitutionDetail {
  id: number;
  name: string;
  years: YearDataRow[];
}

// ── Display helpers ───────────────────────────────────────────────────────────

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
        <TrendingDown className="w-3 h-3" />{value.toFixed(2)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" />0.00%
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

// ── Shared table sub-components ───────────────────────────────────────────────

interface RowProps {
  label: string;
  rows: YearDataRow[];
  getValue: (row: YearDataRow) => number | null;
  getGrowth: (row: YearDataRow) => number | null;
  shade?: boolean;
  bold?: boolean;
  currency?: boolean;
}

function DataRow({ label, rows, getValue, getGrowth, shade, bold, currency }: RowProps) {
  return (
    <tr className={shade ? 'bg-muted/20' : ''}>
      <td className={`px-4 py-3 border-b ${bold ? 'font-semibold' : 'font-medium'} text-foreground`}>
        {label}
      </td>
      {rows.map((row) => (
        <td key={row.year} className="px-4 py-3 border-b text-right align-top">
          <div className={bold ? 'font-semibold text-foreground' : 'text-foreground'}>
            {currency ? fmtCurrency(getValue(row)) : fmt(getValue(row))}
          </div>
          <GrowthBadge value={getGrowth(row)} />
        </td>
      ))}
    </tr>
  );
}

// ── Reusable report table pair (Materials + Fiscal) ───────────────────────────

interface ReportTablesProps {
  rows: YearDataRow[];
  startYear: string;
  endYear: string;
  titleSuffix?: string;        // e.g. " — Harvard"
  compact?: boolean;           // tighter heading for drill-down
}

function ReportTables({ rows, startYear, endYear, titleSuffix = '', compact }: ReportTablesProps) {
  const headingClass = compact
    ? 'text-base font-semibold'
    : 'text-xl';

  return (
    <div className="space-y-6">
      {/* Materials */}
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className={headingClass}>
            Materials Annual Performance from {startYear} to {endYear}{titleSuffix}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-foreground min-w-[260px]">Category</th>
                  {rows.map((r) => (
                    <th key={r.year} className="text-right px-4 py-3 font-medium text-foreground min-w-[120px]">
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow label="Grand Total Materials (with E-Books as volumes)"    rows={rows} getValue={r => r.materials.grandTotalWithEBooks}        getGrowth={r => r.materials.grandTotalWithEBooksGrowth} />
                <DataRow label="Grand Total Materials (without E-Books as volumes)" rows={rows} getValue={r => r.materials.grandTotalWithoutEBooks}     getGrowth={r => r.materials.grandTotalWithoutEBooksGrowth} shade />
                <DataRow label="Total Volumes (with E-Books)"                       rows={rows} getValue={r => r.materials.totalVolumesWithEBooks}      getGrowth={r => r.materials.totalVolumesWithEBooksGrowth} />
                <DataRow label="Total Volumes (without E-Books)"                    rows={rows} getValue={r => r.materials.totalVolumesWithoutEBooks}   getGrowth={r => r.materials.totalVolumesWithoutEBooksGrowth} shade />
                <DataRow label="Total Other Materials"                              rows={rows} getValue={r => r.materials.totalOtherMaterials}         getGrowth={r => r.materials.totalOtherMaterialsGrowth} />
                <DataRow label="Monograph Additions"                                rows={rows} getValue={r => r.materials.monographAdditions}          getGrowth={r => r.materials.monographAdditionsGrowth} shade />
                <DataRow label="Serials"                                            rows={rows} getValue={r => r.materials.serials}                     getGrowth={r => r.materials.serialsGrowth} />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fiscal */}
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className={headingClass}>
            Fiscal Support Annual Performance from {startYear} to {endYear}{titleSuffix}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-foreground min-w-[260px]">Category</th>
                  {rows.map((r) => (
                    <th key={r.year} className="text-right px-4 py-3 font-medium text-foreground min-w-[120px]">
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow label="Appropriations" rows={rows} getValue={r => r.fiscal.appropriations} getGrowth={r => r.fiscal.appropriationsGrowth} currency />
                <DataRow label="Grants"         rows={rows} getValue={r => r.fiscal.grants}         getGrowth={r => r.fiscal.grantsGrowth}         currency shade />
                <DataRow label="Program Support" rows={rows} getValue={r => r.fiscal.programSupport} getGrowth={r => r.fiscal.programSupportGrowth} currency />
                <DataRow label="Endowments"     rows={rows} getValue={r => r.fiscal.endowments}     getGrowth={r => r.fiscal.endowmentsGrowth}     currency shade />
                <DataRow label="Total Budget"   rows={rows} getValue={r => r.fiscal.totalBudget}    getGrowth={r => r.fiscal.totalBudgetGrowth}    currency bold />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Institution drill-down card ───────────────────────────────────────────────

function InstitutionDrillDown({
  inst,
  startYear,
  endYear,
}: {
  inst: InstitutionDetail;
  startYear: string;
  endYear: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm">{inst.name}</span>
          <Badge variant="outline" className="text-xs ml-1">
            {inst.years.length} year{inst.years.length !== 1 ? 's' : ''} of data
          </Badge>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {/* Detail tables */}
      {open && (
        <div className="p-4 space-y-4 bg-background border-t">
          {inst.years.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data found for this institution in the selected year range.
            </p>
          ) : (
            <ReportTables
              rows={inst.years}
              startYear={startYear}
              endYear={endYear}
              compact
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

export default function CrossYearReportsClient() {
  const [availableYears, setAvailableYears]       = useState<number[]>([]);
  const [institutions, setInstitutions]           = useState<Institution[]>([]);
  const [startYear, setStartYear]                 = useState<string>('');
  const [endYear, setEndYear]                     = useState<string>('');
  const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen]           = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');

  // Aggregated report (all selected institutions combined)
  const [reportData, setReportData]   = useState<YearDataRow[]>([]);
  const [loading, setLoading]         = useState(false);
  const [hasLoaded, setHasLoaded]     = useState(false);

  // Per-institution drill-down
  const [instDetails, setInstDetails]       = useState<InstitutionDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Track the query that produced the current results (for titles)
  const [activeStartYear, setActiveStartYear] = useState('');
  const [activeEndYear, setActiveEndYear]     = useState('');

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [yearsRes, instRes] = await Promise.all([
          fetch('/api/cross-year-reports?action=years',        { credentials: 'include' }),
          fetch('/api/cross-year-reports?action=institutions', { credentials: 'include' }),
        ]);

        if (yearsRes.ok) {
          const yearsData = await yearsRes.json();
          const years: number[] = yearsData.years ?? [];
          setAvailableYears(years);
          if (years.length >= 2) {
            setEndYear(years[0].toString());
            setStartYear(years[years.length - 1].toString());
          } else if (years.length === 1) {
            setEndYear(years[0].toString());
          }
        }
        if (instRes.ok) {
          const instData = await instRes.json();
          setInstitutions(instData.institutions ?? []);
        }
      } catch {
        toast.error('Failed to load initial data');
      }
    }
    init();
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const filteredInstitutions = institutions.filter(i =>
    i.library_name.toLowerCase().includes(institutionSearch.toLowerCase()),
  );

  const endYearsForDropdown = availableYears.filter(
    y => !startYear || y > parseInt(startYear),
  );

  const canGenerate =
    !!startYear &&
    !!endYear &&
    parseInt(endYear) > parseInt(startYear) &&
    availableYears.includes(parseInt(endYear));

  // Whether we have specific institutions selected (vs. "all")
  const specificInstitutions =
    selectedInstitutions.length > 0 &&
    selectedInstitutions.length < institutions.length;

  const institutionLabel =
    selectedInstitutions.length === 0 || selectedInstitutions.length === institutions.length
      ? 'All Institutions'
      : `${selectedInstitutions.length} Institution${selectedInstitutions.length !== 1 ? 's' : ''} Selected`;

  // ── Handlers ───────────────────────────────────────────────────────────────
  function toggleInstitution(id: number) {
    setSelectedInstitutions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  }
  function selectAll() { setSelectedInstitutions(institutions.map(i => i.id)); }
  function clearAll()  { setSelectedInstitutions([]); }

  async function handleGenerate() {
    if (!canGenerate) { toast.error('Please select a valid year range'); return; }

    setLoading(true);
    setHasLoaded(false);
    setInstDetails([]);

    try {
      const instParam = selectedInstitutions.length > 0 ? selectedInstitutions.join(',') : '';

      // 1. Aggregated data
      const aggUrl =
        `/api/cross-year-reports?action=data` +
        `&startYear=${startYear}&endYear=${endYear}` +
        (instParam ? `&institutionIds=${instParam}` : '');

      const aggRes = await fetch(aggUrl, { credentials: 'include' });
      if (!aggRes.ok) {
        const err = await aggRes.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to generate report');
      }
      const aggJson = await aggRes.json();
      setReportData(aggJson.data ?? []);
      setActiveStartYear(startYear);
      setActiveEndYear(endYear);
      setHasLoaded(true);

      // 2. Per-institution detail — only when specific institutions are selected
      if (specificInstitutions) {
        setLoadingDetails(true);
        const detailUrl =
          `/api/cross-year-reports?action=institution-data` +
          `&startYear=${startYear}&endYear=${endYear}` +
          `&institutionIds=${instParam}`;

        const detailRes = await fetch(detailUrl, { credentials: 'include' });
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          setInstDetails(detailJson.institutions ?? []);
        }
        setLoadingDetails(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background">
      <Container className="py-8">

        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/admin">Admin</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Cross-Year Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Cross-Year Reports: Multi-Year Report
          </h1>
          <p className="text-muted-foreground">
            View yearly growth rate trends across multiple years for materials and fiscal support.
            When specific institutions are selected you can expand each one to see its individual yearly data.
          </p>
        </div>

        {/* ── Parameter Card ── */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Year Range & Institutions</CardTitle>
            <CardDescription>
              Select a year range and optionally filter by institution(s). Leave institutions
              empty (or use &ldquo;Select All&rdquo;) to include all institutions in the
              aggregated report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Year range */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Beginning Year</label>
                <Select
                  value={startYear}
                  onValueChange={(val) => {
                    setStartYear(val);
                    if (endYear && parseInt(endYear) <= parseInt(val)) setEndYear('');
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...availableYears].reverse().map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-muted-foreground pb-2 font-medium">to</span>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Ending Year</label>
                <Select value={endYear} onValueChange={setEndYear} disabled={!startYear}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {endYearsForDropdown.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {startYear && endYearsForDropdown.length === 0 && (
                  <p className="text-xs text-red-500">No available years after {startYear}</p>
                )}
              </div>
            </div>

            {/* Institution multi-select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Institutions</label>
              <div className="relative w-full max-w-lg">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span>{institutionLabel}</span>
                  {dropdownOpen
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    <div className="p-2 border-b space-y-1.5">
                      <input
                        type="text"
                        placeholder="Search institutions…"
                        value={institutionSearch}
                        onChange={e => setInstitutionSearch(e.target.value)}
                        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={selectAll}>
                          <CheckSquare className="w-3 h-3" />Select All
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={clearAll}>
                          <X className="w-3 h-3" />Clear All
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredInstitutions.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground text-center">No institutions found</p>
                      ) : (
                        filteredInstitutions.map(inst => (
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
              {specificInstitutions && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedInstitutions.slice(0, 6).map(id => {
                    const inst = institutions.find(i => i.id === id);
                    return inst ? (
                      <Badge key={id} variant="secondary" className="gap-1 text-xs">
                        {inst.library_name}
                        <button onClick={() => toggleInstitution(id)} className="ml-0.5 hover:text-destructive">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                  {selectedInstitutions.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedInstitutions.length - 6} more
                    </Badge>
                  )}
                </div>
              )}

              {specificInstitutions && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click on each institution below the aggregated report to view its individual yearly data.
                </p>
              )}
            </div>

            <Button onClick={handleGenerate} disabled={!canGenerate || loading} size="lg" className="gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Generating Report…</>
                : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>

        {/* ── No results ── */}
        {hasLoaded && reportData.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No data found for the selected year range and institutions.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Results ── */}
        {hasLoaded && reportData.length > 0 && (
          <div className="space-y-8">

            {/* Aggregated report (always shown) */}
            <div>
              {specificInstitutions && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Aggregated — {institutionLabel}
                  </span>
                  <Badge variant="outline" className="text-xs">Combined totals</Badge>
                </div>
              )}
              <ReportTables
                rows={reportData}
                startYear={activeStartYear}
                endYear={activeEndYear}
              />
            </div>

            {/* Per-institution drill-down section */}
            {specificInstitutions && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    Individual Institution Data
                  </h2>
                  {loadingDetails && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading details…
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground -mt-2">
                  Click any institution to expand its individual yearly data in the same format.
                </p>

                {!loadingDetails && instDetails.length === 0 && (
                  <p className="text-sm text-muted-foreground">No per-institution data available.</p>
                )}

                {instDetails.map(inst => (
                  <InstitutionDrillDown
                    key={inst.id}
                    inst={inst}
                    startYear={activeStartYear}
                    endYear={activeEndYear}
                  />
                ))}
              </div>
            )}

            {/* Info card */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">ℹ️</div>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">Report Notes</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Growth rates are year-over-year; the first year shows no growth rate (—).</li>
                      <li>• Aggregated data sums across all selected institutions (or all if none selected).</li>
                      <li>• Fiscal values are in US dollars. Institutions report in USD.</li>
                      <li>• &ldquo;Grand Total Materials&rdquo; = physical end-year volumes + e-book volumes (where noted) + other holdings.</li>
                      <li>• Select specific institutions to unlock individual drill-down panels below the aggregated tables.</li>
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
