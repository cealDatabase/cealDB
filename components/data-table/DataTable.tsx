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
  Row,
} from "@tanstack/react-table";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Check, Clapperboard, ExternalLink, List, Newspaper, Table2, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
  /**
   * Enables the less dense catalogue-card display used by the three survey
   * catalogues. The regular table remains available from the display switch.
   */
  catalogueCardLabel?: string;
  /** Keep column headings visible while the detailed table is scrolled. */
  stickyHeader?: boolean;
  /** Keep catalogue actions available while scrolling through long result sets. */
  stickyControls?: boolean;
  /** Optional, role-gated operation for removing several current-year records. */
  bulkDelete?: {
    endpoint: string;
    itemLabel: string;
  };
}

type DisplayMode = "cards" | "table";

function textValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => item === "NON" ? "NON-CJK" : String(item)).join(", ");
  }

  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function CatalogueCard<TData extends { id: number; counts?: number }>({
  row,
  label,
}: {
  row: Row<TData>;
  label: string;
}) {
  const record = row.original as TData & Record<string, unknown>;
  const getCell = (id: string) => row.getVisibleCells().find((cell) => cell.column.id === id);
  const renderCell = (id: string) => {
    const cell = getCell(id);
    return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null;
  };
  const has = (key: string) => textValue(record[key]) !== "";
  const mainTitle = textValue(record.title) || textValue(record.cjk_title) || "Untitled entry";
  const cjkTitle = textValue(record.cjk_title);
  const secondaryTitle = textValue(record.title) && cjkTitle ? cjkTitle : "";
  const description = textValue(record.description);
  const source = textValue(record.data_source);
  const isValidSource = /^https?:\/\//i.test(source);
  const Icon = label.toLowerCase().includes("audio")
    ? Clapperboard
    : label.toLowerCase().includes("journal")
      ? Newspaper
      : BookOpen;
  const isAudioVisualCatalogue = label.toLowerCase().includes("audio");
  const isEBookCatalogue = label.toLowerCase().includes("e-book");
  const isEJournalCatalogue = label.toLowerCase().includes("e-journal");

  const metadata = [
    ["Romanized", textValue(record.romanized_title)],
    ["Subtitle", textValue(record.subtitle)],
    ["Series", textValue(record.series) || textValue(record.sub_series_number)],
    ["Language", textValue(record.language)],
    ["Type", textValue(record.type)],
    ["Publisher", textValue(record.publisher)],
    ["Vendor", textValue(record.vendor)],
  ].filter(([, value]) => value);

  const statistics = [
    ["Counts", textValue(record.counts)],
    ["Volumes", textValue(record.volumes)],
    ["Chapters", textValue(record.chapters)],
    ["Journals", textValue(record.journals)],
    ["Databases", textValue(record.dbs)],
  ].filter(([, value]) => value);

  return (
    <article
      className="grid overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[4.5rem_8.5rem_minmax(0,1fr)]"
      data-state={row.getIsSelected() ? "selected" : undefined}
    >
      <div className="flex flex-col items-center gap-2 border-r bg-muted/60 px-2 py-5 text-sm font-normal text-muted-foreground sm:pt-7">
        {getCell("user_selection") && (
          <span
            title="Select for this institution"
            className="flex h-8 w-12 items-center justify-center gap-1 rounded-md border bg-background text-muted-foreground"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {renderCell("user_selection")}
          </span>
        )}
        {getCell("bulk_delete") && (
          <span
            title="Mark for bulk deletion"
            className="flex h-8 w-12 items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {renderCell("bulk_delete")}
          </span>
        )}
      </div>
      <div className="hidden items-start justify-center border-r bg-muted/30 p-5 sm:flex">
        <div className="flex h-20 w-20 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <Icon className="h-9 w-9" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <h2 className="text-lg font-semibold leading-snug text-primary sm:text-xl">{mainTitle}</h2>
            {secondaryTitle && (
              <p className="mt-1 text-base font-medium leading-snug text-foreground/80 sm:text-lg" lang="zh">
                {secondaryTitle}
              </p>
            )}
          </div>
          <div className="shrink-0">{renderCell("actions")}</div>
        </div>

        {isAudioVisualCatalogue ? (
          <dl className="mt-4 space-y-4 border-l-2 border-muted pl-4">
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {getCell("import_origin") && (
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Origin</dt>
                  <dd className="mt-1">{renderCell("import_origin")}</dd>
                </div>
              )}
              {getCell("origin_institution") && has("origin_institution") && (
                <div className="min-w-0 xl:col-start-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created by institution</dt>
                  <dd className="mt-1 font-medium">{renderCell("origin_institution")}</dd>
                </div>
              )}
            </div>

            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Romanized Title", textValue(record.romanized_title)],
                ["Language", textValue(record.language)],
                ["Type", textValue(record.type)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </div>

            {textValue(record.publisher) && (
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publisher</dt>
                <dd className="mt-1 break-words font-medium">{textValue(record.publisher)}</dd>
              </div>
            )}
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Count</dt>
              <dd className="mt-1 break-words font-medium">{textValue(record.counts) || "—"}</dd>
            </div>
          </dl>
        ) : isEBookCatalogue ? (
          <dl className="mt-4 space-y-4 border-l-2 border-muted pl-4">
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {getCell("import_origin") && (
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Origin</dt>
                  <dd className="mt-1">{renderCell("import_origin")}</dd>
                </div>
              )}
              {[
                ["Romanized Title", textValue(record.romanized_title)],
                ["Series", textValue(record.sub_series_number)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </div>

            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Publisher", textValue(record.publisher)],
                ["Language", textValue(record.language)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
              {getCell("origin_institution") && has("origin_institution") && (
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created by institution</dt>
                  <dd className="mt-1 font-medium">{renderCell("origin_institution")}</dd>
                </div>
              )}
            </div>

            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Counts (# titles)", textValue(record.counts)],
                ["Volumes", textValue(record.volumes)],
                ["Chapters", textValue(record.chapters)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </div>
          </dl>
        ) : isEJournalCatalogue ? (
          <dl className="mt-4 space-y-4 border-l-2 border-muted pl-4">
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
              {getCell("import_origin") && (
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Origin</dt>
                  <dd className="mt-1">{renderCell("import_origin")}</dd>
                </div>
              )}
              {[
                ["Romanized Title", textValue(record.romanized_title)],
                ["Language", textValue(record.language)],
                ["Series", textValue(record.series) || textValue(record.sub_series_number)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </div>

            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Publisher", textValue(record.publisher)],
                ["Vendor", textValue(record.vendor)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </div>

            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Journals", textValue(record.journals)],
                ["Databases", textValue(record.dbs)],
              ].map(([name, value]) => value && (
                <div key={name} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </div>
          </dl>
        ) : (
          <div className="mt-4 grid gap-x-8 gap-y-3 border-l-2 border-muted pl-4 sm:grid-cols-2 xl:grid-cols-3">
            {getCell("import_origin") && (
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Origin</dt>
                <dd className="mt-1">{renderCell("import_origin")}</dd>
              </div>
            )}
            {getCell("origin_institution") && has("origin_institution") && (
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created by institution</dt>
                <dd className="mt-1 font-medium">{renderCell("origin_institution")}</dd>
              </div>
            )}
            {statistics.map(([name, value]) => (
              <div key={name} className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
            {metadata.map(([name, value]) => (
              <div key={name} className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</dt>
                <dd className="mt-1 break-words font-medium">{value}</dd>
              </div>
            ))}
          </div>
        )}

        {(description || isValidSource || textValue(record.notes)) && (
          <div className="mt-4 space-y-3 border-t pt-4 text-sm">
            {description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-foreground">{description}</p>
              </div>
            )}
            {isValidSource && (
              <a
                href={source}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                View source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {textValue(record.notes) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{textValue(record.notes)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
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
  catalogueCardLabel,
  stickyHeader = false,
  stickyControls = false,
  bulkDelete,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
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
          const validColumnIds = columns
            .map((col) => col.id || ("accessorKey" in col ? col.accessorKey : undefined))
            .filter((id): id is string => typeof id === "string");
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
      return initialPaginationState;
    }
    
    // Otherwise, restore from sessionStorage
    if (typeof window !== 'undefined') {
      const key = `table-pagination-${tableKey}`;
      const saved = sessionStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { pageIndex: 0, pageSize: 10 };
        }
      }
    }
    return { pageIndex: 0, pageSize: 10 };
  });
  
  const [globalFilter, setGlobalFilter] = React.useState<string>(initialGlobalFilter || "");
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>(
    catalogueCardLabel ? "cards" : "table"
  );

  React.useEffect(() => {
    if (!catalogueCardLabel || typeof window === "undefined") return;
    const saved = sessionStorage.getItem(`table-displayMode-${tableKey}`);
    if (saved === "cards" || saved === "table") setDisplayMode(saved);
  }, [catalogueCardLabel, tableKey]);

  React.useEffect(() => {
    if (!catalogueCardLabel || typeof window === "undefined") return;
    sessionStorage.setItem(`table-displayMode-${tableKey}`, displayMode);
  }, [catalogueCardLabel, displayMode, tableKey]);

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
      sessionStorage.setItem(key, JSON.stringify(pagination));
    }
  }, [pagination, tableKey]);

  const bulkDeleteColumn = React.useMemo<ColumnDef<TData>>(() => ({
    id: "bulk_delete",
    header: ({ table }) => {
      const matchingRows = table.getFilteredRowModel().rows.slice(0, 500);
      const allMatchingSelected = matchingRows.length > 0 && matchingRows.every((row) => row.getIsSelected());

      return (
        <Checkbox
          checked={allMatchingSelected || (table.getIsSomeRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.setRowSelection(
            value ? Object.fromEntries(matchingRows.map((row) => [row.id, true])) : {}
          )}
          aria-label="Select all matching entries for bulk deletion"
          title="Select all matching entries for bulk deletion"
          className="border-red-400 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select entry for bulk deletion"
        title="Select entry for bulk deletion"
        className="border-red-400 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  }), []);

  const tableColumns = React.useMemo(
    () => bulkDelete ? [bulkDeleteColumn, ...columns] : columns,
    [bulkDelete, bulkDeleteColumn, columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
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
    // Saving edits refreshes the catalogue data. Keep the reader on their
    // current page instead of letting TanStack Table reset to page one.
    autoResetPageIndex: false,
    getRowId: (originalRow) => String(originalRow.id),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedBulkIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id) => Number.isFinite(id));
  const matchingBulkRows = table.getFilteredRowModel().rows.slice(0, 500);
  const allMatchingRowsSelected = matchingBulkRows.length > 0
    && matchingBulkRows.every((row) => row.getIsSelected());

  const toggleAllMatchingBulkRows = () => {
    table.setRowSelection(
      allMatchingRowsSelected
        ? {}
        : Object.fromEntries(matchingBulkRows.map((row) => [row.id, true]))
    );
  };

  const handleBulkDelete = async () => {
    if (!bulkDelete || selectedBulkIds.length === 0) return;

    const approved = window.confirm(
      `Delete ${selectedBulkIds.length} ${bulkDelete.itemLabel} from this year? This cannot be undone, but entries in other years will not be affected.`
    );
    if (!approved) return;

    setIsBulkDeleting(true);
    try {
      const response = await fetch(bulkDelete.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedBulkIds }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Bulk delete failed");

      table.resetRowSelection();
      toast.success(`${result.deleted ?? selectedBulkIds.length} ${bulkDelete.itemLabel} deleted from this year`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk delete failed");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const tableControls = (
    <>
      {Toolbar && <Toolbar table={table} />}
      {bulkDelete && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50/60 px-3 py-2">
          <p className="text-sm text-red-950">
            <span className="font-semibold">Delete selection:</span> {selectedBulkIds.length} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-200 bg-white hover:bg-red-100"
              disabled={matchingBulkRows.length === 0 || isBulkDeleting}
              onClick={toggleAllMatchingBulkRows}
            >
              {allMatchingRowsSelected
                ? "Clear delete selection"
                : `Select all ${matchingBulkRows.length} matching`}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={selectedBulkIds.length === 0 || isBulkDeleting}
              onClick={handleBulkDelete}
            >
              {isBulkDeleting ? "Deleting…" : `Delete selected (${selectedBulkIds.length})`}
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {stickyControls ? (
        <div className="sticky top-[5.25rem] z-30 -mx-2 space-y-2 border-y bg-white/95 px-2 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
          {tableControls}
        </div>
      ) : tableControls}
      {catalogueCardLabel && (
        <div className="flex justify-end" aria-label="Display mode">
          <div className="inline-flex items-center rounded-md border bg-muted/40 p-1 shadow-sm">
          <Button
            type="button"
            variant={displayMode === "cards" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDisplayMode("cards")}
            aria-pressed={displayMode === "cards"}
            aria-label="List view"
            title="List view"
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant={displayMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDisplayMode("table")}
            aria-pressed={displayMode === "table"}
            aria-label="Table view"
            title="Table view"
          >
            <Table2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          </div>
        </div>
      )}

      {displayMode === "cards" && catalogueCardLabel ? (
        <div className="space-y-4" suppressHydrationWarning>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <CatalogueCard
                key={row.id}
                row={row}
                label={catalogueCardLabel}
              />
            ))
          ) : (
            <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">No results.</div>
          )}
        </div>
      ) : (
        <div
          className={`rounded-md border ${stickyHeader ? "max-h-[70vh] overflow-auto" : "overflow-x-auto"}`}
          suppressHydrationWarning
        >
          <Table suppressHydrationWarning>
            <TableHeader className={stickyHeader ? "sticky top-0 z-20 bg-background shadow-sm" : undefined}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan} className={stickyHeader ? "bg-background" : undefined}>
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
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <DataTablePagination table={table} userRoles={userRoles} />
    </div>
  );
}
