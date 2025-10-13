"use client";

import { listAV } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AVDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
  userRoles,
  initialSearch,
  newRecordId,
}: {
  data: listAV[];
  year: number;
  libid: number | undefined;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
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
        // Clean URL by removing newRecord parameter
        router.replace(`/admin/survey/avdb/${year}`, { scroll: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newRecordId, year, router]);

  // Calculate initial pagination if newRecordId is provided
  const initialPagination = useMemo(() => {
    if (!newRecordId) return undefined;
    
    // Find the position of the new record in sorted data
    const position = data.findIndex((record) => record.id === newRecordId);
    
    if (position === -1) return undefined;
    
    // Calculate page index (default page size is 10)
    const pageSize = 10;
    const pageIndex = Math.floor(position / pageSize);
    
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
      tableKey={`avdb-survey-${year}`}
    />
  );
}
