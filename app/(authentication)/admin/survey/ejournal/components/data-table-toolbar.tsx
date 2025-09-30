"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import type { Table, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions";
import { languages } from "../data/data";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";

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

  const goToEditor = () => {
    if (selectedIds.length === 0) return;
    
    // For member users, use a placeholder libid since it will be resolved from cookies
    // For super admin, they need to specify libid in URL
    const targetLibid = libid || "member";
    
    const qs = new URLSearchParams({
      ids: selectedIds.join(","),
      year: String(year),
    }).toString();
    
    console.log("Navigating to ejournaledit with:", {
      targetLibid,
      selectedIds,
      year,
      queryString: qs,
      fullUrl: `/admin/forms/${targetLibid}/ejournaledit?${qs}`
    });
    
    router.push(`/admin/forms/${targetLibid}/ejournaledit?${qs}`);
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
          onClick={goToEditor}
          disabled={selectedIds.length === 0}
          className='h-8'
          title={
            selectedIds.length === 0
              ? "Select at least one row"
              : "Add to My Subscription"
          }
        >
          Add to My Subscription ({selectedIds.length})
        </Button>
      )}

      <DataTableViewOptions table={table} />
    </div>
  );
}
