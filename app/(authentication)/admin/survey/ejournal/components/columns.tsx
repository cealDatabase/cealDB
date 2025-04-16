"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { languages } from "../data/data"
import { listEJournal } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export function getColumns(year: number): ColumnDef<listEJournal>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => <div className='w-[50px]'>{row.getValue("id")}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "counts",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Counts' />
      ),
      cell: ({ row }) => (
        <div className='max-w-[200px]'>{row.getValue("counts")}</div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "sub_series_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sub-Series Number' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("sub_series_number")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "publisher",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Publisher' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("publisher")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Description' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("description")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Notes' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("notes")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Updated At' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("updated_at")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "subtitle",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subtitle' />
      ),
      cell: ({ row }) => {
        const subtitleHtml = row.getValue("subtitle") as string;
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'
              dangerouslySetInnerHTML={{ __html: subtitleHtml }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "series",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Series' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("series")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "vendor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Vendor' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("vendor")}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "cjk_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='CJK' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("cjk_title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "romanized_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Romanized' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("romanized_title")}
            </span>
          </div>
        );
      },
    },


    {
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Language' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2 justify-center'>
            {(row.getValue("language") as number[])?.map(
              (lang) => (
                <span
                  key={lang}
                  className='max-w-[500px] font-medium'
                >
                  {lang}
                </span>
              )
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "subscribers",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subscribers' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='w-[200px] font-medium'>
              {row.getValue("subscribers")}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];
}
