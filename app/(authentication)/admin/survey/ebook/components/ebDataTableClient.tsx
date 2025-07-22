"use client";

import { listEBook } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";

export default function EBookDataTableClient({
  data,
  year,
  roleIdPassIn,
}: {
  data: listEBook[];
  year: number;
  roleIdPassIn: string | undefined;
}) {
  const columns = getColumns(year, roleIdPassIn);
  return <DataTable data={data} columns={columns} Toolbar={DataTableToolbar} />;
}
