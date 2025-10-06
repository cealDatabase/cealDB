"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { getColumns } from "@/app/(authentication)/admin/survey/avdb/components/columns";
import type { listAV } from "@/app/(authentication)/admin/survey/avdb/data/schema";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: number;
  title: string;
  subtitle: string | null;
  cjk_title: string | null;
  romanized_title: string | null;
  description: string | null;
  notes: string | null;
  publisher: string | null;
  data_source: string | null;
  type: string | null;
  counts: number;
  language: string[];
  is_global: boolean;
  year: number;
  updated_at: string;
};

export default function AvdbEditClient({
  libid,
  year,
  rows,
}: {
  libid: number;
  year: number;
  rows: listAV[];
}) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedIds, setSubscribedIds] = useState<Set<number>>(new Set());
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const router = useRouter();

  // Load subscription status on component mount
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        const recordIds = rows.map(row => row.id).join(",");
        const response = await fetch(
          `/api/av/subscription-status?libid=${libid}&year=${year}&recordIds=${recordIds}`
        );
        
        if (response.ok) {
          const result = await response.json();
          const subscribed = new Set<number>(
            result.data.subscriptions
              .filter((sub: any) => sub.isSubscribed)
              .map((sub: any) => sub.recordId as number)
          );
          setSubscribedIds(subscribed);
        }
      } catch (error) {
        console.error("Failed to load subscription status:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    loadSubscriptionStatus();
  }, [libid, year, rows]);

  // Get columns but filter out the 'actions' column since we don't want edit functionality on ADD page
  const columns = getColumns(year, "2").filter(col => (col as any).id !== "actions");

  const handleSubscribeSelected = async (selectedRowIds: number[]) => {
    if (selectedRowIds.length === 0) {
      toast.error("Please select at least one record to subscribe to.");
      return;
    }

    setIsSubscribing(true);
    
    try {
      console.log("Attempting to subscribe with:", { libid, year, recordIds: selectedRowIds });
      
      const response = await fetch("/api/av/subscribe", {
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
      
      // Update subscribed IDs
      setSubscribedIds(prev => new Set([...prev, ...selectedRowIds]));
      
      toast.success(`Successfully subscribed to ${selectedRowIds.length} record${selectedRowIds.length === 1 ? "" : "s"}! Redirecting to your subscription management page...`);

      // Redirect to subscription management page to see all subscriptions
      setTimeout(() => {
        router.push(`/admin/forms/${libid}/avdbedit`);
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
    const selectedAlreadySubscribed = selectedIds.filter((id: number) => subscribedIds.has(id));
    const selectedNotSubscribed = selectedIds.filter((id: number) => !subscribedIds.has(id));
    
    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {selectedRows.length} of {rows.length} selected
          </Badge>
          {subscribedIds.size > 0 && (
            <Badge variant="secondary">
              {subscribedIds.size} total subscribed
            </Badge>
          )}
          {selectedAlreadySubscribed.length > 0 && (
            <Badge variant="destructive">
              {selectedAlreadySubscribed.length} selected already subscribed
            </Badge>
          )}
          {isLoadingStatus && (
            <Badge variant="outline">
              Loading status...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/survey/avdb/${year}?libid=${libid}`)}
          >
            Back to Survey
          </Button>
          <Button
            onClick={() => handleSubscribeSelected(selectedNotSubscribed)}
            disabled={isSubscribing || selectedNotSubscribed.length === 0 || isLoadingStatus}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubscribing 
              ? "Subscribing..." 
              : `Subscribe Selected (${selectedNotSubscribed.length})`
            }
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>AV — Editor (Library {libid})</h1>
        <p className='text-sm text-muted-foreground'>
          Showing {rows.length} selected record{rows.length === 1 ? "" : "s"}{" "}
          for {year}.
        </p>
      </div>

      <div className="rounded-md border bg-card p-4">
        <h2 className="text-lg font-medium mb-2">Subscription Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select the records you want to subscribe to for {year}. This will add them to your library's collection.
        </p>
        
        {/* DataTable with custom toolbar for subscription */}
        <DataTable 
          data={rows} 
          columns={columns} 
          Toolbar={SubscriptionToolbar}
        />
      </div>
    </div>
  );
}
