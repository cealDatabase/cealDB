"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions"
import { languages } from "../data/data"
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  year: number
  libid?: number
  roleId?: string
}

export function DataTableToolbar<TData>({
  table,
  libid,
  year,
  roleId,
}: DataTableToolbarProps<TData>) {
  const router = useRouter()
  const isFiltered = table.getState().columnFilters.length > 0
  
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => (r.original as any).id as number)
    .filter((n) => Number.isFinite(n))

  const goToEditor = () => {
    if (selectedIds.length === 0) return
    
    const targetLibid = libid || "member"
    
    const qs = new URLSearchParams({
      ids: selectedIds.join(","),
      year: String(year),
    }).toString()
    
    console.log("Navigating to ebookedit with:", {
      targetLibid,
      selectedIds,
      year,
      queryString: qs,
      fullUrl: `/admin/forms/${targetLibid}/ebookedit?${qs}`
    })
    
    router.push(`/admin/forms/${targetLibid}/ebookedit?${qs}`)
  }

  const isMemberUser = roleId?.trim() === "2"
  
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search in English or CJK title..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("language") && (
          <DataTableFacetedFilter
            column={table.getColumn("language")}
            title="Language"
            options={languages.map((item) => ({ ...item, value: item.label }))}
          />
        )}
        {(isFiltered || table.getState().globalFilter) && (
          <Button
            variant="ghost"
            onClick={() => {
              table.setGlobalFilter("");
              table.resetColumnFilters();
            }}
            className="h-8 px-2 lg:px-3 border border-red-400"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Action visible only to Super Admin (not role 2) */}
      {!isMemberUser && (
        <Button
          onClick={goToEditor}
          disabled={selectedIds.length === 0}
          className="h-8"
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
  )
}
