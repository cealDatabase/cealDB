"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    };
  }>;
  libid: number;
  year: number;
  mode: "view" | "add";
  libraryName: string;
}

export default function EBookSubscriptionManagementClient({
  subscriptions,
  libid,
  year,
  mode,
  libraryName
}: EBookSubscriptionManagementClientProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

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
    }));

  // Define columns for the management view
  const getColumns = () => [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const bookId = row.getValue("id");
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemoveSubscription(bookId)}
            disabled={isRemoving}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }: any) => <div className="w-16">{row.getValue("id")}</div>,
      enableHiding: true,
    },
    {
      accessorKey: "cjk_title",
      header: "CJK Title",
      cell: ({ row }: any) => <div className="max-w-[200px] truncate">{row.getValue("cjk_title")}</div>,
    },
    {
      accessorKey: "title",
      header: "English Title",
      cell: ({ row }: any) => <div className="max-w-[200px] truncate">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }: any) => <div className="max-w-[150px] truncate">{row.getValue("publisher")}</div>,
    },
    {
      accessorKey: "subtitle",
      header: "Subtitle",
      cell: ({ row }: any) => <div className="max-w-[150px] truncate">{row.getValue("subtitle")}</div>,
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
      
      toast.success(`Successfully removed E-Book subscription for record ${bookId}.`);
      
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
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-purple-900">Current Subscriptions</h3>
            <p className="text-sm text-purple-700 mt-1">
              {data.length} subscription{data.length === 1 ? '' : 's'} for {year}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            onClick={() => router.push(`/admin/survey/ebook/${year}`)}
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
      
      toast.success(`Successfully removed ${bookIds.length} E-Book subscription${bookIds.length === 1 ? '' : 's'}.`);
      
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
      <div className="rounded-md border bg-card p-4">
        <h2 className="text-lg font-medium mb-2">Current E-Book Subscriptions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your library's E-Book subscriptions for {year}. You can remove individual subscriptions or select multiple to remove at once.
        </p>
        
        <DataTable 
          data={data} 
          columns={getColumns()} 
          Toolbar={ManagementToolbar}
        />
      </div>
    </div>
  );
}
