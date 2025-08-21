import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { listEJournal } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Row type: add per-year fields */
type EJournalRow = listEJournal & {
  journals?: number | null;
  dbs?: number | null;
  /** optional legacy alias some loaders might still provide */
  counts?: number | null;
};

/* keep your Expandable* helpers exactly as they are ... */

export function getColumns(
  year: number,
  roleIdPassIn?: string
): ColumnDef<EJournalRow>[] {
  return [
    // ... select, id, etc. unchanged ...

    /** 🔽 Replace the old "counts" column with two columns */
    {
      accessorKey: "journals",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Journals (# titles)' />
      ),
      cell: ({ row }) => {
        // graceful fallback to 'counts' if your data still uses that key
        const v =
          (row.getValue("journals") as number | null | undefined) ??
          (row.original as any).counts ??
          0;
        return <div className='max-w-[80px]'>{v}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "dbs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Databases' />
      ),
      cell: ({ row }) => {
        const v = (row.getValue("dbs") as number | null | undefined) ?? 0;
        return <div className='max-w-[80px]'>{v}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },

    // ... the rest of your columns (title, language, description, notes, vendor, subscribers, actions) unchanged ...
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} year={year} basePath='ejournal' />
      ),
    },
  ];
}
