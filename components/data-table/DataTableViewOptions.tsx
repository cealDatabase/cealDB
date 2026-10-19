"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

/** Column names in words, also used by the list view's sort menu (DataTable). */
export const columnLabels: Record<string, string> = {
  import_origin: "Origin",
  origin_institution: "Created by institution",
  cjk_title: "CJK title",
  title: "English title",
  romanized_title: "Romanized title",
  subtitle: "Subtitle",
  language: "Language",
  type: "Type",
  publisher: "Publisher",
  description: "Description & source",
  notes: "Notes",
  subscribers: "Subscribers",
  counts: "Counts",
  volumes: "Volumes",
  chapters: "Chapters",
  journals: "Journals",
  dbs: "Databases",
  series: "Series",
  vendor: "Vendor",
  sub_series_number: "Sub-series",
};

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 shrink-0">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(70vh,32rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto bg-white"
      >
        <DropdownMenuLabel>Choose table columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              // Keep the chooser open so several columns can be toggled in one pass.
              onSelect={(event) => event.preventDefault()}
            >
              {columnLabels[column.id] ?? column.id.replace(/_/g, " ")}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
