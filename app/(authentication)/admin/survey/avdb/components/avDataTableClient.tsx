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
  isOpenForEditing = true,
}: {
  data: listAV[] | listAVWithSelection[];
  year: number;
  libid: number | undefined;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
  initialSearch?: string;
  newRecordId?: number;
  isOpenForEditing?: boolean;
}) {
  // Survey gating: only super admin (role 1) can edit when survey is closed.
  const isSuperAdmin = (userRoles ?? []).includes("1");
  const canEdit = isOpenForEditing || isSuperAdmin;
  const showSuperAdminWarning = !isOpenForEditing && isSuperAdmin && !!libid;
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

  // Persist a single row to the server. Used by auto-save on
  // checkbox toggle and (debounced) custom count edits.
  const persistOne = useCallback(
    async (
      listId: number,
      isSelected: boolean,
      customCount: number | null
    ) => {
      if (!libid) return;
      try {
        const response = await fetch("/api/survey/av/save-selections", {
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

  // Handle selection change (auto-save immediately)
  const handleSelectionChange = useCallback(
    (id: number, selected: boolean) => {
      if (!canEdit) {
        toast.error("Survey is closed. Editing is disabled.");
        return;
      }
      setSelectionData((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(id);
        newMap.set(id, { is_selected: selected, custom_count: existing?.custom_count ?? null });
        return newMap;
      });
      if (libid) {
        setIsSaving(true);
        void persistOne(id, selected, null).finally(() =>
          setIsSaving(false)
        );
      }
    },
    [canEdit, libid, persistOne]
  );

  // Get columns with callbacks
  const columns = useMemo(
    () => getColumns(year, roleIdPassIn, handleSelectionChange, selectionData, canEdit),
    [year, roleIdPassIn, handleSelectionChange, selectionData, canEdit]
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

  // Toolbar with auto-save status indicator (no manual save button)
  const ToolbarWithLib = (props: any) => (
    <div className="space-y-2">
      <DataTableToolbar {...props} year={year} libid={libid} roleId={roleIdPassIn} />
      {showSuperAdminWarning && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⚠️ Survey is currently <strong>closed</strong> for this library/year.
          As Super Admin you can still edit, and your changes <strong>will be persisted</strong> to the database.
        </div>
      )}
      {!canEdit && libid && (
        <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          🔒 Survey is closed. Selections are read-only.
        </div>
      )}
      {libid && (
        <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
          <span>
            {Array.from(selectionData.values()).filter((s) => s.is_selected).length} items selected
          </span>
          <span aria-live="polite" className="text-xs">
            {isSaving ? "Saving…" : canEdit ? "All changes saved" : ""}
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
