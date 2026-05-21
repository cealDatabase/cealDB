"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Search,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface QuickViewData {
  id: number;
  library_name: string;
  grand_total_materials: number | null;
  chn_volumes: number | null;
  jpn_volumes: number | null;
  kor_volumes: number | null;
  total_physical: number | null;
  volumes_added: number | null;
  ebook_total: number | null;
  vol_total: number | null;
  serial_titles: number | null;
  other_materials: number | null;
  personnel_support: number | null;
}

function SkeletonTable() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

function ResultsPageInner() {
  const searchParams = useSearchParams();
  const year = parseInt(searchParams.get("year") || "2024");
  const institutionsParam = searchParams.get("institutions") || "";

  const [data, setData] = useState<QuickViewData[]>([]);
  const [filteredData, setFilteredData] = useState<QuickViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof QuickViewData | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ year: String(year) });
        if (institutionsParam) params.set("institutions", institutionsParam);
        const response = await fetch(`/api/statistics/quickview?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch quick view data");
        const result = await response.json();
        if (result.success) {
          const nonEmptyData = result.data.filter(
            (item: QuickViewData) =>
              item.grand_total_materials !== null ||
              item.chn_volumes !== null ||
              item.jpn_volumes !== null ||
              item.kor_volumes !== null ||
              item.total_physical !== null ||
              item.volumes_added !== null ||
              item.ebook_total !== null ||
              item.serial_titles !== null ||
              item.personnel_support !== null,
          );
          setData(nonEmptyData);
          setFilteredData(nonEmptyData);
        } else {
          setError(result.error || "Failed to load data");
        }
      } catch (err) {
        setError("Error fetching quick view data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, institutionsParam]);

  useEffect(() => {
    let result = data.filter((item) =>
      searchTerm.trim() === ""
        ? true
        : item.library_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }
    setFilteredData(result);
  }, [searchTerm, data, sortKey, sortDir]);

  const handleSort = (key: keyof QuickViewData) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: keyof QuickViewData }) => {
    if (sortKey !== col) return <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-50" />;
    return sortDir === "asc"
      ? <ArrowUp className="inline w-3 h-3 ml-1" />
      : <ArrowDown className="inline w-3 h-3 ml-1" />;
  };

  const handleExportExcel = () => {
    const headers = [
      "Institution", "Grand Total Materials Held", "CHN", "JPN", "KOR",
      "Total (Physical)", "Added", "E-Book Total", "Vol. Total",
      "Serial Titles", "Other Materials Held (%)", "Personnel Support",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          `"${row.library_name}"`,
          row.grand_total_materials ?? "",
          row.chn_volumes ?? "",
          row.jpn_volumes ?? "",
          row.kor_volumes ?? "",
          row.total_physical ?? "",
          row.volumes_added ?? "",
          row.ebook_total ?? "",
          row.vol_total ?? "",
          row.serial_titles ?? "",
          row.other_materials ?? "",
          row.personnel_support ?? "",
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ceal-quickview-${year}.csv`;
    link.click();
  };

  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString();
  };

  const backParams = institutionsParam
    ? `?year=${year}&institutions=${institutionsParam}`
    : `?year=${year}`;

  return (
    <main className='min-h-screen bg-gray-50'>
      <Container className='py-8 max-w-full px-4'>
        <div className='space-y-6'>
          {/* Back link */}
          <Link
            href={`/statistics/quickview${backParams}`}
            className='inline-flex items-center gap-1 text-sm text-teal-700 hover:underline'
          >
            <ChevronLeft className='w-4 h-4' />
            Back to selection
          </Link>

          {/* Description banner */}
          <div className='bg-amber-100 border border-amber-300 rounded-lg p-4'>
            <p className='text-sm text-amber-900'>
              {institutionsParam
                ? `Filtered institutions · Year ${year}`
                : `All Institutions · Year ${year}`}
            </p>
          </div>

          {/* Toolbar */}
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm'>
                <FileSpreadsheet className='w-4 h-4 mr-2' />
                Transpose table
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleExportExcel}
                disabled={filteredData.length === 0}
              >
                <Download className='w-4 h-4 mr-2' />
                Export to Excel
              </Button>
            </div>
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Search institutions...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-center'>
                Statistical Data on East Asian Institutions as of June 30,{" "}
                {year}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {loading ? (
                <div className='p-6'>
                  <SkeletonTable />
                </div>
              ) : error ? (
                <div className='p-6 text-red-600 bg-red-50 rounded-md'>
                  {error}
                </div>
              ) : filteredData.length === 0 ? (
                <div className='p-6 text-gray-600 text-center'>
                  No data available for the selected year.
                </div>
              ) : (
                <Table className='w-full table-fixed text-xs leading-relaxed'>
                  <TableHeader>
                    <TableRow className='bg-teal-700 hover:bg-teal-700'>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold border-r border-teal-600 w-[18%] align-middle px-3 py-2 cursor-pointer select-none'
                        onClick={() => handleSort("library_name")}
                      >
                        Institution <SortIcon col='library_name' />
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold border-r border-teal-600 text-center align-middle px-2 py-2 whitespace-normal cursor-pointer select-none'
                        onClick={() => handleSort("grand_total_materials")}
                      >
                        Grand Total Materials Held{" "}
                        <SortIcon col='grand_total_materials' />
                      </TableHead>
                      <TableHead
                        colSpan={5}
                        className='text-white font-semibold border-r border-teal-600 text-center px-2 py-2'
                      >
                        Held (Physical) - Volumes
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold border-r border-teal-600 text-center align-middle px-2 py-2 whitespace-normal cursor-pointer select-none'
                        onClick={() => handleSort("ebook_total")}
                      >
                        E-Book Total <SortIcon col='ebook_total' />
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold border-r border-teal-600 text-center align-middle px-2 py-2 whitespace-normal cursor-pointer select-none'
                        onClick={() => handleSort("vol_total")}
                      >
                        Vol. Total <SortIcon col='vol_total' />
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold border-r border-teal-600 text-center align-middle px-2 py-2 whitespace-normal cursor-pointer select-none'
                        onClick={() => handleSort("serial_titles")}
                      >
                        Serial Titles <SortIcon col='serial_titles' />
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold border-r border-teal-600 text-center align-middle px-2 py-2 whitespace-normal cursor-pointer select-none'
                        onClick={() => handleSort("other_materials")}
                      >
                        Other Materials Held <SortIcon col='other_materials' />
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className='text-white font-semibold text-center align-middle px-2 py-2 whitespace-normal cursor-pointer select-none'
                        onClick={() => handleSort("personnel_support")}
                      >
                        Personnel Support <SortIcon col='personnel_support' />
                      </TableHead>
                    </TableRow>
                    <TableRow className='bg-teal-700 hover:bg-teal-700'>
                      <TableHead
                        className='text-white font-semibold border-r border-teal-600 text-center px-2 py-2 cursor-pointer select-none'
                        onClick={() => handleSort("chn_volumes")}
                      >
                        CHN <SortIcon col='chn_volumes' />
                      </TableHead>
                      <TableHead
                        className='text-white font-semibold border-r border-teal-600 text-center px-2 py-2 cursor-pointer select-none'
                        onClick={() => handleSort("jpn_volumes")}
                      >
                        JPN <SortIcon col='jpn_volumes' />
                      </TableHead>
                      <TableHead
                        className='text-white font-semibold border-r border-teal-600 text-center px-2 py-2 cursor-pointer select-none'
                        onClick={() => handleSort("kor_volumes")}
                      >
                        KOR <SortIcon col='kor_volumes' />
                      </TableHead>
                      <TableHead
                        className='text-white font-semibold border-r border-teal-600 text-center px-2 py-2 cursor-pointer select-none'
                        onClick={() => handleSort("total_physical")}
                      >
                        Total <SortIcon col='total_physical' />
                      </TableHead>
                      <TableHead
                        className='text-white font-semibold border-r border-teal-600 text-center px-2 py-2 cursor-pointer select-none'
                        onClick={() => handleSort("volumes_added")}
                      >
                        Added <SortIcon col='volumes_added' />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} h-10`}
                      >
                        <TableCell className='font-medium border-r border-gray-200 truncate px-3 py-2'>
                          {row.library_name}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.grand_total_materials)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.chn_volumes)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.jpn_volumes)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.kor_volumes)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.total_physical)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.volumes_added)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.ebook_total)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.vol_total)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.serial_titles)}
                        </TableCell>
                        <TableCell className='text-right border-r border-gray-200 px-2 py-1'>
                          {formatNumber(row.other_materials)}
                        </TableCell>
                        <TableCell className='text-right px-2 py-1'>
                          {formatNumber(row.personnel_support)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className='text-sm text-gray-600'>
            <p>
              Showing {filteredData.length} of {data.length} institutions
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <ResultsPageInner />
    </Suspense>
  );
}
