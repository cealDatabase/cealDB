"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Download } from "lucide-react";
import { toast } from "sonner";
import EditEJournalSubscriptionDialog from "./EditEJournalSubscriptionDialog";
import { DataTableFacetedFilter } from "@/components/data-table/DataTableFacetedFilter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EJournalSubscriptionManagementClientProps {
  subscriptions: Array<{
    libraryyear_id: number;
    listejournal_id: number;
    List_EJournal: {
      id: number;
      title: string | null;
      publisher: string | null;
      description: string | null;
      notes: string | null;
      updated_at: Date;
      subtitle: string | null;
      series: string | null;
      vendor: string | null;
      cjk_title: string | null;
      romanized_title: string | null;
      data_source: string | null;
      is_global: boolean | null;
      libraryyear: number | null;
      List_EJournal_Counts?: Array<{ journals: number | null; dbs: number | null }>;
      List_EJournal_Language?: Array<{ Language: { short: string | null } }>;
    };
  }>;
  libid: number;
  year: number;
  mode: "view" | "add";
  libraryName: string;
  roleId?: string;
}

export default function EJournalSubscriptionManagementClient({
  subscriptions,
  libid,
  year,
  mode,
  libraryName,
  roleId
}: EJournalSubscriptionManagementClientProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    .filter(sub => !removedIds.has(sub.listejournal_id))
    .map((sub) => {
      return {
        id: sub.List_EJournal.id,
        title: sub.List_EJournal.title ?? "",
        publisher: sub.List_EJournal.publisher ?? "",
        description: sub.List_EJournal.description ?? "",
        notes: sub.List_EJournal.notes ?? "",
        subtitle: sub.List_EJournal.subtitle ?? "",
        cjk_title: sub.List_EJournal.cjk_title ?? "",
        romanized_title: sub.List_EJournal.romanized_title ?? "",
        data_source: sub.List_EJournal.data_source ?? "",
        series: sub.List_EJournal.series ?? "",
        vendor: sub.List_EJournal.vendor ?? "",
        is_global: !!sub.List_EJournal.is_global,
        updated_at: sub.List_EJournal.updated_at.toISOString(),
        journals: sub.List_EJournal.List_EJournal_Counts?.[0]?.journals ?? 0,
        dbs: sub.List_EJournal.List_EJournal_Counts?.[0]?.dbs ?? 0,
        language: sub.List_EJournal.List_EJournal_Language?.map(l => l.Language?.short).filter(Boolean) as string[] || [],
      };
    });

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
        <div className="max-w-[250px]">
          <ExpandableText content={row.getValue("title")} maxWidth="250px" />
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
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => (
        <div className="max-w-[120px]">
          <ExpandableText content={row.getValue("vendor")} maxWidth="120px" />
        </div>
      ),
    },
    {
      accessorKey: "series",
      header: "Series",
      cell: ({ row }: any) => (
        <div className="max-w-[120px]">
          <ExpandableText content={row.getValue("series")} maxWidth="120px" />
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
      accessorKey: "journals",
      header: "Journals",
      cell: ({ row }: any) => {
        const count = row.getValue("journals") as number;
        return <div className="text-center font-medium">{count > 0 ? count.toLocaleString() : '-'}</div>;
      },
    },
    {
      accessorKey: "dbs",
      header: "DBs",
      cell: ({ row }: any) => {
        const count = row.getValue("dbs") as number;
        return <div className="text-center font-medium">{count > 0 ? count.toLocaleString() : '-'}</div>;
      },
    },
  ];

  const handleRemoveSubscription = async (journalId: number) => {
    setIsRemoving(true);
    
    try {
      const response = await fetch("/api/ejournal/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: [journalId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove subscription`);
      }

      const result = await response.json();
      
      // Update local state to remove the item
      setRemovedIds(prev => new Set([...prev, journalId]));
      
      toast.success(`Successfully removed access for E-Journal record ${journalId}.`);
      
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

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      // CSV headers matching the visible columns
      const headers = [
        'CJK Title',
        'English Title',
        'Publisher',
        'Vendor',
        'Series',
        'Language',
        'Journals',
        'DBs'
      ];

      // Helper function to escape CSV fields
      const escapeCSV = (field: any): string => {
        if (field === null || field === undefined || field === '') return '';
        const str = String(field);
        if (str.includes('"') || str.includes(',') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Helper to format array fields
      const formatArray = (field: any): string => {
        if (Array.isArray(field)) {
          return field.map(lang => lang === 'NON' ? 'NON-CJK' : lang).join('; ');
        }
        return String(field || '');
      };

      // Build CSV rows from the current data
      const csvRows = [headers.join(',')];

      for (const record of data) {
        const row = [
          escapeCSV(record.cjk_title),
          escapeCSV(record.title),
          escapeCSV(record.publisher),
          escapeCSV(record.vendor),
          escapeCSV(record.series),
          escapeCSV(formatArray(record.language)),
          escapeCSV(record.journals),
          escapeCSV(record.dbs)
        ];
        csvRows.push(row.join(','));
      }

      // Add UTF-8 BOM for proper Excel encoding of CJK characters
      const csvContent = '\uFEFF' + csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${libraryName.replace(/[^a-zA-Z0-9]/g, '_')}_EJournal_Access_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Exported ${data.length} E-Journal access records successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export E-Journal access');
    } finally {
      setIsExporting(false);
    }
  };

  // Custom toolbar for subscription management
  const ManagementToolbar = ({ table }: { table: any }) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row: any) => row.original.id);
    
    return (
      <div className="space-y-4">
        {/* Header with Add More to My Access button */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Current Access</h3>
            <p className="text-sm text-blue-700 mt-1">
              {data.length} access for {year}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="outline"
              className="shadow-md"
              onClick={handleExportCSV}
              disabled={isExporting || data.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              onClick={() => router.push(`/admin/survey/ejournal/${year}`)}
            >
              ➕ Add More to My Access
            </Button>
          </div>
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

  const handleBulkRemove = async (journalIds: number[]) => {
    setIsRemoving(true);
    
    try {
      const response = await fetch("/api/ejournal/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: journalIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to remove subscriptions`);
      }

      const result = await response.json();
      
      // Update local state to remove the items
      setRemovedIds(prev => new Set([...prev, ...journalIds]));
      
      toast.success(`Successfully removed ${journalIds.length} access.`);
      
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
        <h2 className="text-lg font-medium mb-2">Current E-Journal Access</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your library's E-Journal access for {year}. You can remove individual access or select multiple to remove at once.
        </p>
        
        <DataTable 
          data={data} 
          columns={getColumns()} 
          Toolbar={ManagementToolbar}
          tableKey={`ejournal-subscription-${libid}-${year}`}
        />
      </div>

      {editingRecord && (
        <EditEJournalSubscriptionDialog
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
