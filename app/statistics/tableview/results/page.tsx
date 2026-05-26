"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Table2 } from "lucide-react";

interface ColDef {
  key: string;
  label: string;
  type: "number" | "string" | "boolean";
}

interface ColGroup {
  label: string | null;
  span: number;
}

interface TableViewResponse {
  data: Record<string, unknown>[];
  columns: ColDef[];
  columnGroups: ColGroup[] | null;
  tableLabel: string;
}

function formatCell(value: unknown, type: ColDef["type"]): string {
  if (value === null || value === undefined) return "—";
  if (type === "number") {
    const n =
      typeof value === "object" ? parseFloat(String(value)) : Number(value);
    if (isNaN(n)) return "—";
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}

function TableViewResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const year = searchParams.get("year") ?? "";
  const table = searchParams.get("table") ?? "";
  const institutions = searchParams.get("institutions") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableViewResponse | null>(null);

  useEffect(() => {
    if (!table || !year) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ table, year });
    if (institutions) params.set("institutions", institutions);

    fetch(`/api/statistics/tableview?${params.toString()}`)
      .then((r) => r.json())
      .then((data: TableViewResponse) => {
        setTableData(data);
      })
      .catch(() => setError("Failed to load data. Please try again."))
      .finally(() => setLoading(false));
  }, [table, year, institutions]);

  const handleBack = () => {
    const params = new URLSearchParams({ year, table });
    if (institutions) params.set("institutions", institutions);
    router.push(`/statistics/tableview?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (!tableData) return;
    const { data, columns } = tableData;
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = formatCell(row[c.key], c.type);
          return `"${val}"`;
        })
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ceal-tableview-${table}-${year}.csv`;
    link.click();
  };

  return (
    <main className='min-h-screen bg-gray-50'>
      <Container className='py-8 max-w-full px-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBack}
              className='text-gray-500 hover:text-gray-700'
            >
              <ArrowLeft className='w-4 h-4 mr-1' />
              Back
            </Button>
            <div className='flex items-center gap-2'>
              <Table2 className='w-5 h-5 text-teal-700' />
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  {tableData?.tableLabel ?? "Table View"}
                </h1>
                <p className='text-sm text-gray-500'>
                  Year{year.includes(",") ? "s" : ""}:{" "}
                  <span className='font-medium'>
                    {year.split(",").join(", ")}
                  </span>
                  {institutions && (
                    <>
                      {" "}
                      · {institutions.split(",").length} institution(s) selected
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {tableData && tableData.data.length > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleExportCSV}
              className='flex items-center gap-2'
            >
              <Download className='w-4 h-4' />
              Export CSV
            </Button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <Card>
            <CardContent className='pt-6 space-y-2'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className='h-8 w-full' />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {!loading && error && (
          <Card>
            <CardContent className='py-12 text-center text-red-500'>
              {error}
            </CardContent>
          </Card>
        )}

        {/* No data */}
        {!loading && !error && tableData && tableData.data.length === 0 && (
          <Card>
            <CardContent className='py-12 text-center text-gray-400'>
              No data found for the selected criteria.
            </CardContent>
          </Card>
        )}

        {/* Tables — one per year */}
        {!loading &&
          !error &&
          tableData &&
          tableData.data.length > 0 &&
          (() => {
            // Determine which years are present and their order (desc)
            const yearsPresent = Array.from(
              new Set(tableData.data.map((r) => r.year as number)),
            ).sort((a, b) => b - a);

            // Columns without the synthetic "year" column (we use it for grouping only)
            const displayCols = tableData.columns.filter(
              (c) => c.key !== "year",
            );

            return (
              <div className='space-y-8'>
                {yearsPresent.map((yr) => {
                  const yearRows = tableData.data.filter((r) => r.year === yr);
                  return (
                    <div
                      key={yr}
                      className='rounded-lg overflow-hidden shadow-sm border border-gray-200'
                    >
                      {/* Year banner */}
                      <div className='bg-teal-700 px-4 py-3'>
                        <h2 className='text-white font-bold text-base'>
                          {tableData.tableLabel} — {yr}
                        </h2>
                        <p className='text-teal-200 text-xs mt-0.5'>
                          {yearRows.length} institution
                          {yearRows.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {/* Table */}
                      <div className='overflow-x-auto'>
                        <table className='w-full text-xs border-collapse'>
                          <thead>
                            {/* Row 1 — group labels (only when columnGroups present) */}
                            {tableData.columnGroups && (
                              <tr className='bg-teal-700 text-white'>
                                {tableData.columnGroups.map((grp, gi) =>
                                  grp.label === null ? (
                                    <th
                                      key={gi}
                                      rowSpan={2}
                                      colSpan={grp.span}
                                      className={`px-3 py-1 font-semibold border-r border-teal-600 whitespace-nowrap text-center align-middle last:border-r-0 ${
                                        gi === 0
                                          ? "sticky left-0 bg-teal-700 z-10 min-w-[180px] text-left"
                                          : ""
                                      }`}
                                    />
                                  ) : (
                                    <th
                                      key={gi}
                                      colSpan={grp.span}
                                      className='px-3 py-1 font-semibold border-r border-teal-600 whitespace-nowrap text-center last:border-r-0'
                                    >
                                      {grp.label}
                                    </th>
                                  ),
                                )}
                              </tr>
                            )}
                            {/* Row 2 — leaf column labels */}
                            <tr className='bg-teal-800 text-white'>
                              {displayCols.map((col, ci) => {
                                if (tableData.columnGroups && ci === 0)
                                  return null;
                                return (
                                  <th
                                    key={col.key}
                                    className='px-3 py-1.5 font-semibold border-r border-teal-700 whitespace-nowrap text-center last:border-r-0'
                                  >
                                    {col.label}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {yearRows.map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className={
                                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                {displayCols.map((col) => (
                                  <td
                                    key={col.key}
                                    className={`px-3 py-1.5 border-r border-gray-200 last:border-r-0 ${
                                      col.key === "library_name"
                                        ? `sticky left-0 z-10 font-medium text-gray-800 ${
                                            rowIndex % 2 === 0
                                              ? "bg-white"
                                              : "bg-gray-50"
                                          }`
                                        : col.type === "number"
                                          ? "text-right tabular-nums text-gray-700"
                                          : "text-gray-600"
                                    }`}
                                  >
                                    {formatCell(row[col.key], col.type)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
      </Container>
    </main>
  );
}

export default function TableViewResultsPage() {
  return (
    <Suspense
      fallback={
        <main className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='space-y-2 w-full max-w-2xl px-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-full' />
            ))}
          </div>
        </main>
      }
    >
      <TableViewResultsInner />
    </Suspense>
  );
}
