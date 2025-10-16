"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import EditSubscriptionDialog from "./EditSubscriptionDialog";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SubscriptionManagementClientProps {
  subscriptions: Array<{
    libraryyear_id: number;
    listav_id: number;
    List_AV: {
      id: number;
      title: string | null;
      subtitle: string | null;
      cjk_title: string | null;
      romanized_title: string | null;
      description: string | null;
      notes: string | null;
      publisher: string | null;
      data_source: string | null;
      type: string | null;
      is_global: boolean | null;
      updated_at: Date;
      List_AV_Counts?: Array<{ titles: number | null }>;
      List_AV_Language?: Array<{ Language: { short: string | null } }>;
    };
  }>;
  libid: number;
  year: number;
  mode: "view" | "add";
  libraryName: string;
  roleId?: string;
}

export default function SubscriptionManagementClient({
  subscriptions,
  libid,
  year,
  mode,
  libraryName,
  roleId
}: SubscriptionManagementClientProps) {
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
    .filter(sub => !removedIds.has(sub.listav_id))
    .map((sub) => ({
      id: sub.List_AV.id,
      title: sub.List_AV.title ?? "",
      subtitle: sub.List_AV.subtitle ?? "",
      cjk_title: sub.List_AV.cjk_title ?? "",
      romanized_title: sub.List_AV.romanized_title ?? "",
      description: sub.List_AV.description ?? "",
      notes: sub.List_AV.notes ?? "",
      publisher: sub.List_AV.publisher ?? "",
      data_source: sub.List_AV.data_source ?? "",
      type: sub.List_AV.type ?? "",
      counts: sub.List_AV.List_AV_Counts?.[0]?.titles ?? 0,
      language: sub.List_AV.List_AV_Language?.map(l => l.Language?.short).filter(Boolean) as string[] || [],
      is_global: !!sub.List_AV.is_global,
      subscribers: [],
      updated_at: sub.List_AV.updated_at.toISOString(),
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
        <div className="max-w-[180px]">
          <ExpandableText content={row.getValue("title")} maxWidth="180px" />
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
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }: any) => (
        <div className="max-w-[150px]">
          <ExpandableText content={row.getValue("publisher")} maxWidth="150px" />
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => <Badge variant="outline">{row.getValue("type")}</Badge>,
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
      accessorKey: "counts",
      header: "Titles",
      cell: ({ row }: any) => {
        const count = row.getValue("counts") as number;
        return <div className="text-center font-medium">{count > 0 ? count.toLocaleString() : '-'}</div>;
      },
    },
  ];

  const handleRemoveSubscription = async (avId: number) => {
    setIsRemoving(true);
    
    try {
      const response = await fetch("/api/av/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: [avId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove subscription`);
      }

      const result = await response.json();
      
      // Update local state to remove the item
      setRemovedIds(prev => new Set([...prev, avId]));
      
      toast.success(`Successfully removed access for AV record ${avId}.`);
      
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
            onClick={() => router.push(`/admin/survey/avdb/${year}`)}
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

  const handleBulkRemove = async (avIds: number[]) => {
    setIsRemoving(true);
    
    try {
      const response = await fetch("/api/av/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: avIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove subscriptions`);
      }

      const result = await response.json();
      
      // Update local state to remove the items
      setRemovedIds(prev => new Set([...prev, ...avIds]));
      
      toast.success(`Successfully removed ${avIds.length} access.`);
      
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
      <DataTable 
        data={data} 
        columns={getColumns()} 
        Toolbar={ManagementToolbar}
        tableKey={`avdb-subscription-${libid}-${year}`}
      />
      
      {editingRecord && (
        <EditSubscriptionDialog
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
