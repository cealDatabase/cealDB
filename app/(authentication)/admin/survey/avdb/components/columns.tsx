"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { languages, type } from "../data/data"
import { listAV } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export function getColumns(year: number): ColumnDef<listAV>[] {
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
    // 要加水平滚动条，目前太难滚动了
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
      accessorKey: "subtitle",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subtitle' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              {row.getValue("subtitle")}
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
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const filtered_type = type.find(
          (singleType) => singleType.value === row.getValue("type")
        );

        if (!filtered_type) {
          return null;
        }

        return (
          <div className='flex items-center'>
            <span>{filtered_type.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
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
    }, // 太占篇幅，但还是要保留
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
    // {
    //   accessorKey: "is_global",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Global' />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <div className='flex space-x-2'>
    //         <span className='max-w-[500px] font-medium'>
    //           {row.getValue("is_global") === true ? "Yes" : "No"}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   accessorKey: "libraryyear",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Library Year' />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <div className='flex space-x-2'>
    //         <span className='max-w-[500px] font-medium'>
    //           {row.getValue("libraryyear")}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "data_source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Data Source' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] font-medium'>
              <a href={row.getValue("data_source")} target="_blank">{row.getValue("data_source")}</a>
            </span>
          </div>
        );
      },
    }, // 太占篇幅，但还是要保留
    {
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Language' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2 justify-center'>
            {(row.getValue("language") as string[])?.map((lang) => (
              <span key={lang} className='max-w-[500px] font-medium'>
                {lang}
              </span>
            ))}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const rowLanguages = row.getValue(id) as string[] | undefined;
        if (!Array.isArray(rowLanguages)) return false;
        const selected = value as string[];
        return rowLanguages.some((lang) => selected.includes(lang));
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
      cell: ({ row }) => <DataTableRowActions row={row} year={year}/>,
    },
  ];
}
