"use client";

import { listEBook } from "../data/schema";
import { listEBookWithSelection } from "./getEBookList";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmMyAccessBulk, confirmMyAccessChange } from "@/lib/myAccessConfirm";

export default function EBookDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
  userRoles,
  initialSearch,
  newRecordId,
  isOpenForEditing = true,
  libraryName,
  confirmAccessChanges = false,
}: {
  data: listEBook[] | listEBookWithSelection[];
  year: number;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
  libid?: number;
  initialSearch?: string;
  newRecordId?: number;
  isOpenForEditing?: boolean;
  /** The institution whose My Access this page changes. */
  libraryName?: string;
  /** Ask which institution before changing My Access (lib/myAccessConfirm.ts). */
  confirmAccessChanges?: boolean;
}) {
  const isSuperAdmin = (userRoles ?? []).includes("1");
  const canBulkDelete = (userRoles ?? []).some((role) => ["1", "3"].includes(role));
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

  // Roles that work on many institutions confirm which one they are
  // changing before the first tick on the page (lib/myAccessConfirm.ts).
  const institutionName = libraryName ?? `institution ${libid}`;
  const confirmedFor = useRef<number | null>(null);
  const confirmInstitution = useCallback(() => {
    if (!confirmAccessChanges || !libid || confirmedFor.current === libid) return true;
    if (!confirmMyAccessChange(institutionName, year)) return false;
    confirmedFor.current = libid;
    return true;
  }, [confirmAccessChanges, libid, institutionName, year]);

  // Handle selection change (auto-save immediately)
  const handleSelectionChange = useCallback(
    (id: number, selected: boolean) => {
      if (!canEdit) {
        toast.error("Survey is closed. Editing is disabled.");
        return;
      }
      if (!confirmInstitution()) return;
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
    [canEdit, libid, persistOne, confirmInstitution]
  );

  const handleAllAccessSelection = useCallback(
    async (ids: number[], selected: boolean) => {
      if (!canEdit) {
        toast.error("Survey is closed. Editing is disabled.");
        return;
      }

      const previous = selectionData;
      const changedIds = ids.filter((id) => (previous.get(id)?.is_selected ?? false) !== selected);
      if (changedIds.length === 0) return;
      if (confirmAccessChanges && libid) {
        if (!confirmMyAccessBulk(changedIds.length, selected, institutionName, year)) return;
        confirmedFor.current = libid;
      }

      setSelectionData((current) => {
        const next = new Map(current);
        changedIds.forEach((id) => {
          next.set(id, {
            is_selected: selected,
            custom_count: current.get(id)?.custom_count ?? null,
          });
        });
        return next;
      });

      if (!libid) return;
      setIsSaving(true);
      try {
        const response = await fetch("/api/survey/ebook/save-selections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            libraryId: libid,
            selections: changedIds.map((listId) => ({
              listId,
              isSelected: selected,
              customCount: previous.get(listId)?.custom_count ?? null,
            })),
          }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `HTTP ${response.status}`);
        }
      } catch (error) {
        setSelectionData(previous);
        toast.error(error instanceof Error ? error.message : "Unable to update selections");
      } finally {
        setIsSaving(false);
      }
    },
    [canEdit, libid, selectionData, year, confirmAccessChanges, institutionName]
  );

  // Get columns with callbacks
  const columns = useMemo(
    () => getColumns(year, roleIdPassIn, handleSelectionChange, selectionData, canEdit, !!libid, handleAllAccessSelection),
    [year, roleIdPassIn, handleSelectionChange, selectionData, canEdit, libid, handleAllAccessSelection]
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
      <DataTableToolbar
        {...props}
        year={year}
        libid={libid}
        roleId={roleIdPassIn}
        accessSelectedIds={Array.from(selectionData.entries())
          .filter(([, selection]) => selection.is_selected)
          .map(([id]) => id)}
        onSetAllAccess={handleAllAccessSelection}
        canEdit={canEdit}
        accessStatus={
          <>
            <span className="text-foreground">
              {(() => {
                const held = Array.from(selectionData.values()).filter((s) => s.is_selected).length;
                return `${held} ${held === 1 ? "entry" : "entries"} held by ${confirmAccessChanges ? institutionName : "your institution"}`;
              })()}
            </span>
            <span aria-live="polite" className="text-xs text-muted-foreground">
              {isSaving ? "Saving…" : canEdit ? "All changes saved" : ""}
            </span>
          </>
        }
      />
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
      catalogueCardLabel="E-Book Database"
      stickyHeader
      stickyControls
      controlsInToolbar
      bulkDelete={canBulkDelete ? {
        endpoint: `/api/ebook/delete-bulk/${year}`,
        itemLabel: "E-Book entries",
      } : undefined}
    />
  );
}
