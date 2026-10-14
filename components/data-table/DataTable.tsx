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
import { ExternalLink, List, ShieldCheck, Table2, Trash2, X } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { CatalogueToolbarControls } from "@/components/data-table/CatalogueControls";

interface DataTableProps<TData extends { id: number; counts?: number }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Optional toolbar component to render above the table. It receives the
   * TanStack `table` instance so that consumer components can wire up search
   * boxes, faceted filters, etc.
   */
  Toolbar?: React.ComponentType<{ table: TableInstance<TData>; controls?: CatalogueToolbarControls }>;
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
  /**
   * The toolbar lays out the display switch and bulk manage itself (the three
   * survey catalogues), instead of the row of them under the toolbar.
   */
  controlsInToolbar?: boolean;
}

type DisplayMode = "cards" | "table";

function textValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => item === "NON" ? "NON-CJK" : String(item)).join(", ");
  }

  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

const ADMIN_COLUMN_IDS = new Set(["actions", "bulk_delete"]);

/** Colour zones shared by the card and table views: blue = institution, amber = admin. */
function zoneClass(columnId: string) {
  if (columnId === "user_selection") return "bg-blue-50/70";
  if (ADMIN_COLUMN_IDS.has(columnId)) return "bg-amber-50/80";
  return undefined;
}

function ClampedText({ label, text }: { label: string; text: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = text.length > 140 || text.split("\n").length > 2;

  return (
    <div>
      <p className={cn("whitespace-pre-wrap", !expanded && "line-clamp-2")}>
        <span className="font-medium text-foreground">{label}: </span>
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function CatalogueCard<TData extends { id: number; counts?: number }>({
  row,
  label,
  highlighted,
}: {
  row: Row<TData>;
  label: string;
  highlighted?: boolean;
}) {
  const record = row.original as TData & Record<string, unknown>;
  const getCell = (id: string) => row.getVisibleCells().find((cell) => cell.column.id === id);
  const renderCell = (id: string) => {
    const cell = getCell(id);
    return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null;
  };
  const mainTitle = textValue(record.title) || textValue(record.cjk_title) || "Untitled entry";
  const cjkTitle = textValue(record.cjk_title);
  const secondaryTitle = textValue(record.title) && cjkTitle ? cjkTitle : "";
  const description = textValue(record.description);
  const notes = textValue(record.notes);
  const source = textValue(record.data_source);
  const isValidSource = /^https?:\/\//i.test(source);
  const catalogue = label.toLowerCase();
  const createdBy = getCell("origin_institution") ? textValue(record.origin_institution) : "";

  const [facts, stats] = catalogue.includes("audio")
    ? [
        [
          ["Romanized", textValue(record.romanized_title)],
          ["Language", textValue(record.language)],
          ["Type", textValue(record.type)],
          ["Publisher", textValue(record.publisher)],
        ],
        [["Count", textValue(record.counts)]],
      ]
    : catalogue.includes("e-book")
      ? [
          [
            ["Romanized", textValue(record.romanized_title)],
            ["Series", textValue(record.sub_series_number)],
            ["Language", textValue(record.language)],
            ["Publisher", textValue(record.publisher)],
          ],
          [
            ["Titles", textValue(record.counts)],
            ["Volumes", textValue(record.volumes)],
            ["Chapters", textValue(record.chapters)],
          ],
        ]
      : catalogue.includes("e-journal")
        ? [
            [
              ["Romanized", textValue(record.romanized_title)],
              ["Series", textValue(record.series) || textValue(record.sub_series_number)],
              ["Language", textValue(record.language)],
              ["Publisher", textValue(record.publisher)],
              ["Vendor", textValue(record.vendor)],
            ],
            [
              ["Journals", textValue(record.journals)],
              ["Databases", textValue(record.dbs)],
            ],
          ]
        : [
            [
              ["Romanized", textValue(record.romanized_title)],
              ["Subtitle", textValue(record.subtitle)],
              ["Series", textValue(record.series) || textValue(record.sub_series_number)],
              ["Language", textValue(record.language)],
              ["Type", textValue(record.type)],
              ["Publisher", textValue(record.publisher)],
              ["Vendor", textValue(record.vendor)],
            ],
            [
              ["Counts", textValue(record.counts)],
              ["Volumes", textValue(record.volumes)],
              ["Chapters", textValue(record.chapters)],
              ["Journals", textValue(record.journals)],
              ["Databases", textValue(record.dbs)],
            ].filter(([, value]) => value),
          ];
  const visibleFacts = [...facts, ["Created by", createdBy]].filter(([, value]) => value);

  const accessCell = renderCell("user_selection");
  const actionsCell = renderCell("actions");
  const adminSelectCell = renderCell("bulk_delete");
  // Which member institutions hold this entry. The column only exists for
  // roles allowed to see it (not plain members), so the card follows suit.
  const hasSubscribers = !!getCell("subscribers");
  const subscriberCount = Array.isArray(record.subscribers)
    ? record.subscribers.length
    : record.subscribers ? 1 : 0;

  return (
    <article
      className={cn(
        "flex overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/25",
        row.getIsSelected() && adminSelectCell && "border-amber-400 bg-amber-50/30",
        highlighted && "bg-yellow-50 ring-2 ring-yellow-300"
      )}
    >
      {accessCell && (
        <div
          className="flex w-11 shrink-0 justify-center border-r border-blue-100 bg-blue-50/70 pt-3.5"
          title="My Access: mark that your institution holds this resource"
        >
          {accessCell}
        </div>
      )}

      <div className="min-w-0 flex-1 px-4 py-3">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <div className="min-w-0 flex-1 basis-80">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-base font-semibold leading-snug text-primary">{mainTitle}</h2>
              {secondaryTitle && (
                <span className="text-sm font-medium text-foreground/70" lang="zh">{secondaryTitle}</span>
              )}
              {renderCell("import_origin")}
            </div>
            {(visibleFacts.length > 0 || isValidSource) && (
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                {visibleFacts.map(([name, value]) => (
                  <span key={name} className="min-w-0 break-words">
                    <span className="text-muted-foreground">{name}</span>{" "}
                    <span className="font-medium">{value}</span>
                  </span>
                ))}
                {isValidSource && (
                  <a
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>

          {(stats.length > 0 || hasSubscribers) && (
            <dl className="flex shrink-0 gap-5 text-right">
              {stats.map(([name, value]) => (
                <div key={name}>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{name}</dt>
                  <dd className="text-base font-semibold tabular-nums">{value || "—"}</dd>
                </div>
              ))}
              {hasSubscribers && (
                <div title="Member institutions that hold this entry. Click the number to see them.">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Subscribers</dt>
                  <dd className="text-base font-semibold tabular-nums">
                    {subscriberCount > 0 ? renderCell("subscribers") : "0"}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {(description || notes) && (
          <div className="mt-2 space-y-1 border-t border-dashed pt-2 text-sm text-foreground/80">
            {description && <ClampedText label="Description" text={description} />}
            {notes && <ClampedText label="Notes" text={notes} />}
          </div>
        )}
      </div>

      {(actionsCell || adminSelectCell) && (
        <div
          className="flex w-11 shrink-0 flex-col items-center gap-2 border-l border-amber-200 bg-amber-50/80 pt-2"
          title="Admin actions (Super Admin / E-Resource Editor)"
        >
          {actionsCell}
          {adminSelectCell}
        </div>
      )}
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
  controlsInToolbar = false,
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

  // Admin multi-select is opt-in so the default view stays focused on My Access.
  const [bulkMode, setBulkMode] = React.useState(false);

  React.useEffect(() => {
    if (!bulkDelete || typeof window === "undefined") return;
    setBulkMode(sessionStorage.getItem(`table-bulkMode-${tableKey}`) === "on");
  }, [bulkDelete, tableKey]);

  React.useEffect(() => {
    if (!bulkDelete || typeof window === "undefined") return;
    sessionStorage.setItem(`table-bulkMode-${tableKey}`, bulkMode ? "on" : "off");
  }, [bulkDelete, bulkMode, tableKey]);

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
          aria-label="Select all matching entries for admin bulk actions"
          title="Select all matching entries for admin bulk actions"
          className="border-amber-500 data-[state=checked]:border-amber-600 data-[state=checked]:bg-amber-600"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select entry for admin bulk actions"
        title="Select entry for admin bulk actions"
        className="border-amber-500 data-[state=checked]:border-amber-600 data-[state=checked]:bg-amber-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  }), []);

  const tableColumns = React.useMemo(() => {
    if (!bulkDelete || !bulkMode) return columns;
    // Bulk manage swaps the My Access column out instead of sitting beside it.
    // Two checkbox columns on one row - one that records your institution's
    // holdings and saves immediately, one that only marks rows to delete or
    // copy - read as the same control, and ticking the wrong one quietly
    // changes a library's survey data. One mode, one kind of checkbox.
    const withoutAccess = columns.filter((column) => column.id !== "user_selection");
    const actionsIndex = withoutAccess.findIndex((column) => column.id === "actions");
    return actionsIndex >= 0
      ? [...withoutAccess.slice(0, actionsIndex), bulkDeleteColumn, ...withoutAccess.slice(actionsIndex)]
      : [bulkDeleteColumn, ...withoutAccess];
  }, [bulkDelete, bulkMode, bulkDeleteColumn, columns]);

  const goToFirstPage = () =>
    setPagination((current: { pageIndex: number; pageSize: number }) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }
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
    // A new search, filter or sort starts from the first page. Without this a
    // search typed on page 2 showed an empty page 2 while its matches sat on
    // page 1, because automatic page resets are off (see below).
    onSortingChange: (updater) => {
      setSorting(updater);
      goToFirstPage();
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      goToFirstPage();
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater);
      goToFirstPage();
    },
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
    // Toolbars read this to drop their My Access controls while bulk manage is
    // on, so the only "select all" on screen is the bulk-manage one.
    meta: { bulkMode: !!bulkDelete && bulkMode },
  });

  // A page that no longer exists - the list shrank after a delete, or a page
  // number restored from an earlier visit is past the end of a search from
  // the URL - shows "No results" although there are matches. Fall back to
  // the last page that has rows.
  const pageCount = table.getPageCount();
  React.useEffect(() => {
    if (pagination.pageIndex > 0 && pagination.pageIndex >= pageCount) {
      setPagination((current: { pageIndex: number; pageSize: number }) => ({
        ...current,
        pageIndex: Math.max(0, pageCount - 1),
      }));
    }
  }, [pageCount, pagination.pageIndex]);

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

  // The page buttons sit under the last row, so without this the reader lands
  // at the bottom of the next page and has to scroll back up to its first
  // entry. Scroll to the top of the list (search and filters), not the top of
  // the document, which is a screen of breadcrumbs and instructions away.
  const listTopRef = React.useRef<HTMLDivElement>(null);
  const scrollToListTop = () => {
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      listTopRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  };

  // The detailed table scrolls inside its own box so its header row can stay
  // in view. Size that box to the screen space left under the sticky year bar
  // (5.25rem) and the sticky search/filter bar, so the header is never tucked
  // underneath them.
  const controlsRef = React.useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] = React.useState(0);
  React.useEffect(() => {
    const element = controlsRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setControlsHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [stickyControls]);
  const tableBoxStyle: React.CSSProperties | undefined = stickyHeader
    ? {
        maxHeight: stickyControls
          ? `max(18rem, calc(100vh - 5.25rem - ${controlsHeight}px - 4rem))`
          : "70vh",
      }
    : undefined;

  const exitBulkMode = () => {
    table.resetRowSelection();
    setBulkMode(false);
  };

  const hasAccessZone = tableColumns.some((column) => column.id === "user_selection");
  const hasAdminZone = !!bulkDelete || tableColumns.some((column) => column.id === "actions");

  // While bulk manage is on, this bar replaces the button that turns it on.
  const bulkBar = bulkDelete && bulkMode ? (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
      <p className="flex items-center gap-2 text-sm text-amber-950">
        <ShieldCheck className="h-4 w-4 text-amber-700" aria-hidden="true" />
        <span className="font-semibold">Admin bulk manage:</span> {selectedBulkIds.length} selected
        <span className="text-amber-800/80">· My Access checkboxes are hidden until you press Done</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-amber-300 bg-white hover:bg-amber-100"
          disabled={matchingBulkRows.length === 0 || isBulkDeleting}
          onClick={toggleAllMatchingBulkRows}
        >
          {allMatchingRowsSelected
            ? "Clear selection"
            : `Select all ${matchingBulkRows.length} matching`}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-8"
          disabled={selectedBulkIds.length === 0 || isBulkDeleting}
          onClick={handleBulkDelete}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {isBulkDeleting ? "Deleting…" : `Delete selected (${selectedBulkIds.length})`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-amber-900 hover:bg-amber-100"
          onClick={exitBulkMode}
          disabled={isBulkDeleting}
        >
          <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Done
        </Button>
      </div>
    </div>
  ) : null;

  const bulkManageButton = bulkDelete && !bulkMode ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
      onClick={() => setBulkMode(true)}
      title="Select several entries to delete or copy them"
    >
      <ShieldCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
      Bulk manage
    </Button>
  ) : null;

  const viewToggle = catalogueCardLabel ? (
    <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5" aria-label="Display mode">
      <Button
        type="button"
        variant={displayMode === "cards" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
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
        className="h-7 w-7"
        onClick={() => setDisplayMode("table")}
        aria-pressed={displayMode === "table"}
        aria-label="Table view"
        title="Table view"
      >
        <Table2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  ) : null;

  const tableControls = controlsInToolbar ? (
    Toolbar && (
      <Toolbar
        table={table}
        controls={{ viewToggle, bulk: bulkBar ?? bulkManageButton, bulkMode: !!bulkBar }}
      />
    )
  ) : (
    <>
      {Toolbar && <Toolbar table={table} />}
      {bulkBar}
    </>
  );

  return (
    // Land the list where its sticky controls stick. Any higher and the sticky
    // bar is pushed down over the first rows and the column headers.
    <div ref={listTopRef} className={cn("space-y-3", stickyControls ? "scroll-mt-[5.25rem]" : "scroll-mt-4")}>
      {stickyControls ? (
        <div ref={controlsRef} className="sticky top-[5.25rem] z-30 -mx-2 space-y-2 border-y bg-white/95 px-2 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
          {tableControls}
        </div>
      ) : tableControls}
      {controlsInToolbar ? (
        <p className="text-sm font-medium text-foreground">
          {table.getFilteredRowModel().rows.length} entries
        </p>
      ) : (catalogueCardLabel || bulkDelete) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="text-sm font-medium text-foreground">
              {table.getFilteredRowModel().rows.length} entries
            </span>
            {hasAccessZone && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-blue-200 bg-blue-100" aria-hidden="true" />
                My Access (your institution)
              </span>
            )}
            {hasAdminZone && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-amber-300 bg-amber-100" aria-hidden="true" />
                Admin actions
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {bulkManageButton}
            {viewToggle}
          </div>
        </div>
      )}

      {displayMode === "cards" && catalogueCardLabel ? (
        <div className="space-y-2" suppressHydrationWarning>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <CatalogueCard
                key={row.id}
                row={row}
                label={catalogueCardLabel}
                highlighted={!!highlightRowId && row.original.id === highlightRowId}
              />
            ))
          ) : (
            <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">No results.</div>
          )}
        </div>
      ) : (
        <div
          className={`rounded-md border ${stickyHeader ? "overflow-auto" : "overflow-x-auto"}`}
          style={tableBoxStyle}
          suppressHydrationWarning
        >
          {/* With a sticky header this box must be the only scroll container:
              the table's own wrapper scrolls sideways, and a sticky header
              sticks to its nearest scroll container. That wrapper never
              scrolls vertically, so the header used to scroll away. */}
          <Table suppressHydrationWarning containerClassName={stickyHeader ? "overflow-visible" : undefined}>
            <TableHeader className={stickyHeader ? "sticky top-0 z-20 bg-background shadow-sm" : undefined}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(stickyHeader && "bg-background", zoneClass(header.column.id))}
                    >
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
                        <TableCell key={cell.id} className={zoneClass(cell.column.id)}>
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
      <DataTablePagination
        table={table}
        userRoles={userRoles}
        showSelectionSummary={!catalogueCardLabel || bulkMode}
        selectionLabel={bulkDelete ? "selected for bulk actions" : undefined}
        onPageChange={scrollToListTop}
      />
    </div>
  );
}
