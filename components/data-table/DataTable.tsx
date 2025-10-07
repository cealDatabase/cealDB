"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TableInstance,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";

interface DataTableProps<TData extends { id: number; counts?: number }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Optional toolbar component to render above the table. It receives the
   * TanStack `table` instance so that consumer components can wire up search
   * boxes, faceted filters, etc.
   */
  Toolbar?: React.ComponentType<{ table: TableInstance<TData> }>;
  /**
   * User roles for permission checking (e.g., for copy functionality)
   */
  userRoles?: string[] | null;
}

export function DataTable<TData extends { id: number; counts?: number }, TValue>({
  columns,
  data,
  Toolbar,
  userRoles,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  // Restore sorting state from sessionStorage
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('table-sorting');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // Save sorting state to sessionStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('table-sorting', JSON.stringify(sorting));
    }
  }, [sorting]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, value) => {
      // Search across title and cjk_title columns (and subtitle for more comprehensive search) 
      const searchValue = String(value || "").toLowerCase();
      
      // Try to get values from common searchable columns
      const searchableColumns = ["title", "cjk_title", "subtitle", "publisher"];
      
      return searchableColumns.some(column => {
        try {
          const columnValue = String(row.getValue(column) || "").toLowerCase();
          return columnValue.includes(searchValue);
        } catch {
          // Column doesn't exist, skip it
          return false;
        }
      });
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      {Toolbar && <Toolbar table={table} />}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} userRoles={userRoles} />
    </div>
  );
}
