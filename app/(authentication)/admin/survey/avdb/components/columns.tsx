import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import { type } from "../data/data"
import { listAV } from "../data/schema"
import { listAVWithSelection } from "./getAVList"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Dynamic import for client-only components to avoid hydration mismatch
const ClientDataTableRowActions = dynamic(
  () => import("./data-table-row-actions").then((mod) => mod.DataTableRowActions),
  { ssr: false }
)

// Expandable text component using Popover from Shadcn UI
// Utility to render text or list with popover capability
const ExpandableText = ({ content }: { content: string | string[] | null }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return <span></span>
  }

  // Convert array to display string
  const fullText = Array.isArray(content) ? content.join("\n") : content;

  const preview = fullText.length > 60 ? fullText.substring(0, 60) + "..." : fullText;
  const needsPopover = fullText.length > 60 || (Array.isArray(content) && content.length > 1)

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
          {Array.isArray(content) ? (
            <div className="space-y-1">
              {content.map((item, idx) => (
                <p key={idx} className="font-medium">{item}</p>
              ))}
            </div>
          ) : (
            <p className="font-medium">{fullText}</p>
          )}
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
  const isValidDataSource = !!dataSource &&
    typeof dataSource === 'string' &&
    dataSource.trim() !== '' &&
    (dataSource.startsWith('http://') || dataSource.startsWith('https://'))

  // If no description and no valid data source, show empty
  if (!description && !isValidDataSource) {
    return <span></span>
  }

  // If no description but has data source, show only data source link
  if (!description && isValidDataSource) {
    return (
      <a
        href={dataSource}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-700 hover:text-primary hover:underline font-medium break-all"
      >
        {dataSource}
      </a>
    )
  }

  // Has description
  const needsPopover = description!.length > 60 || isValidDataSource

  if (!needsPopover) {
    return <span className="font-medium">{description}</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer w-full max-w-[200px] min-w-[150px]">
          <div className="line-clamp-3">
            {description}
          </div>
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

// Expandable subscribers list: shows count as button and full list in popover
const ExpandableSubscribers = ({ subscribers }: { subscribers: string[] | string | null }) => {
  if (!subscribers || (Array.isArray(subscribers) && subscribers.length === 0)) {
    return <span></span>;
  }

  const listArray = Array.isArray(subscribers) ? subscribers : [String(subscribers)];
  const count = listArray.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer">
          {count}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[500px] overflow-y-scroll" side="right">
        <div className="text-sm space-y-1">
          {listArray.map((sub, idx) => (
            <p key={idx} className="font-medium break-all">
              {sub}
            </p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Notes column component with 2-line clamp
const ExpandableNotes = ({ content }: { content: string | null }) => {
  if (!content) {
    return <span></span>
  }

  const needsPopover = content.length > 60; // Approximate check for 3 lines

  if (!needsPopover) {
    return <span className="font-medium">{content}</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer w-full max-w-[200px] min-w-[150px]">
          <div className="line-clamp-3">
            {content}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[400px] overflow-y-scroll" side="right">
        <div className="text-sm">
          <p className="font-medium whitespace-pre-wrap">{content}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
};
export function getColumns(
  year: number, 
  roleIdPassIn?: string,
  onSelectionChange?: (id: number, selected: boolean) => void,
  onCustomCountChange?: (id: number, count: number | null) => void,
  selectionData?: Map<number, { is_selected: boolean; custom_count: number | null }>
): ColumnDef<listAV | listAVWithSelection>[] {
  // Parse role cookie (can be JSON array or single value)
  let userRoles: string[] = [];
  if (roleIdPassIn) {
    try {
      userRoles = roleIdPassIn.startsWith('[') ? JSON.parse(roleIdPassIn) : [roleIdPassIn];
    } catch (error) {
      console.error('Error parsing role in columns:', error);
      userRoles = [roleIdPassIn];
    }
  }

  // Helper to get selection state for a row
  const getSelectionState = (id: number) => {
    if (selectionData?.has(id)) {
      return selectionData.get(id)!;
    }
    return { is_selected: false, custom_count: null };
  };
  
  // Hide Actions column ONLY for users who have ONLY role 2 or ONLY role 4 (no other roles)
  // Show Actions for admins, super admins, or users with multiple roles
  const shouldShowActions = !(userRoles.length === 1 && (userRoles[0] === "2" || userRoles[0] === "4"));

  return [
    // User selection checkbox column (new)
    {
      id: "user_selection",
      header: ({ table }) => {
        const rows = table.getRowModel().rows;
        const allSelected = rows.length > 0 && rows.every(row => {
          const state = getSelectionState((row.original as any).id);
          return state.is_selected;
        });
        const someSelected = rows.some(row => {
          const state = getSelectionState((row.original as any).id);
          return state.is_selected;
        });
        
        return (
          <Checkbox
            checked={allSelected || (someSelected && "indeterminate")}
            onCheckedChange={(value) => {
              rows.forEach(row => {
                onSelectionChange?.((row.original as any).id, !!value);
              });
            }}
            aria-label='Select all for survey'
            className='translate-y-[2px]'
          />
        );
      },
      cell: ({ row }) => {
        const id = (row.original as any).id as number;
        const { is_selected } = getSelectionState(id);
        
        return (
          <Checkbox
            checked={is_selected}
            onCheckedChange={(value) => onSelectionChange?.(id, !!value)}
            aria-label='Select for survey'
            className='translate-y-[2px]'
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    // Custom count input column (new)
    {
      id: "custom_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>Custom<br />Count</>} />
      ),
      cell: ({ row }) => {
        const id = (row.original as any).id as number;
        const { custom_count } = getSelectionState(id);
        
        return (
          <Input
            type="number"
            value={custom_count ?? ""}
            onChange={(e) => {
              const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
              onCustomCountChange?.(id, value);
            }}
            placeholder="-"
            className="w-[80px] h-8 text-center"
            min={0}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 100,
    },
    ...(shouldShowActions
      ? [{
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: any }) => <ClientDataTableRowActions row={row} year={year} userRoles={userRoles} />,
        } as ColumnDef<listAV>]
      : []),
    {
      accessorKey: "counts",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Counts' />
      ),
      cell: ({ row }) => {
        const value = row.getValue("counts") as number | null | undefined;
        return (
          <div className='max-w-[80px]'>{value != null ? value : ""}</div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "cjk_title",
      header: ({ column}) => (
        <DataTableColumnHeader column={column} title={<>CJK<br />Title</>} />
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>English<br />Title</>} />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='min-w-[150px] max-w-[500px] font-medium'>
              {row.getValue("title")}
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
                {lang === "NON" ? "NON-CJK" : lang}
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
        <DataTableColumnHeader column={column} title={<>Description<br />& Source</>} />
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
    },
    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Notes' />
      ),
      cell: ({ row }) => {
        return <ExpandableNotes content={row.getValue("notes")} />;
      },
    },
    
    ...(!(userRoles.length === 1 && userRoles[0] === "2")
      ? [{
        accessorKey: "subscribers",
        header: ({ column }: { column: any }) => (
          <DataTableColumnHeader column={column} title='Subscribers' />
        ),
        cell: ({ row }: { row: any }) => {
          const subscribers = row.getValue("subscribers") as string[] | string | null | undefined;
          if (!subscribers || (Array.isArray(subscribers) && subscribers.length === 0)) {
            return <span></span>;
          }

          const subscriberList = Array.isArray(subscribers) ? subscribers : [String(subscribers)];
          return <ExpandableSubscribers subscribers={subscriberList} />;
        },
      }]
      : [])
  ];
}