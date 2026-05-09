"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ChevronDown, X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Library {
  value: number;
  label: string;
}

export default function StatisticsPage() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibraries, setSelectedLibraries] = useState<Library[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [years, setYears] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/statistics/metadata")
      .then((r) => r.json())
      .then((data) => {
        setLibraries(data.libraries || []);
        setYears(data.years || []);
        if (data.years?.length > 0) setSelectedYear(data.years[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLibraries = libraries.filter((lib) =>
    lib.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLibrary = (lib: Library) => {
    setSelectedLibraries((prev) =>
      prev.find((l) => l.value === lib.value)
        ? prev.filter((l) => l.value !== lib.value)
        : [...prev, lib]
    );
  };

  const removeLibrary = (id: number) => {
    setSelectedLibraries((prev) => prev.filter((l) => l.value !== id));
  };

  const isSelected = (id: number) =>
    selectedLibraries.some((l) => l.value === id);

  const quickViewParams = selectedLibraries.length > 0
    ? `?year=${selectedYear}&institutions=${selectedLibraries.map((l) => l.value).join(",")}`
    : `?year=${selectedYear}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <Container className="py-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          <BarChart3 className="w-8 h-8 text-teal-700 mt-1 shrink-0" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Statistics Quick View
            </h1>
            <p className="text-gray-500 mt-1">
              Browse aggregated statistics across all CEAL member institutions,
              with the ability to filter by specific institutions and year.
            </p>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Config Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">
              View Options
            </CardTitle>
            <p className="text-sm text-gray-400">
              Optionally filter by institution(s) before viewing the table.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">

            {/* Institution multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution <span className="text-gray-400 font-normal">(optional — leave empty for all)</span>
              </label>

              {/* Selected badges + dropdown trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-gray-700"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    Select institutions
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {/* Search inside dropdown */}
                      <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          className="text-sm flex-1 outline-none bg-transparent"
                          placeholder="Search institutions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <ul className="max-h-60 overflow-y-auto py-1">
                        {filteredLibraries.length === 0 ? (
                          <li className="px-3 py-2 text-sm text-gray-400">No results</li>
                        ) : (
                          filteredLibraries.map((lib) => (
                            <li
                              key={lib.value}
                              className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-teal-50 ${
                                isSelected(lib.value) ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700"
                              }`}
                              onClick={() => toggleLibrary(lib)}
                            >
                              <span>{lib.label}</span>
                              {isSelected(lib.value) && (
                                <span className="text-teal-600 text-xs">✓</span>
                              )}
                            </li>
                          ))
                        )}
                      </ul>
                      {selectedLibraries.length > 0 && (
                        <div className="border-t border-gray-100 px-3 py-2">
                          <button
                            className="text-xs text-gray-400 hover:text-red-500"
                            onClick={() => setSelectedLibraries([])}
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected institution badges */}
                {selectedLibraries.map((lib) => (
                  <Badge
                    key={lib.value}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 bg-teal-100 text-teal-800 hover:bg-teal-200"
                  >
                    <span className="max-w-[180px] truncate text-xs">{lib.label}</span>
                    <button
                      onClick={() => removeLibrary(lib.value)}
                      className="ml-1 rounded-full hover:bg-teal-300 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Year selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Year
              </label>
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                      selectedYear === y
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-700"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <Link href={`/statistics/quickview${quickViewParams}`}>
                <Button className="bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-2">
                  View Statistics Table
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
