"use client";

import { listAV } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";

export default function AVDataTableClient({
  data,
  year,
  roleIdPassIn,
}: {
  data: listAV[];
  year: number;
  roleIdPassIn: string | undefined;
}) {
  const columns = getColumns(year, roleIdPassIn);
  return <DataTable data={data} columns={columns} Toolbar={DataTableToolbar} />;
}
