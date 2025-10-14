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
  /**
   * Initial value for global filter (e.g., from URL search params)
   */
  initialGlobalFilter?: string;
  /**
   * Initial pagination state (pageIndex and pageSize)
   */
  initialPaginationState?: { pageIndex: number; pageSize: number };
  /**
   * ID of row to highlight (e.g., newly created record)
   */
  highlightRowId?: number;
  /**
   * Unique key for this table (to isolate sessionStorage between different tables)
   */
  tableKey?: string;
}

export function DataTable<TData extends { id: number; counts?: number }, TValue>({
  columns,
  data,
  Toolbar,
  userRoles,
  initialGlobalFilter,
  initialPaginationState,
  highlightRowId,
  tableKey = 'default',
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  // Initialize sorting state as empty (hydration-safe)
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  // Initialize row selection as empty (hydration-safe)
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

  // Restore row selection from sessionStorage after hydration
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`table-rowSelection-${tableKey}`);
      if (saved) {
        try {
          const parsedSelection = JSON.parse(saved);
          setRowSelection(parsedSelection);
        } catch {
          // Ignore invalid saved state
        }
      }
    }
  }, [tableKey]);

  // Restore sorting state from sessionStorage after hydration
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`table-sorting-${tableKey}`);
      if (saved) {
        try {
          const parsedSorting = JSON.parse(saved) as SortingState;
          // Validate that sorting columns exist in current column definitions
          const validColumnIds = columns.map(col => col.id || (col as any).accessorKey);
          const validSorting = parsedSorting.filter(sort => 
            validColumnIds.includes(sort.id)
          );
          if (validSorting.length > 0) {
            setSorting(validSorting);
          }
        } catch {
          // Ignore invalid saved state
        }
      }
    }
  }, [tableKey, columns]);
  
  // Restore pagination state from sessionStorage or use initialPaginationState
  const [pagination, setPagination] = React.useState(() => {
    // If initialPaginationState is provided (new record), use it
    if (initialPaginationState) {
      console.log(`📄 Using initialPaginationState for ${tableKey}:`, initialPaginationState);
      return initialPaginationState;
    }
    
    // Otherwise, restore from sessionStorage
    if (typeof window !== 'undefined') {
      const key = `table-pagination-${tableKey}`;
      const saved = sessionStorage.getItem(key);
      console.log(`📄 Restoring pagination for ${tableKey} from sessionStorage:`, saved);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log(`📄 Restored pagination state:`, parsed);
          return parsed;
        } catch {
          return { pageIndex: 0, pageSize: 10 };
        }
      }
    }
    console.log(`📄 No saved pagination for ${tableKey}, using default`);
    return { pageIndex: 0, pageSize: 10 };
  });
  
  const [globalFilter, setGlobalFilter] = React.useState<string>(initialGlobalFilter || "");

  // Save row selection state to sessionStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`table-rowSelection-${tableKey}`, JSON.stringify(rowSelection));
    }
  }, [rowSelection, tableKey]);

  // Save sorting state to sessionStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`table-sorting-${tableKey}`, JSON.stringify(sorting));
    }
  }, [sorting, tableKey]);

  // Save pagination state to sessionStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `table-pagination-${tableKey}`;
      console.log(`💾 Saving pagination for ${tableKey}:`, pagination);
      sessionStorage.setItem(key, JSON.stringify(pagination));
    }
  }, [pagination, tableKey]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, value) => {
      // Search across title, cjk_title, romanized_title, subtitle, and publisher columns
      const searchValue = String(value || "").toLowerCase();
      
      // Try to get values from common searchable columns
      const searchableColumns = ["title", "cjk_title", "romanized_title", "subtitle", "publisher"];
      
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
    onPaginationChange: setPagination,
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
              table.getRowModel().rows.map((row) => {
                const isHighlighted = highlightRowId && row.original.id === highlightRowId;
                return (
                  <TableRow 
                    key={row.id} 
                    data-state={row.getIsSelected() && "selected"}
                    className={isHighlighted ? "bg-yellow-50 animate-pulse" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
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
