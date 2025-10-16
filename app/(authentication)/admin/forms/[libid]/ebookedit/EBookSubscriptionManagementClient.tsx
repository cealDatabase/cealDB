"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import EditEBookSubscriptionDialog from "./EditEBookSubscriptionDialog";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EBookSubscriptionManagementClientProps {
  subscriptions: Array<{
    libraryyear_id: number;
    listebook_id: number;
    List_EBook: {
      id: number;
      title: string | null;
      sub_series_number: string | null;
      publisher: string | null;
      description: string | null;
      notes: string | null;
      subtitle: string | null;
      cjk_title: string | null;
      romanized_title: string | null;
      data_source: string | null;
      is_global: boolean | null;
      libraryyear: number | null;
      updated_at: Date;
      List_EBook_Counts?: Array<{ titles: number | null; volumes: number | null; chapters: number | null }>;
      List_EBook_Language?: Array<{ Language: { short: string | null } }>;
    };
  }>;
  libid: number;
  year: number;
  mode: "view" | "add";
  libraryName: string;
  roleId?: string;
}

export default function EBookSubscriptionManagementClient({
  subscriptions,
  libid,
  year,
  mode,
  libraryName,
  roleId
}: EBookSubscriptionManagementClientProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Expandable text component for truncated cells
  const ExpandableText = ({ content, maxWidth = "200px" }: { content: string; maxWidth?: string }) => {
    if (!content || content.trim().length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    const needsPopover = content.length > 30;

    if (!needsPopover) {
      return <span className="font-medium">{content}</span>;
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="text-left text-blue-700 font-medium hover:text-blue-900 hover:underline transition-colors cursor-pointer w-full"
            style={{ maxWidth }}
          >
            <div className="truncate">
              {content}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-[400px] overflow-y-auto" side="right">
          <div className="text-sm">
            <p className="font-medium whitespace-pre-wrap break-words">{content}</p>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Convert subscription data to table format
  const data = subscriptions
    .filter(sub => !removedIds.has(sub.listebook_id))
    .map((sub) => ({
      id: sub.List_EBook.id,
      title: sub.List_EBook.title ?? "",
      sub_series_number: sub.List_EBook.sub_series_number ?? "",
      publisher: sub.List_EBook.publisher ?? "",
      description: sub.List_EBook.description ?? "",
      notes: sub.List_EBook.notes ?? "",
      subtitle: sub.List_EBook.subtitle ?? "",
      cjk_title: sub.List_EBook.cjk_title ?? "",
      romanized_title: sub.List_EBook.romanized_title ?? "",
      data_source: sub.List_EBook.data_source ?? "",
      is_global: !!sub.List_EBook.is_global,
      updated_at: sub.List_EBook.updated_at.toISOString(),
      titles: sub.List_EBook.List_EBook_Counts?.[0]?.titles ?? 0,
      volumes: sub.List_EBook.List_EBook_Counts?.[0]?.volumes ?? 0,
      chapters: sub.List_EBook.List_EBook_Counts?.[0]?.chapters ?? 0,
      language: sub.List_EBook.List_EBook_Language?.map(l => l.Language?.short).filter(Boolean) as string[] || [],
    }));

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    router.refresh();
    toast.success("Access updated successfully!");
  };

  // Define columns for the management view
  const getColumns = () => [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(record)}
              disabled={isRemoving}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveSubscription(record.id)}
              disabled={isRemoving}
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "cjk_title",
      header: "CJK Title",
      cell: ({ row }: any) => (
        <div className="max-w-[200px]">
          <ExpandableText content={row.getValue("cjk_title")} maxWidth="200px" />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "English Title",
      cell: ({ row }: any) => (
        <div className="max-w-[200px]">
          <ExpandableText content={row.getValue("title")} maxWidth="200px" />
        </div>
      ),
    },
    {
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }: any) => (
        <div className="max-w-[150px]">
          <ExpandableText content={row.getValue("publisher")} maxWidth="150px" />
        </div>
      ),
    },
    {
      accessorKey: "subtitle",
      header: "Subtitle",
      cell: ({ row }: any) => (
        <div className="max-w-[150px]">
          <ExpandableText content={row.getValue("subtitle")} maxWidth="150px" />
        </div>
      ),
    },
    {
      accessorKey: "sub_series_number",
      header: "Sub Series",
      cell: ({ row }: any) => (
        <div className="max-w-[120px]">
          <ExpandableText content={row.getValue("sub_series_number")} maxWidth="120px" />
        </div>
      ),
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }: any) => {
        const langs = row.getValue("language") as string[];
        return (
          <div className="flex gap-1 flex-wrap">
            {langs.map((lang, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {lang === "NON" ? "NON-CJK" : lang}
              </Badge>
            ))}
          </div>
        );
      },
      filterFn: (row: any, id: string, value: string[]) => {
        const rowLanguages = row.getValue(id) as string[];
        return value.some((filterLang: string) => rowLanguages.includes(filterLang));
      },
    },
    {
      accessorKey: "titles",
      header: "Titles",
      cell: ({ row }: any) => {
        const count = row.getValue("titles") as number;
        return <div className="text-center font-medium">{count > 0 ? count.toLocaleString() : '-'}</div>;
      },
    },
    {
      accessorKey: "volumes",
      header: "Volumes",
      cell: ({ row }: any) => {
        const count = row.getValue("volumes") as number;
        return <div className="text-center font-medium">{count > 0 ? count.toLocaleString() : '-'}</div>;
      },
    },
    {
      accessorKey: "chapters",
      header: "Chapters",
      cell: ({ row }: any) => {
        const count = row.getValue("chapters") as number;
        return <div className="text-center font-medium">{count > 0 ? count.toLocaleString() : '-'}</div>;
      },
    },
  ];

  const handleRemoveSubscription = async (bookId: number) => {
    setIsRemoving(true);
    
    try {
      const response = await fetch("/api/ebook/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: [bookId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove subscription`);
      }

      const result = await response.json();
      
      // Update local state to remove the item
      setRemovedIds(prev => new Set([...prev, bookId]));
      
      toast.success(`Successfully removed access for E-Book record ${bookId}.`);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Remove subscription error:", error);
      toast.error("There was an error removing the access. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  // Custom toolbar for subscription management
  const ManagementToolbar = ({ table }: { table: any }) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row: any) => row.original.id);
    
    return (
      <div className="space-y-4">
        {/* Header with Add More to My Access button */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Current Access</h3>
            <p className="text-sm text-blue-700 mt-1">
              {data.length} access for {year}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={() => router.push(`/admin/survey/ebook/${year}`)}
          >
            ➕ Add More to My Access
          </Button>
        </div>

        {/* Table controls */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            {/* Language Filter */}
            {table.getColumn("language") && (
              <DataTableFacetedFilter
                column={table.getColumn("language")}
                title="Language"
                options={[
                  { label: "CHN", value: "CHN" },
                  { label: "JPN", value: "JPN" },
                  { label: "KOR", value: "KOR" },
                  { label: "NON-CJK", value: "NON" },
                ]}
              />
            )}
            
            <Badge variant="outline">
              {table.getFilteredRowModel().rows.length} access
            </Badge>
            {selectedRows.length > 0 && (
              <Badge variant="secondary">
                {selectedRows.length} selected
              </Badge>
            )}
          </div>
          
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => handleBulkRemove(selectedIds)}
              disabled={isRemoving}
            >
              {isRemoving 
                ? "Removing..." 
                : `Remove Selected (${selectedIds.length})`
              }
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleBulkRemove = async (bookIds: number[]) => {
    setIsRemoving(true);
    
    try {
      const response = await fetch("/api/ebook/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: bookIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove subscriptions`);
      }

      const result = await response.json();
      
      // Update local state to remove the items
      setRemovedIds(prev => new Set([...prev, ...bookIds]));
      
      toast.success(`Successfully removed ${bookIds.length} access.`);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Bulk remove subscription error:", error);
      toast.error("There was an error removing the access. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className="rounded-md border bg-card p-4">
        <h2 className="text-lg font-medium mb-2">Current E-Book Access</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your library's E-Book access for {year}. You can remove individual access or select multiple to remove at once.
        </p>
        
        <DataTable 
          data={data} 
          columns={getColumns()} 
          Toolbar={ManagementToolbar}
          tableKey={`ebook-subscription-${libid}-${year}`}
        />
      </div>

      {editingRecord && (
        <EditEBookSubscriptionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          record={editingRecord}
          libid={libid}
          year={year}
          onSuccess={handleEditSuccess}
          roleId={roleId}
        />
      )}
    </div>
  );
}
