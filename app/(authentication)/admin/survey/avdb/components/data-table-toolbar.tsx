"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions";
import { languages } from "../data/data";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import { toast } from "sonner";
import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  year: number;
  libid?: number; // ⬅ optional: disable action if missing
  roleId?: string; // ⬅ to control visibility
}

export function DataTableToolbar<TData>({
  table,
  libid,
  year,
  roleId,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;

  // Helper to fetch columns by id even if TanStack reorders them
  const getCol = (id: string) =>
    table.getAllLeafColumns().find((c) => c.id === id);

  const titleCol = getCol("title");
  const languageCol = getCol("language");

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => (r.original as any).id as number)
    .filter((n) => Number.isFinite(n));

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
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/av/export/${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AV_Database_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('AV database exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export AV database');
    } finally {
      setIsExporting(false);
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
      
      toast.success('Excel exported successfully! Includes your selections.');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
      <div className='flex flex-1 items-center space-x-2 flex-wrap gap-y-2'>
        <Input
          placeholder='Search in title, CJK, or romanized...'
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />

        {languageCol && (
          <DataTableFacetedFilter
            column={languageCol}
            title='Language'
            options={languages.map((item) => ({ ...item, value: item.label }))}
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
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
        {/* Export Excel button visible to all users */}
      <Button
        onClick={handleExportExcel}
        variant="outline"
        size="sm"
        className='h-8 bg-green-50 hover:bg-green-100 border-green-200'
        disabled={isExportingExcel}
        title={isExportingExcel ? "Preparing Excel export..." : "Export to Excel (includes your selections)"}
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

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
