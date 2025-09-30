"use client";

import { listEJournal } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";

export default function EJournalDataTableClient({
  data,
  year,
  roleIdPassIn,
  libid,
}: {
  data: listEJournal[];
  year: number;
  roleIdPassIn: string | undefined;
  libid?: number;
}) {
  const columns = getColumns(year, roleIdPassIn);
  
  // Inject libid + year + roleId into the toolbar
  const ToolbarWithLib = (props: any) => (
    <DataTableToolbar {...props} year={year} libid={libid} roleId={roleIdPassIn} />
  );
  
  return <DataTable data={data} columns={columns} Toolbar={ToolbarWithLib} />;
}
