"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table/DataTableViewOptions"

import { languages } from "../data/data"
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div className="flex items-center justify-between">
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
      <DataTableViewOptions table={table} />
    </div>
  )
}
