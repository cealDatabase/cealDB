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
import { Trophy, X, SlashIcon } from "lucide-react";
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
  if (pct <= 0.1) return "bg-emerald-50 text-emerald-800 border-emerald-300";
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
      <div className='container mx-auto px-6 py-8 max-w-[1400px]'>
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
        <div className='mb-8'>
          <div className='flex items-start justify-between gap-4 flex-wrap'>
            <div>
              <h1 className='text-3xl font-bold text-foreground mb-2'>
                My CEAL Ranking (1970 - Current)
              </h1>
              {data && (
                <p className='text-muted-foreground'>
                  Rankings for{" "}
                  <span className='font-semibold text-foreground'>
                    {data.libraryName}
                  </span>
                  {" · "}
                  Click any metric row to view the full institutional ranking.
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

        {/* Two-column layout: left 2/3 fixed, right 1/3 detail panel */}
        {!loading && !error && grouped && (
          <div className='flex gap-6 items-start'>
            {/* Left Column — Summary Rankings (always 2/3 width) */}
            <div className='w-2/3 min-w-0 space-y-6'>
              {Object.entries(grouped).map(([category, entries]) => (
                <Card key={category} className='shadow-sm'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-semibold'>
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-0'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b bg-muted/40'>
                          <th className='px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                            Metric
                          </th>
                          <th className='px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                            Value
                          </th>
                          <th className='px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                            Rank
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, idx) => (
                          <tr
                            key={entry.label}
                            onClick={() =>
                              fetchFullRanking(entry.label, category)
                            }
                            className={`border-b last:border-b-0 cursor-pointer transition-colors ${selectedMetric === entry.label ? "bg-blue-50/80 hover:bg-blue-50/80 border-l-2 border-l-blue-400" : `${idx % 2 === 0 ? "bg-white" : "bg-muted/20"} hover:bg-muted/50`}`}
                          >
                            <td className='px-4 py-2.5 text-gray-700'>
                              {entry.label}
                            </td>
                            <td className='px-4 py-2.5 text-right font-medium tabular-nums'>
                              {entry.myValue > 0 ? (
                                <span className='text-foreground'>
                                  {formatValue(entry.myValue)}
                                </span>
                              ) : (
                                <span className='text-muted-foreground'>—</span>
                              )}
                            </td>
                            <td className='px-4 py-2.5 text-center'>
                              {entry.rank > 0 && entry.myValue > 0 ? (
                                <Badge
                                  variant='outline'
                                  className={`text-xs ${rankBadgeStyle(entry.rank, entry.total)}`}
                                >
                                  #{entry.rank} of {entry.total}
                                </Badge>
                              ) : (
                                <span className='text-xs text-muted-foreground'>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}

              <p className='text-xs text-muted-foreground text-center pb-4'>
                Note: Each ranking is calculated based on institutions that reported data for the particular metric in the given year. Tied values share the same rank.
              </p>
            </div>

            {/* Right Column — Full Ranking Detail (always 1/3 width) */}
            <div className='w-1/3 min-w-0 sticky top-8 self-start'>
              {selectedMetric ? (
                <Card className='shadow-sm'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0'>
                        <CardTitle className='text-base font-semibold'>
                          {selectedMetric}
                        </CardTitle>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {fullRankingCategory} · {selectedYear}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMetric(null);
                          setFullRanking(null);
                        }}
                        className='text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0'
                      >
                        <X className='w-4 h-4' />
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
                        <thead>
                          <tr className='border-b bg-muted/40'>
                            <th className='px-3 py-2 text-center text-xs font-medium text-muted-foreground w-10'>
                              #
                            </th>
                            <th className='px-3 py-2 text-left text-xs font-medium text-muted-foreground'>
                              Institution
                            </th>
                            <th className='px-3 py-2 text-right text-xs font-medium text-muted-foreground'>
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fullRanking.map((item, idx) => (
                            <tr
                              key={item.libraryId}
                              className={`border-b last:border-b-0 ${item.libraryName === data?.libraryName ? "bg-amber-50 font-medium" : idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}
                            >
                              <td className='px-3 py-2 text-center'>
                                <span className='text-xs text-muted-foreground'>
                                  {item.rank}
                                </span>
                              </td>
                              <td className='px-3 py-2'>
                                <span
                                  className={
                                    item.libraryName === data?.libraryName
                                      ? "text-amber-800"
                                      : "text-foreground"
                                  }
                                >
                                  {item.libraryName}
                                </span>
                              </td>
                              <td className='px-3 py-2 text-right tabular-nums'>
                                <span className='font-medium text-foreground'>
                                  {formatValue(item.value)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className='p-8 text-center text-muted-foreground'>
                        No data available for this metric.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className='shadow-sm border-dashed'>
                  <CardContent className='py-16 text-center'>
                    <Trophy className='w-8 h-8 text-muted-foreground/40 mx-auto mb-3' />
                    <p className='text-sm text-muted-foreground'>
                      Click any metric row on the left to view the full
                      institutional ranking.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
