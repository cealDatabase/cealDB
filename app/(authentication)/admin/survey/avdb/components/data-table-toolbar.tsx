"use client";

import type * as React from "react";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { languages, type as avTypes } from "../data/data";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import { ZoneStrip, type CatalogueToolbarControls } from "@/components/data-table/CatalogueControls";
import { toast } from "sonner";
import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  year: number;
  libid?: number; // ⬅ optional: disable action if missing
  roleId?: string; // ⬅ to control visibility
  accessSelectedIds?: number[];
  onSetAllAccess?: (ids: number[], selected: boolean) => void;
  canEdit?: boolean;
  /** Laid out by the shared DataTable: display switch and bulk manage. */
  controls?: CatalogueToolbarControls;
  /** Held count and save status, shown in the My Access strip. */
  accessStatus?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  libid,
  year,
  roleId,
  accessSelectedIds = [],
  onSetAllAccess,
  canEdit = true,
  controls,
  accessStatus,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;

  // Helper to fetch columns by id even if TanStack reorders them
  const getCol = (id: string) =>
    table.getAllLeafColumns().find((c) => c.id === id);

  const languageCol = getCol("language");
  const typeCol = getCol("type");
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
      const response = await fetch("/api/av/subscribe", {
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
        router.push(`/admin/forms/${result.data.libid}/avdbedit`);
      }, 1500);

    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to subscribe to records");
    } finally {
      setIsSubscribing(false);
    }
  };

  const isMemberUser = roleId?.trim() === "2";
  // While bulk manage is on, its banner owns selection. Offering "Select all
  // for My Access" beside "Select all matching" puts two select-alls on screen
  // that write to completely different places.
  const bulkMode = !!(table.options.meta as { bulkMode?: boolean } | undefined)?.bulkMode;
  const showAccessControls = !isMemberUser && !!libid && !bulkMode;
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
    if (!window.confirm(`Import all ${sourceYear} global and institution-created AV entries into ${year}? Existing matching entries will be skipped.`)) {
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch("/api/survey/import-previous-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "av", targetYear: year }),
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
      const response = await fetch(`/api/av/export-excel/${year}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errorData.error || 'Failed to export Excel');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AV_Database_${year}.xlsx`;
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
  };

  // One layout for the AV, E-Book and E-Journal lists: search, filters and
  // the display options on the first row; below it the institution's own
  // My Access actions (blue) and catalogue maintenance (amber), each in its
  // own labelled strip - the same colours as the two side columns of an
  // entry in the list view.
  const showAdminStrip = canImportPreviousYear || !!controls?.bulk;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder='Search in title, CJK, or romanized...'
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className='h-9 w-full min-w-0 sm:w-[250px]'
        />

        {languageCol && (
          <DataTableFacetedFilter
            column={languageCol}
            title='Language'
            options={languages.map((item) => ({ ...item, value: item.label }))}
          />
        )}
        {typeCol && (
          <DataTableFacetedFilter
            column={typeCol}
            title='Media type'
            options={avTypes.map((item) => ({ ...item, value: item.value }))}
          />
        )}
        {originCol && (
          <DataTableFacetedFilter
            column={originCol}
            title='Origin'
            options={facetOptions("import_origin")}
          />
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
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            size="sm"
            className="h-8"
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
          {controls?.viewToggle}
        </div>
      </div>

      {libid && !bulkMode && (
        <ZoneStrip tone="access" label="My Access" status={accessStatus}>
          {showAccessControls && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSetAllAccess?.(matchingAccessIds, !allMatchingAccessSelected)}
                disabled={!canEdit || !onSetAllAccess || matchingAccessIds.length === 0}
                className="h-8 border-blue-300 bg-white text-blue-900 hover:bg-blue-100"
              >
                {allMatchingAccessSelected
                  ? "Clear My Access selection"
                  : `Select all ${matchingAccessIds.length} for My Access`}
              </Button>
              <Button
                onClick={handleDirectSubscribe}
                disabled={!canEdit || selectedIds.length === 0 || isSubscribing}
                className='h-8 bg-blue-600 text-white hover:bg-blue-700'
                title={
                  selectedIds.length === 0
                    ? "Select at least one row"
                    : "Add to My Access"
                }
              >
                {isSubscribing ? "Subscribing..." : `Add to My Access (${selectedIds.length})`}
              </Button>
            </>
          )}
        </ZoneStrip>
      )}

      {controls?.bulkMode
        ? controls.bulk
        : showAdminStrip && (
            <ZoneStrip tone="admin" label="Admin">
              {canImportPreviousYear && (
                <Button
                  onClick={handleImportPreviousYear}
                  variant="outline"
                  size="sm"
                  className="h-8 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                  disabled={isImporting}
                  title={`Import ${year - 1} catalogue entries`}
                >
                  {isImporting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Download className='mr-2 h-4 w-4' />}
                  {isImporting ? "Importing..." : `Import ${year - 1} Entries`}
                </Button>
              )}
              {controls?.bulk}
            </ZoneStrip>
          )}
    </div>
  );
}
