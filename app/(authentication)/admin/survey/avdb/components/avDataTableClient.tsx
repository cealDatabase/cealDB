"use client";

import { listAV } from "../data/schema";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

export default function AVDataTableClient({
  data,
  year,
}: {
  data: listAV[];
  year: number;
}) {
  const columns = getColumns(year);
  return <DataTable data={data} columns={columns} />;
}
