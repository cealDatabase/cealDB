"use client";

import { listEBook } from "../data/schema";
import { listEBookWithSelection } from "./getEBookList";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EBookDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
  userRoles,
  initialSearch,
  newRecordId,
}: {
  data: listEBook[] | listEBookWithSelection[];
  year: number;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
  libid?: number;
  initialSearch?: string;
  newRecordId?: number;
}) {
  const router = useRouter();
  const [highlightId, setHighlightId] = useState(newRecordId);
  const [isSaving, setIsSaving] = useState(false);
  // Gate render until client mount to prevent Radix UI Popover ID mismatch
  // between SSR and hydration (radix-_R_xx... aria-controls drift).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  // Initialize selection data from server data (for pre-checking)
  const [selectionData, setSelectionData] = useState<Map<number, { is_selected: boolean; custom_count: number | null }>>(() => {
    const map = new Map<number, { is_selected: boolean; custom_count: number | null }>();
    data.forEach((item) => {
      const withSelection = item as listEBookWithSelection;
      if ('is_selected' in withSelection) {
        map.set(item.id, {
          is_selected: withSelection.is_selected ?? false,
          custom_count: withSelection.custom_count ?? null,
        });
      }
    });
    return map;
  });

  // Update selection data when data changes
  useEffect(() => {
    const map = new Map<number, { is_selected: boolean; custom_count: number | null }>();
    data.forEach((item) => {
      const withSelection = item as listEBookWithSelection;
      if ('is_selected' in withSelection) {
        map.set(item.id, {
          is_selected: withSelection.is_selected ?? false,
          custom_count: withSelection.custom_count ?? null,
        });
      }
    });
    setSelectionData(map);
  }, [data]);

  // Handle selection change
  // Persist a single row to the server (auto-save)
  const persistOne = useCallback(
    async (
      listId: number,
      isSelected: boolean,
      customCount: number | null
    ) => {
      if (!libid) return;
      try {
        const response = await fetch("/api/survey/ebook/save-selections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            libraryId: libid,
            selections: [{ listId, isSelected, customCount }],
          }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.error("Auto-save error:", error);
        toast.error(`Save failed: ${error.message || "Unknown error"}`);
      }
    },
    [libid, year]
  );

  const countDebounceRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Handle selection change (auto-save immediately)
  const handleSelectionChange = useCallback(
    (id: number, selected: boolean) => {
      let nextCount: number | null = null;
      setSelectionData((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(id);
        nextCount = existing?.custom_count ?? null;
        newMap.set(id, { is_selected: selected, custom_count: nextCount });
        return newMap;
      });
      if (libid) {
        setIsSaving(true);
        void persistOne(id, selected, nextCount).finally(() =>
          setIsSaving(false)
        );
      }
    },
    [libid, persistOne]
  );

  // Handle custom count change (auto-save debounced 600ms)
  const handleCustomCountChange = useCallback(
    (id: number, count: number | null) => {
      let nextSelected = false;
      setSelectionData((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(id);
        nextSelected = existing?.is_selected ?? false;
        newMap.set(id, { is_selected: nextSelected, custom_count: count });
        return newMap;
      });
      if (!libid) return;
      const timers = countDebounceRef.current;
      const existingTimer = timers.get(id);
      if (existingTimer) clearTimeout(existingTimer);
      const timer = setTimeout(() => {
        setIsSaving(true);
        void persistOne(id, nextSelected, count).finally(() => {
          setIsSaving(false);
          timers.delete(id);
        });
      }, 600);
      timers.set(id, timer);
    },
    [libid, persistOne]
  );

  useEffect(() => {
    return () => {
      countDebounceRef.current.forEach((t) => clearTimeout(t));
      countDebounceRef.current.clear();
    };
  }, []);

  // Get columns with callbacks
  const columns = useMemo(
    () => getColumns(year, roleIdPassIn, handleSelectionChange, handleCustomCountChange, selectionData),
    [year, roleIdPassIn, handleSelectionChange, handleCustomCountChange, selectionData]
  );

  // Clean up URL and remove highlight after 3 seconds
  useEffect(() => {
    if (newRecordId) {
      const timer = setTimeout(() => {
        setHighlightId(undefined);
        router.replace(`/admin/survey/ebook/${year}`, { scroll: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newRecordId, year, router]);

  // Calculate initial pagination if newRecordId is provided
  const initialPagination = useMemo(() => {
    if (!newRecordId) return undefined;
    
    const position = data.findIndex((record) => record.id === newRecordId);
    if (position === -1) return undefined;
    
    const pageSize = 10;
    const pageIndex = Math.floor(position / pageSize);
    return { pageIndex, pageSize };
  }, [data, newRecordId]);

  // Toolbar with auto-save status indicator (no manual save button)
  const ToolbarWithLib = (props: any) => (
    <div className="space-y-2">
      <DataTableToolbar {...props} year={year} libid={libid} roleId={roleIdPassIn} />
      {libid && (
        <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
          <span>
            {Array.from(selectionData.values()).filter((s) => s.is_selected).length} items selected
          </span>
          <span aria-live="polite" className="text-xs">
            {isSaving ? "Saving…" : "All changes saved"}
          </span>
        </div>
      )}
    </div>
  );

  if (!mounted) {
    return <div className="min-h-[400px]" aria-hidden="true" />;
  }

  return (
    <DataTable 
      data={data} 
      columns={columns} 
      Toolbar={ToolbarWithLib} 
      userRoles={userRoles} 
      initialGlobalFilter={initialSearch}
      initialPaginationState={initialPagination}
      highlightRowId={highlightId}
      tableKey={`ebook-survey-${year}`}
    />
  );
}
