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
import {
  Loader2,
  SlashIcon,
  TrendingUp,
  TrendingDown,
  Minus,
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
  materials: MaterialsMetrics;
  fiscal: FiscalMetrics;
}

// ── Display helpers ───────────────────────────────────────────────────────────

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-muted-foreground text-xs">—</span>;
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
  return (
    '$' +
    value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

// ── Table row ─────────────────────────────────────────────────────────────────

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

// ── Report tables ─────────────────────────────────────────────────────────────

function ReportTables({
  rows,
  startYear,
  endYear,
  libraryName,
}: {
  rows: YearDataRow[];
  startYear: string;
  endYear: string;
  libraryName: string;
}) {
  return (
    <div className="space-y-6">
      {/* Materials */}
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="text-xl">
            Materials Yearly Growth Rate Data from {startYear} to {endYear}
          </CardTitle>
          <CardDescription>{libraryName}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-foreground min-w-[260px]">
                    Category
                  </th>
                  {rows.map((r) => (
                    <th
                      key={r.year}
                      className="text-right px-4 py-3 font-medium text-foreground min-w-[120px]"
                    >
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow label="Grand Total Materials (with E-Books as volumes)"    rows={rows} getValue={r => r.materials.grandTotalWithEBooks}           getGrowth={r => r.materials.grandTotalWithEBooksGrowth} />
                <DataRow label="Grand Total Materials (without E-Books as volumes)" rows={rows} getValue={r => r.materials.grandTotalWithoutEBooks}        getGrowth={r => r.materials.grandTotalWithoutEBooksGrowth} shade />
                <DataRow label="Total Volumes (with E-Books)"                       rows={rows} getValue={r => r.materials.totalVolumesWithEBooks}         getGrowth={r => r.materials.totalVolumesWithEBooksGrowth} />
                <DataRow label="Total Volumes (without E-Books)"                    rows={rows} getValue={r => r.materials.totalVolumesWithoutEBooks}      getGrowth={r => r.materials.totalVolumesWithoutEBooksGrowth} shade />
                <DataRow label="Total Other Materials"                              rows={rows} getValue={r => r.materials.totalOtherMaterials}            getGrowth={r => r.materials.totalOtherMaterialsGrowth} />
                <DataRow label="Monograph Additions"                                rows={rows} getValue={r => r.materials.monographAdditions}             getGrowth={r => r.materials.monographAdditionsGrowth} shade />
                <DataRow label="Serials"                                            rows={rows} getValue={r => r.materials.serials}                        getGrowth={r => r.materials.serialsGrowth} />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fiscal */}
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="text-xl">
            Fiscal Support Yearly Growth Rate Data from {startYear} to {endYear}
          </CardTitle>
          <CardDescription>{libraryName}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-foreground min-w-[260px]">
                    Category
                  </th>
                  {rows.map((r) => (
                    <th
                      key={r.year}
                      className="text-right px-4 py-3 font-medium text-foreground min-w-[120px]"
                    >
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow label="Appropriations"  rows={rows} getValue={r => r.fiscal.appropriations} getGrowth={r => r.fiscal.appropriationsGrowth} currency />
                <DataRow label="Grants"          rows={rows} getValue={r => r.fiscal.grants}         getGrowth={r => r.fiscal.grantsGrowth}         currency shade />
                <DataRow label="Program Support" rows={rows} getValue={r => r.fiscal.programSupport} getGrowth={r => r.fiscal.programSupportGrowth} currency />
                <DataRow label="Endowments"      rows={rows} getValue={r => r.fiscal.endowments}     getGrowth={r => r.fiscal.endowmentsGrowth}     currency shade />
                <DataRow label="Total Budget"    rows={rows} getValue={r => r.fiscal.totalBudget}    getGrowth={r => r.fiscal.totalBudgetGrowth}    currency bold />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  libraryId: number | null;
  libraryName: string | null;
}

export default function MyInstitutionCrossYearClient({ libraryId, libraryName }: Props) {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [startYear, setStartYear]           = useState<string>('');
  const [endYear, setEndYear]               = useState<string>('');

  const [reportData, setReportData] = useState<YearDataRow[]>([]);
  const [loading, setLoading]       = useState(false);
  const [hasLoaded, setHasLoaded]   = useState(false);

  const [activeStartYear, setActiveStartYear] = useState('');
  const [activeEndYear, setActiveEndYear]     = useState('');

  // Load available years on mount
  useEffect(() => {
    fetch('/api/cross-year-reports?action=years', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const years: number[] = data.years ?? [];
        setAvailableYears(years);
        if (years.length >= 2) {
          setEndYear(years[0].toString());          // most recent
          setStartYear(years[years.length - 1].toString()); // earliest
        } else if (years.length === 1) {
          setEndYear(years[0].toString());
        }
      })
      .catch(() => toast.error('Failed to load available years'));
  }, []);

  const endYearsForDropdown = availableYears.filter(
    y => !startYear || y > parseInt(startYear),
  );

  const canGenerate =
    !!startYear &&
    !!endYear &&
    parseInt(endYear) > parseInt(startYear) &&
    availableYears.includes(parseInt(endYear));

  async function handleGenerate() {
    if (!canGenerate) {
      toast.error('Please select a valid year range');
      return;
    }

    setLoading(true);
    setHasLoaded(false);

    try {
      // Use the institution-data endpoint so we always get this one institution's data
      // If the user has no attached library, fall back to the aggregated data endpoint
      let url: string;

      if (libraryId) {
        url =
          `/api/cross-year-reports?action=institution-data` +
          `&startYear=${startYear}&endYear=${endYear}` +
          `&institutionIds=${libraryId}`;
      } else {
        // No library attached — fall back to aggregated (edge case)
        url =
          `/api/cross-year-reports?action=data` +
          `&startYear=${startYear}&endYear=${endYear}`;
      }

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to generate report');
      }

      const json = await res.json();

      // institution-data returns { institutions: [{ id, name, years: [...] }] }
      // aggregated data returns { data: [...] }
      let rows: YearDataRow[] = [];
      if (json.institutions) {
        rows = json.institutions[0]?.years ?? [];
      } else if (json.data) {
        rows = json.data;
      }

      setReportData(rows);
      setActiveStartYear(startYear);
      setActiveEndYear(endYear);
      setHasLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  const displayName = libraryName ?? 'Your Institution';

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
            Cross-Year Reports
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-foreground">{displayName}</span>
          </div>
          <p className="text-muted-foreground mt-1">
            View your institution&apos;s materials and fiscal support growth
            trends across a custom year range.
          </p>
        </div>

        {/* No library attached */}
        {!libraryId && (
          <Card className="mb-6 border-amber-200 bg-amber-50/50">
            <CardContent className="p-5 flex gap-3 items-start">
              <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
              <div>
                <p className="font-medium text-amber-900">No institution attached</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  Your account does not have an institution linked. Showing aggregated
                  data across all institutions. Please contact an administrator to link
                  your account to an institution.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Parameter Card ── */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>
              Select the beginning and ending year for your report. Data is
              shown for <strong>{displayName}</strong> only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  <p className="text-xs text-red-500">
                    No available years after {startYear}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              size="lg"
              className="gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Generating Report…</>
              ) : (
                'Generate Report'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── No results ── */}
        {hasLoaded && reportData.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No data found for <strong>{displayName}</strong> in the selected
                year range. The institution may not have submitted data for all
                years in that range.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Results ── */}
        {hasLoaded && reportData.length > 0 && (
          <div className="space-y-8">
            <ReportTables
              rows={reportData}
              startYear={activeStartYear}
              endYear={activeEndYear}
              libraryName={displayName}
            />

            {/* Notes */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">ℹ️</div>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">Report Notes</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Growth rates are year-over-year; the first year shows no growth rate (—).</li>
                      <li>• &ldquo;—&rdquo; indicates no data was submitted for that category and year.</li>
                      <li>• Fiscal values are in US dollars.</li>
                      <li>• &ldquo;Grand Total Materials&rdquo; = physical end-year volumes + e-book volumes (where noted) + other holdings.</li>
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
