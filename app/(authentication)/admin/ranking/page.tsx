"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, SlashIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface RankingEntry {
  category: string;
  label: string;
  myValue: number;
  rank: number;
  total: number;
}

interface FullRankingItem {
  libraryId: number;
  libraryName: string;
  value: number;
  rank: number;
}

interface RankingResponse {
  rankings: RankingEntry[];
  availableYears: number[];
  year: number;
  libraryId: number;
  libraryName: string;
}

interface FullRankingResponse {
  fullRanking: FullRankingItem[];
  metric: string;
  category: string;
  availableYears: number[];
  year: number;
  libraryId: number;
  libraryName: string;
}

function rankBadgeStyle(rank: number, total: number): string {
  const pct = rank / total;
  if (rank === 1) return "bg-amber-100 text-amber-800 border-amber-300";
  if (pct <= 0.1) return "bg-yellow-50 text-yellow-800 border-yellow-300";
  if (pct <= 0.25) return "bg-green-50 text-green-700 border-green-300";
  if (pct <= 0.5) return "bg-blue-50 text-blue-700 border-blue-300";
  return "bg-gray-100 text-gray-600 border-gray-300";
}

function formatValue(value: number): string {
  if (value === 0) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function RankingPage() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Full ranking detail view state
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [fullRanking, setFullRanking] = useState<FullRankingItem[] | null>(
    null,
  );
  const [fullRankingLoading, setFullRankingLoading] = useState(false);
  const [fullRankingCategory, setFullRankingCategory] = useState<string>("");

  const fetchRankings = (year?: string) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    fetch(`/api/statistics/ranking?${params.toString()}`)
      .then((r) => r.json())
      .then((d: RankingResponse & { error?: string }) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setData(d);
        setSelectedYear(String(d.year));
      })
      .catch(() => setError("Failed to load ranking data."))
      .finally(() => setLoading(false));
  };

  const fetchFullRanking = (metricLabel: string, category: string) => {
    setFullRankingLoading(true);
    setSelectedMetric(metricLabel);
    setFullRankingCategory(category);
    const params = new URLSearchParams();
    params.set("year", selectedYear);
    params.set("metric", metricLabel);
    fetch(`/api/statistics/ranking?${params.toString()}`)
      .then((r) => r.json())
      .then((d: FullRankingResponse & { error?: string }) => {
        if (d.error) return;
        setFullRanking(d.fullRanking);
      })
      .catch(() => setFullRanking(null))
      .finally(() => setFullRankingLoading(false));
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const handleYearChange = (y: string) => {
    setSelectedYear(y);
    setSelectedMetric(null);
    setFullRanking(null);
    fetchRankings(y);
  };

  // Group rankings by category
  const grouped = data?.rankings.reduce<Record<string, RankingEntry[]>>(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = [];
      acc[r.category].push(r);
      return acc;
    },
    {},
  );

  return (
    <main className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 py-8 max-w-4xl'>
        {/* Breadcrumb */}
        <div className='mb-4'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/'>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/admin'>Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>My CEAL Ranking</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className='mb-6 flex items-start justify-between gap-4 flex-wrap'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Trophy className='w-6 h-6 text-amber-500' />
              <h1 className='text-3xl font-bold text-gray-900'>
                My CEAL Ranking (1970 - Current)
              </h1>
            </div>
            {data && (
              <p className='text-muted-foreground'>
                Rankings for{" "}
                <span className='font-semibold text-gray-800'>
                  {data.libraryName}
                </span>
              </p>
            )}
          </div>

          {/* Year selector */}
          {data && data.availableYears.length > 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Year:</span>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className='h-40 w-full rounded-lg' />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card>
            <CardContent className='py-12 text-center text-red-500'>
              {error}
            </CardContent>
          </Card>
        )}

        {/* Split Pane Layout */}
        {!loading && !error && grouped && (
          <div className='flex gap-6'>
            {/* Left Pane - Summary Rankings */}
            <div
              className={`transition-all duration-300 ${selectedMetric ? "w-1/2" : "w-full"}`}
            >
              <div className='space-y-6'>
                {Object.entries(grouped).map(([category, entries]) => (
                  <Card key={category} className='shadow-sm'>
                    <CardHeader className='pb-2 bg-teal-700 rounded-t-lg'>
                      <CardTitle className='text-white text-base font-semibold'>
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                      <table className='w-full text-sm'>
                        <tbody>
                          {entries.map((entry, idx) => (
                            <tr
                              key={entry.label}
                              onClick={() =>
                                fetchFullRanking(entry.label, category)
                              }
                              className={`border-b last:border-b-0 cursor-pointer hover:bg-teal-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} ${selectedMetric === entry.label ? "ring-2 ring-inset ring-teal-400" : ""}`}
                            >
                              {/* Label */}
                              <td className='px-4 py-2.5 text-right text-gray-600 w-1/2'>
                                {entry.label}:
                              </td>
                              {/* Value + rank */}
                              <td className='px-4 py-2.5'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium text-teal-700'>
                                    {data?.libraryName} —{" "}
                                    {formatValue(entry.myValue)}
                                  </span>
                                  {entry.myValue > 0 && (
                                    <Badge
                                      variant='outline'
                                      className={`text-xs ${rankBadgeStyle(entry.rank, entry.total)}`}
                                    >
                                      #{entry.rank} of {entry.total}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                ))}

                <p className='text-xs text-muted-foreground text-center pb-4'>
                  Rankings are computed across all{" "}
                  {data?.rankings[0]?.total ?? "—"} reporting institutions for{" "}
                  {selectedYear}. Tied values share the same rank. Click any row
                  to view full ranking.
                </p>
              </div>
            </div>

            {/* Right Pane - Full Ranking Detail */}
            {selectedMetric && (
              <div className='w-1/2'>
                <Card className='shadow-sm sticky top-4'>
                  <CardHeader className='pb-3 bg-teal-700 rounded-t-lg'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='text-white text-base font-semibold'>
                          {fullRankingCategory}
                        </CardTitle>
                        <p className='text-teal-100 text-sm mt-1'>
                          {selectedMetric}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMetric(null);
                          setFullRanking(null);
                        }}
                        className='text-teal-100 hover:text-white text-xl leading-none'
                      >
                        ×
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className='p-0 max-h-[calc(100vh-200px)] overflow-y-auto'>
                    {fullRankingLoading ? (
                      <div className='p-4 space-y-2'>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className='h-8 w-full' />
                        ))}
                      </div>
                    ) : fullRanking && fullRanking.length > 0 ? (
                      <table className='w-full text-sm'>
                        <tbody>
                          {fullRanking.map((item, idx) => (
                            <tr
                              key={item.libraryId}
                              className={`border-b last:border-b-0 ${item.libraryName === data?.libraryName ? "bg-amber-50 font-medium" : idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                            >
                              <td className='px-3 py-2 w-12 text-center'>
                                <span className='text-xs text-gray-500'>
                                  {item.value > 0 ? `#${item.rank}` : ""}
                                </span>
                              </td>
                              <td className='px-3 py-2'>
                                <span
                                  className={
                                    item.libraryName === data?.libraryName
                                      ? "text-teal-700"
                                      : "text-gray-700"
                                  }
                                >
                                  {item.libraryName}
                                </span>
                              </td>
                              <td className='px-3 py-2 text-right'>
                                <span className='font-medium text-gray-900'>
                                  {formatValue(item.value)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className='p-8 text-center text-gray-500'>
                        No data available for this metric.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
