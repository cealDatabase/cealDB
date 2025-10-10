"use client";

import { listAV } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";

export default function AVDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
  userRoles,
  initialSearch,
}: {
  data: listAV[];
  year: number;
  libid: number | undefined;
  roleIdPassIn: string | undefined;
  userRoles?: string[] | null;
  initialSearch?: string;
}) {
  const columns = getColumns(year, roleIdPassIn);

  // Inject libid + year + roleId into the toolbar
  const ToolbarWithLib = (props: any) => (
    <DataTableToolbar {...props} year={year} libid={libid} roleId={roleIdPassIn} />
  );

  return <DataTable data={data} columns={columns} Toolbar={ToolbarWithLib} userRoles={userRoles} initialGlobalFilter={initialSearch} />;
}
