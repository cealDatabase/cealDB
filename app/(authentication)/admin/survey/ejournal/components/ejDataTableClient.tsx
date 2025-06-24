"use client";

import { listEJournal } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "./data-table-toolbar";

export default function EJournalDataTableClient({
  data,
  year,
}: {
  data: listEJournal[];
  year: number;
}) {
  const columns = getColumns(year);
  return <DataTable data={data} columns={columns} Toolbar={DataTableToolbar} />;
}
