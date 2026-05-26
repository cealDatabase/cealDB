"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X, Search, ArrowRight } from "lucide-react";

interface Library {
  value: number;
  label: string;
}

const DATA_TABLES = [
  { key: "monographic", label: "1. Monographic Acquisitions" },
  { key: "volume_holdings", label: "2. Physical Volume Holdings" },
  { key: "serials", label: "3. Serial Titles: Purchased and Non-Purchased" },
  { key: "other_holdings", label: "4. Holdings of Other Materials" },
  { key: "unprocessed", label: "5. Unprocessed Backlog Materials" },
  { key: "fiscal", label: "6. Fiscal Support" },
  { key: "personnel", label: "7. Personnel Support" },
  { key: "public_services", label: "8. Public Services" },
  { key: "electronic", label: "9. Electronic" },
  { key: "electronic_books", label: "10. Electronic Books" },
];

function TableViewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibraries, setSelectedLibraries] = useState<Library[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [libSearch, setLibSearch] = useState("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("monographic");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/statistics/metadata")
      .then((r) => r.json())
      .then((data) => {
        const allLibraries: Library[] = data.libraries || [];
        setLibraries(allLibraries);
        setYears(data.years || []);

        // Restore previous selections from URL params (back navigation)
        const yearParam = searchParams.get("year");
        const tableParam = searchParams.get("table");
        const instParam = searchParams.get("institutions");

        if (yearParam) {
          setSelectedYears(yearParam.split(",").map(Number).filter(Boolean));
        } else if (data.years?.length > 0) {
          setSelectedYears([data.years[0]]);
        }

        if (tableParam) setSelectedTable(tableParam);

        if (instParam) {
          const ids = instParam.split(",").map(Number);
          setSelectedLibraries(
            allLibraries.filter((l) => ids.includes(l.value)),
          );
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setLibSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLibraries = libraries.filter((lib) =>
    lib.label.toLowerCase().includes(libSearch.toLowerCase()),
  );

  const toggleLibrary = (lib: Library) => {
    setSelectedLibraries((prev) =>
      prev.find((l) => l.value === lib.value)
        ? prev.filter((l) => l.value !== lib.value)
        : [...prev, lib],
    );
  };

  const removeLibrary = (id: number) => {
    setSelectedLibraries((prev) => prev.filter((l) => l.value !== id));
  };

  const isSelected = (id: number) =>
    selectedLibraries.some((l) => l.value === id);

  const toggleYear = (y: number) => {
    setSelectedYears((prev) =>
      prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y],
    );
  };

  const buildParams = () => {
    const params = new URLSearchParams({
      year: selectedYears.join(","),
      table: selectedTable,
    });
    if (selectedLibraries.length > 0) {
      params.set(
        "institutions",
        selectedLibraries.map((l) => l.value).join(","),
      );
    }
    return params;
  };

  const handleView = () => {
    if (selectedYears.length === 0) return;
    const params = buildParams();
    router.push(`/statistics/tableview/results?${params.toString()}`);
  };

  return (
    <div className='container mx-auto p-6 max-w-7xl space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Statistics Table View
        </h1>
        <p className='text-muted-foreground'>
          Browse the full data for any of the ten CEAL statistical forms. Filter
          by specific institutions and reporting year.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Table Configuration</CardTitle>
          <CardDescription>
            Select a table, optionally filter by institutions and year, then
            click View Table.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Institution selector */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Institution{" "}
              <span className='text-gray-400 font-normal'>
                (optional — leave empty for all)
              </span>
            </label>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='relative' ref={dropdownRef}>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-1 text-gray-700'
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  Select institutions
                  <ChevronDown className='w-4 h-4 ml-1' />
                </Button>
                {dropdownOpen && (
                  <div className='absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg'>
                    <div className='p-2 border-b border-gray-100 flex items-center gap-2'>
                      <Search className='w-4 h-4 text-gray-400 shrink-0' />
                      <input
                        autoFocus
                        type='text'
                        className='text-sm flex-1 outline-none bg-transparent'
                        placeholder='Search institutions...'
                        value={libSearch}
                        onChange={(e) => setLibSearch(e.target.value)}
                      />
                    </div>
                    <ul className='max-h-64 overflow-y-auto py-1'>
                      {filteredLibraries.length === 0 ? (
                        <li className='px-3 py-2 text-sm text-gray-400'>
                          No results
                        </li>
                      ) : (
                        filteredLibraries.map((lib) => (
                          <li
                            key={lib.value}
                            className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-teal-50 ${
                              isSelected(lib.value)
                                ? "bg-teal-50 text-teal-700 font-medium"
                                : "text-gray-700"
                            }`}
                            onClick={() => toggleLibrary(lib)}
                          >
                            <span>{lib.label}</span>
                            {isSelected(lib.value) && (
                              <span className='text-teal-600 text-xs font-bold'>
                                ✓
                              </span>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                    {selectedLibraries.length > 0 && (
                      <div className='border-t border-gray-100 px-3 py-2'>
                        <button
                          className='text-xs text-gray-400 hover:text-red-500'
                          onClick={() => setSelectedLibraries([])}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedLibraries.map((lib) => (
                <Badge
                  key={lib.value}
                  variant='secondary'
                  className='flex items-center gap-1 pr-1 bg-teal-100 text-teal-800 hover:bg-teal-200'
                >
                  <span className='max-w-[200px] truncate text-xs'>
                    {lib.label}
                  </span>
                  <button
                    onClick={() => removeLibrary(lib.value)}
                    className='ml-1 rounded-full hover:bg-teal-300 p-0.5'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Year selector */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Reporting Year{" "}
              <span className='text-gray-400 font-normal'>
                (select one or more)
              </span>
            </label>
            {selectedYears.length > 0 && (
              <div className='flex flex-wrap gap-1 mb-2'>
                {selectedYears
                  .sort((a, b) => b - a)
                  .map((y) => (
                    <span
                      key={y}
                      className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-medium'
                    >
                      {y}
                      <button
                        onClick={() => toggleYear(y)}
                        className='hover:text-red-500 leading-none'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setSelectedYears([])}
                  className='text-xs text-gray-400 hover:text-red-500 px-1'
                >
                  Clear all
                </button>
              </div>
            )}
            <div className='grid grid-cols-5 gap-x-6 gap-y-1'>
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => toggleYear(y)}
                  className={`text-sm text-left px-1 py-0.5 rounded transition-colors ${
                    selectedYears.includes(y)
                      ? "text-teal-700 font-semibold"
                      : "text-gray-600 hover:text-teal-600"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Table selector — single selection only */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Select Table{" "}
              <span className='text-gray-400 font-normal'>(choose one)</span>
            </label>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {DATA_TABLES.map((table) => (
                <button
                  key={table.key}
                  onClick={() => setSelectedTable(table.key)}
                  className={`text-left text-sm px-4 py-3 rounded-lg border transition-colors ${
                    selectedTable === table.key
                      ? "border-teal-600 bg-teal-50 text-teal-800 font-medium"
                      : "border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50/40"
                  }`}
                >
                  {table.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className='pt-2 border-t border-gray-100'>
            <Button
              onClick={handleView}
              className='bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-2'
            >
              View Statistics Table
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TableViewPage() {
  return (
    <Suspense
      fallback={
        <div className='container mx-auto p-6 max-w-7xl'>
          <div className='h-96 animate-pulse bg-gray-100 rounded-lg' />
        </div>
      }
    >
      <TableViewPageInner />
    </Suspense>
  );
}
