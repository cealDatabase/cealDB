"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import EditSubscriptionDialog from "./EditSubscriptionDialog";

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
    toast.success("Subscription updated successfully!");
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
      accessorKey: "id",
      header: "Record ID",
      cell: ({ row }: any) => <div className="text-center font-mono text-sm">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "cjk_title",
      header: "CJK Title",
      cell: ({ row }: any) => <div className="max-w-[180px] truncate">{row.getValue("cjk_title")}</div>,
    },
    {
      accessorKey: "title",
      header: "English Title",
      cell: ({ row }: any) => <div className="max-w-[180px] truncate">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }: any) => <div className="max-w-[150px] truncate">{row.getValue("publisher")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => <Badge variant="outline">{row.getValue("type")}</Badge>,
    },
    {
      accessorKey: "is_global",
      header: "Global",
      cell: ({ row }: any) => {
        const isGlobal = row.getValue("is_global") as boolean;
        return (
          <div className="flex justify-center">
            {isGlobal ? (
              <Badge className="bg-green-100 text-green-800 border-green-300">Global</Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">Library</Badge>
            )}
          </div>
        );
      },
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
      
      toast.success(`Successfully removed subscription for AV record ${avId}.`);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error("Remove subscription error:", error);
      toast.error("There was an error removing the subscription. Please try again.");
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
        {/* Header with Add More Subscriptions button */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Current Subscriptions</h3>
            <p className="text-sm text-blue-700 mt-1">
              {data.length} subscription{data.length === 1 ? '' : 's'} for {year}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={() => router.push(`/admin/survey/avdb/${year}`)}
          >
            ➕ Add More Subscriptions
          </Button>
        </div>

        {/* Table controls */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {data.length} subscription{data.length === 1 ? '' : 's'}
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
      
      toast.success(`Successfully removed ${avIds.length} subscription${avIds.length === 1 ? '' : 's'}.`);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error("Bulk remove subscription error:", error);
      toast.error("There was an error removing the subscriptions. Please try again.");
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
