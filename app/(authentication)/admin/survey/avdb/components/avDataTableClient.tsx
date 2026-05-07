"use client";

import { listAV } from "../data/schema";
import { listAVWithSelection } from "./getAVList";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AVDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
  userRoles,
  initialSearch,
  newRecordId,
}: {
  data: listAV[] | listAVWithSelection[];
  year: number;
  libid: number | undefined;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
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
      const withSelection = item as listAVWithSelection;
      // Check if this item has selection data (is_selected field exists)
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
      const withSelection = item as listAVWithSelection;
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
  const handleSelectionChange = useCallback((id: number, selected: boolean) => {
    setSelectionData((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      newMap.set(id, {
        is_selected: selected,
        custom_count: existing?.custom_count ?? null,
      });
      return newMap;
    });
  }, []);

  // Handle custom count change
  const handleCustomCountChange = useCallback((id: number, count: number | null) => {
    setSelectionData((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      newMap.set(id, {
        is_selected: existing?.is_selected ?? false,
        custom_count: count,
      });
      return newMap;
    });
  }, []);

  // Save selections to server
  const handleSaveSelections = useCallback(async () => {
    if (!libid) {
      toast.error("Library ID is required to save selections");
      return;
    }

    // Build selections array from Map
    const selections = Array.from(selectionData.entries()).map(([listId, state]) => ({
      listId,
      isSelected: state.is_selected,
      customCount: state.custom_count,
    }));

    setIsSaving(true);
    try {
      const response = await fetch("/api/survey/av/save-selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          libraryId: libid,
          selections,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save selections");
      }

      const result = await response.json();
      toast.success(`Saved ${result.savedCount} selections successfully!`);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save selections");
    } finally {
      setIsSaving(false);
    }
  }, [selectionData, libid, year]);

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
        router.replace(`/admin/survey/avdb/${year}`, { scroll: false });
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

  // Extended toolbar with save button
  const ToolbarWithLib = (props: any) => (
    <div className="space-y-2">
      <DataTableToolbar {...props} year={year} libid={libid} roleId={roleIdPassIn} />
      {libid && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={handleSaveSelections}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSaving ? "Saving..." : "Save Survey Selections"}
          </button>
          <span className="text-sm text-muted-foreground">
            {Array.from(selectionData.values()).filter(s => s.is_selected).length} items selected
          </span>
        </div>
      )}
    </div>
  );

  if (!mounted) {
    // Render a stable placeholder during SSR / before hydration so that
    // Radix UI components (Popover) don't generate mismatched IDs.
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
      tableKey={`avdb-survey-${year}`}
    />
  );
}
