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

interface RankingResponse {
  rankings: RankingEntry[];
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
  if (value === 0) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function RankingPage() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const fetchRankings = (year?: string) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    fetch(`/api/statistics/ranking?${params.toString()}`)
      .then((r) => r.json())
      .then((d: RankingResponse & { error?: string }) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        setSelectedYear(String(d.year));
      })
      .catch(() => setError("Failed to load ranking data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRankings(); }, []);

  const handleYearChange = (y: string) => {
    setSelectedYear(y);
    fetchRankings(y);
  };

  // Group rankings by category
  const grouped = data?.rankings.reduce<Record<string, RankingEntry[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
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
                <BreadcrumbPage>My CEAL Ranking</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                My CEAL Ranking (1970 - Current)
              </h1>
            </div>
            {data && (
              <p className="text-muted-foreground">
                Rankings for{" "}
                <span className="font-semibold text-gray-800">{data.libraryName}</span>
              </p>
            )}
          </div>

          {/* Year selector */}
          {data && data.availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Year:</span>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[120px]">
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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card>
            <CardContent className="py-12 text-center text-red-500">{error}</CardContent>
          </Card>
        )}

        {/* Rankings */}
        {!loading && !error && grouped && (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, entries]) => (
              <Card key={category} className="shadow-sm">
                <CardHeader className="pb-2 bg-teal-700 rounded-t-lg">
                  <CardTitle className="text-white text-base font-semibold">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <tbody>
                      {entries.map((entry, idx) => (
                        <tr
                          key={entry.label}
                          className={`border-b last:border-b-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        >
                          {/* Label */}
                          <td className="px-4 py-2.5 text-right text-gray-600 w-1/2">
                            {entry.label}:
                          </td>
                          {/* Value + rank */}
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-teal-700">
                                {data?.libraryName} — {formatValue(entry.myValue)}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${rankBadgeStyle(entry.rank, entry.total)}`}
                              >
                                #{entry.rank} of {entry.total}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}

            <p className="text-xs text-muted-foreground text-center pb-4">
              Rankings are computed across all {data?.rankings[0]?.total ?? "—"} reporting institutions for {selectedYear}.
              Tied values share the same rank.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
