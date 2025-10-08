"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import type { Table, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions";
import { languages } from "../data/data";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import { toast } from "sonner";
import { useState } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  year: number;
  libid?: number;
  roleId?: string;
}

export function DataTableToolbar<TData>({
  table,
  libid,
  year,
  roleId,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;

  // ✅ Safe getter (no console warning if missing)
  const getCol = (id: string): Column<TData, unknown> | undefined =>
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

  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Search in English or CJK title...'
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
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

      {/* Action visible only to Super Admin (not role 2) */}
      {!isMemberUser && (
        <Button
          onClick={handleDirectSubscribe}
          disabled={selectedIds.length === 0 || isSubscribing}
          className='h-8'
          title={
            selectedIds.length === 0
              ? "Select at least one row"
              : "Add to My Subscription"
          }
        >
          {isSubscribing ? "Subscribing..." : `Add to My Subscription (${selectedIds.length})`}
        </Button>
      )}

      <DataTableViewOptions table={table} />
    </div>
  );
}
