'use client';

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { copyCounts } from "@/actions/copyCounts";
import type { ResourceType, CopyRecordsResult } from "@/lib/copyRecords";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData extends { id: number; counts?: number }>({ table }: DataTablePaginationProps<TData>) {
  // Year options range from 2017 to the current year
  const beginYear = 2017;
  const years = Array.from({ length: new Date().getFullYear() - beginYear + 1 }, (_, i) => beginYear + i);

  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const [isCopying, setIsCopying] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"" | "success" | "error" | "warning">("");
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [copiedRecords, setCopiedRecords] = useState<{ id: number; counts: number }[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  // Determine resource segment (e.g. avdb, ebook, ejournal)
  const segments = pathname.split("/").filter(Boolean);
  const resourceSegment = segments[segments.length - 2] ?? "";
  let apiResource = resourceSegment;
  // Map folder segment to API resource
  if (apiResource === "avdb") apiResource = "av";

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleCopy = async () => {
    if (!selectedRows.length) return;
    setIsCopying(true);
    // ===== Monitor Logs: handleCopy invoked =====
    console.log("[handleCopy] Invoked");
    console.log("[handleCopy] selectedRows:", selectedRows);
    console.log("[handleCopy] targetYear:", targetYear);
    try {
      const records = selectedRows.map((row: any) => ({
        id: (row.original as any).id,
        counts: (row.original as any).counts ?? 0,
      }));

      console.log("Copy payload:", { targetYear, records });
      setCopiedRecords(records);
      setCopyStatus("");
      setCopyMessage("");

      // Call server action
      console.log("[handleCopy] calling copyCounts server action...");
      const result = await copyCounts(apiResource as ResourceType, targetYear, records);
      console.log("[handleCopy] server action resolved", result);

      // Handle different result scenarios with appropriate status
      if (result.alreadyExists) {
        setCopyStatus("warning");
        setCopyMessage(`Already copied: All ${result.existingCount} record(s) already exist in year ${targetYear}`);
      } else if (result.isPartialCopy) {
        setCopyStatus("success");
        setCopyMessage(`Partial Copy Success: ${result.processed} new record(s) copied, ${result.skippedCount} already existed in year ${targetYear}. Database sequences synchronized.`);
      } else if (result.processed > 0) {
        setCopyStatus("success");
        setCopyMessage(`Copy Success: ${result.processed} record(s) copied to year ${targetYear}. Database sequences synchronized.`);
      } else {
        setCopyStatus("success");
        setCopyMessage("Copy Success");
      }

      // // Navigate to the target year page so the user can immediately see the copied data
      // const newPath = pathname.replace(/\d{4}$/g, String(targetYear));
      // // ===== Monitor Logs: navigation =====
      // console.log("[handleCopy] Navigating to:", newPath);
      // router.push(newPath);
      // router.refresh();
    } catch (error) {
      console.error("Copy error:", error);
      setCopyStatus("error");
      setCopyMessage((error as any)?.message || "Copy failed");
    } finally {
      setIsCopying(false);
    }
  }
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground flex items-center space-x-2">
        <span>
          {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
        </span>
        {selectedRows.length > 0 && (
          <>
            <Select
              value={String(targetYear)}
              onValueChange={(value) => setTargetYear(Number(value))}
            >
              <SelectTrigger className="h-8 w-[90px]">
                <SelectValue placeholder={targetYear} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white max-h-56">
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={isCopying}
            >
              {isCopying ? "Copying..." : "Copy"}
            </Button>
            {/* Feedback message */}
            {copyStatus && (
              <span
                className={`text-sm ${
                  copyStatus === "success" 
                    ? "text-green-600" 
                    : copyStatus === "warning" 
                    ? "text-orange-700" 
                    : "text-red-600"
                }`}
              >
                {copyStatus === "error" ? "Copy Failed" : copyMessage}
              </span>
            )}
            {/* Detailed record list */}
            {copiedRecords.length > 0 && (
              <div className="text-xs max-h-32 overflow-auto border rounded p-2 bg-gray-50 whitespace-pre-wrap">
                {copiedRecords.map((rec) => (
                  <div key={rec.id}>{JSON.stringify(rec)}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-white">
              {[20, 50, 100, 200].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
