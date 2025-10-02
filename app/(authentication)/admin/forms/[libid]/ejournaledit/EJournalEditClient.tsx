"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface EJournalRecord {
  id: number;
  title: string;
  subtitle: string;
  cjk_title: string;
  romanized_title: string;
  description: string;
  notes: string;
  publisher: string;
  data_source: string;
  series: string;
  vendor: string;
  sub_series_number: string;
  is_global: boolean;
  updated_at: string;
}

export default function EJournalEditClient({
  libid,
  year,
  rows,
}: {
  libid: number;
  year: number;
  rows: EJournalRecord[];
}) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const router = useRouter();

  // Define columns for the subscription editor
  const getColumns = () => [
    {
      id: "select",
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "cjk_title",
      header: "CJK Title",
      cell: ({ row }: any) => (
        <div className="max-w-[200px] truncate">{row.getValue("cjk_title")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "English Title",
      cell: ({ row }: any) => (
        <div className="max-w-[200px] truncate">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }: any) => (
        <div className="max-w-[150px] truncate">{row.getValue("publisher")}</div>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => (
        <div className="max-w-[120px] truncate">{row.getValue("vendor")}</div>
      ),
    },
    {
      accessorKey: "series",
      header: "Series",
      cell: ({ row }: any) => (
        <div className="max-w-[120px] truncate">{row.getValue("series")}</div>
      ),
    },
  ];

  const handleSubscribeSelected = async (selectedRowIds: number[]) => {
    if (selectedRowIds.length === 0) {
      toast.error("Please select at least one record to subscribe to.");
      return;
    }

    setIsSubscribing(true);
    
    try {
      console.log("Attempting to subscribe with:", { libid, year, recordIds: selectedRowIds });
      
      const response = await fetch("/api/ejournal/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libid,
          year,
          recordIds: selectedRowIds,
        }),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to subscribe to records`);
      }

      const result = await response.json();
      console.log("Subscription result:", result);
      
      toast.success(`Successfully subscribed to ${result.data.successCount} E-Journal record${result.data.successCount === 1 ? "" : "s"}! Redirecting...`);

      // Redirect to subscription management page
      setTimeout(() => {
        router.push(`/admin/forms/${libid}/ejournaledit?year=${year}`);
      }, 2000);

    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("There was an error subscribing to the selected records. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Custom toolbar component that includes subscription functionality
  const SubscriptionToolbar = ({ table }: { table: any }) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row: any) => row.original.id);
    
    return (
      <div className="space-y-4">
        {/* Header with Back button */}
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div>
            <h3 className="text-lg font-medium text-blue-900">Add E-Journal Subscriptions</h3>
            <p className="text-sm text-blue-700 mt-1">
              Select records below and click Subscribe to add them to your library's collection
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/survey/ejournal/${year}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Survey
          </Button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {selectedRows.length} of {rows.length} selected
            </Badge>
          </div>
          
          <Button
            size="lg"
            onClick={() => handleSubscribeSelected(selectedIds)}
            disabled={isSubscribing || selectedIds.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubscribing 
              ? "Subscribing..." 
              : `Subscribe to Selected (${selectedIds.length})`
            }
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DataTable 
        data={rows} 
        columns={getColumns()} 
        Toolbar={SubscriptionToolbar}
      />
    </div>
  );
}
