"use client";

import { listEBook } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EBookDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
  userRoles,
  initialSearch,
  newRecordId,
}: {
  data: listEBook[];
  year: number;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
  libid?: number;
  initialSearch?: string;
  newRecordId?: number;
}) {
  const router = useRouter();
  const columns = getColumns(year, roleIdPassIn);
  const [highlightId, setHighlightId] = useState(newRecordId);

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
    
    console.log(`📍 New E-Book #${newRecordId} found at position ${position}, navigating to page ${pageIndex}`);
    
    return { pageIndex, pageSize };
  }, [data, newRecordId]);

  // Inject libid + year + roleId into the toolbar
  const ToolbarWithLib = (props: any) => (
    <DataTableToolbar {...props} year={year} libid={libid} roleId={roleIdPassIn} />
  );

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
    />
  );
}
