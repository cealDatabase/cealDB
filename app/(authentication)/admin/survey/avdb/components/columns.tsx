"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { type } from "../data/data"
import { listAV } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Expandable text component using Popover from Shadcn UI
const ExpandableText = ({ content }: { content: string | null }) => {
  if (!content) return <span className="text-muted-foreground italic">No content</span>
  
  const preview = content.length > 80 ? content.substring(0, 80) + '...' : content
  const needsPopover = content.length > 80
  
  if (!needsPopover) {
    return <span className="font-medium">{content}</span>
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer w-full max-w-[300px] min-w-[250px] truncate">
          {preview}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[400px] overflow-y-scroll" side="right">
        <div className="text-sm">
          <p className="font-medium">{content}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Enhanced expandable text with data source
const ExpandableTextWithSource = ({ 
  description, 
  dataSource 
}: { 
  description: string | null, 
  dataSource: string | null | undefined 
}) => {
  // Handle missing description
  if (!description) return <span className="text-muted-foreground italic">No description</span>
  
  // Check if data source is valid
  const isValidDataSource = !!dataSource && 
    typeof dataSource === 'string' && 
    dataSource.trim() !== '' &&
    (dataSource.startsWith('http://') || dataSource.startsWith('https://'))
  
  const preview = description.length > 80 ? description.substring(0, 80) + '...' : description
  const needsPopover = description.length > 80 || isValidDataSource
  
  if (!needsPopover) {
    return <span className="font-medium">{description}</span>
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer w-full max-w-[300px] min-w-[250px] truncate">
          {preview}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[400px] overflow-y-scroll" side="right">
        <div className="text-sm space-y-3">
          <div>
            <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Description</h4>
            <p className="font-medium">{description}</p>
          </div>
          
          {isValidDataSource && (
            <div>
              <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-1">Data Source</h4>
              <a 
                href={dataSource} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline break-all text-orange-800"
              >
                {dataSource}
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

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
    // TODO: hide ID column
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => <div className='w-[40px]'>{row.getValue("id")}</div>,
      enableSorting: true,
      enableHiding: false,
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='English Title' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='min-w-[250px] max-w-[500px] font-medium'>
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "cjk_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='CJK Title' />
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
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Language' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2 justify-center'>
            {(row.getValue("language") as string[])?.map((lang) => (
              <span key={lang} className='max-w-[200px] font-medium'>
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
        <DataTableColumnHeader column={column} title='Description & Source' />
      ),
      cell: ({ row }) => {
        // Gracefully handle missing description / data_source so that rendering never crashes
        const description = (row.original as { description?: string }).description ?? null;
        const dataSource = (row.original as { data_source?: string | null }).data_source ?? null;

        return (
          <ExpandableTextWithSource
            description={description ?? null}
            dataSource={dataSource ?? null}
          />
        );
      },
    }, // 太占篇幅，但还是要保留
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Notes' />
      ),
      cell: ({ row }) => {
        return <ExpandableText content={row.getValue("notes")} />;
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
    // Data source column removed - now combined with Description column
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
      cell: ({ row }) => <DataTableRowActions row={row} year={year} />,
    },
  ];
}
