"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import type { Table, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { languages } from "../data/data";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import { toast } from "sonner";
import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  year: number;
  libid?: number;
  roleId?: string;
  accessSelectedIds?: number[];
  onSetAllAccess?: (ids: number[], selected: boolean) => void;
}

export function DataTableToolbar<TData>({
  table,
  libid,
  year,
  roleId,
  accessSelectedIds = [],
  onSetAllAccess,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;

  // ✅ Safe getter (no console warning if missing)
  const getCol = (id: string): Column<TData, unknown> | undefined =>
    table.getAllLeafColumns().find((c) => c.id === id);

  const languageCol = getCol("language");
  const vendorCol = getCol("vendor");
  const seriesCol = getCol("series");
  const originCol = getCol("import_origin");
  const facetOptions = (id: string) => Array.from(getCol(id)?.getFacetedUniqueValues().keys() ?? [])
    .filter((value): value is string => typeof value === "string" && value.trim() !== "")
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));
  const selectedIds = accessSelectedIds;
  const matchingAccessIds = table.getFilteredRowModel().rows
    .map((row) => (row.original as { id?: number }).id)
    .filter((id): id is number => Number.isFinite(id));
  const selectedAccessSet = new Set(accessSelectedIds);
  const allMatchingAccessSelected = matchingAccessIds.length > 0
    && matchingAccessIds.every((id) => selectedAccessSet.has(id));
  
  const handleDirectSubscribe = async () => {
    if (selectedIds.length === 0) return;
    
    setIsSubscribing(true);
    
    try {
      // Use libid if available, otherwise it will be resolved from cookies on the server
      const targetLibid = libid || "member";
      
      // Make API call to subscribe
      const response = await fetch("/api/ejournal/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid: typeof targetLibid === 'number' ? targetLibid : undefined,
          year,
          recordIds: selectedIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to subscribe to records`);
      }

      const result = await response.json();
      
      toast.success(`Successfully subscribed to ${selectedIds.length} record${selectedIds.length === 1 ? "" : "s"}! Redirecting...`);
      
      // Redirect directly to subscription management page (without ids parameter to trigger VIEW mode)
      setTimeout(() => {
        router.push(`/admin/forms/${result.data.libid}/ejournaledit`);
      }, 1500);

    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to subscribe to records");
    } finally {
      setIsSubscribing(false);
    }
  };

  const isMemberUser = roleId?.trim() === "2";
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const canImportPreviousYear = (() => {
    try {
      const roles = roleId?.startsWith("[") ? JSON.parse(roleId) : [roleId];
      return roles.some((role: unknown) => ["1", "3"].includes(String(role)));
    } catch {
      return roleId === "1" || roleId === "3";
    }
  })();

  const handleImportPreviousYear = async () => {
    const sourceYear = year - 1;
    if (!window.confirm(`Import all ${sourceYear} global and institution-created E-Journal entries into ${year}? Existing matching entries will be skipped.`)) return;

    setIsImporting(true);
    try {
      const response = await fetch("/api/survey/import-previous-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "ejournal", targetYear: year }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed");
      toast.success(`Imported ${result.globalCreated} global and ${result.localCreated} institution entries from ${sourceYear}. ${result.skipped} existing entries were skipped.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const response = await fetch(`/api/ejournal/export-excel/${year}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errorData.error || 'Failed to export Excel');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EJournal_Database_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  }

  return (
    <div className='flex flex-col items-stretch gap-3 xl:flex-row xl:items-center xl:justify-between'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder='Search in title, CJK, or romanized...'
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='h-9 w-full min-w-0 sm:w-[250px]'
        />

        {languageCol && (
          <DataTableFacetedFilter
            column={languageCol}
            title='Language'
            options={languages.map((item) => ({ ...item, value: item.label }))}
          />
        )}
        {vendorCol && (
          <DataTableFacetedFilter column={vendorCol} title='Vendor' options={facetOptions("vendor")} />
        )}
        {seriesCol && (
          <DataTableFacetedFilter column={seriesCol} title='Series' options={facetOptions("series")} />
        )}
        {originCol && (
          <DataTableFacetedFilter column={originCol} title='Origin' options={facetOptions("import_origin")} />
        )}

        {(isFiltered || table.getState().globalFilter) && (
          <Button
            variant='ghost'
            onClick={() => {
              table.setGlobalFilter("");
              languageCol?.setFilterValue(undefined);
              table.resetColumnFilters();
            }}
            className='h-8 px-2 lg:px-3 border border-red-400'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      <div className='flex w-full flex-wrap gap-2 xl:w-auto xl:justify-end'>
        {canImportPreviousYear && (
          <Button
            onClick={handleImportPreviousYear}
            variant="outline"
            size="sm"
            className='h-8 border-blue-300 bg-blue-50 hover:bg-blue-100'
            disabled={isImporting}
            title={`Import ${year - 1} catalogue entries`}
          >
            {isImporting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Download className='mr-2 h-4 w-4' />}
            {isImporting ? "Importing..." : `Import ${year - 1} Entries`}
          </Button>
        )}
        {/* Export Excel button visible to all users */}
      <Button
        onClick={handleExportExcel}
        variant="outline"
        size="sm"
        className='h-8 bg-green-50 hover:bg-green-100 border-green-200'
        disabled={isExportingExcel}
        title={isExportingExcel ? "Preparing Excel export..." : "Export to Excel"}
      >
        {isExportingExcel ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
        )}
        {isExportingExcel ? "Preparing..." : "Export Excel"}
      </Button>

        {/* Action visible only to Super Admin (not role 2) */}
        {!isMemberUser && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSetAllAccess?.(matchingAccessIds, !allMatchingAccessSelected)}
            disabled={!onSetAllAccess || matchingAccessIds.length === 0}
            className='h-8 border-blue-200 bg-blue-50 hover:bg-blue-100'
          >
            {allMatchingAccessSelected
              ? "Clear My Access selection"
              : `Select all ${matchingAccessIds.length} for My Access`}
          </Button>
        )}
        {!isMemberUser && (
          <Button
            onClick={handleDirectSubscribe}
            disabled={selectedIds.length === 0 || isSubscribing}
            className='h-8'
            title={
              selectedIds.length === 0
                ? "Select at least one row"
                : "Add to My Access"
            }
          >
            {isSubscribing ? "Subscribing..." : `Add to My Access (${selectedIds.length})`}
          </Button>
        )}
      </div>
    </div>
  );
}
