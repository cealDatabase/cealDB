import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { listEJournal } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Row shape for the table (adds per-year fields) */
type EJournalRow = listEJournal & {
  journals?: number | null;
  dbs?: number | null;
  /** optional legacy alias some loaders might still provide */
  counts?: number | null;
  language?: string[]; // labels for display/filtering
};

/* ───────────────────── Helper cells ───────────────────── */

const ExpandableText = ({ content }: { content: string | string[] | null }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return <span className='text-muted-foreground italic'>null</span>;
  }

  const fullText = Array.isArray(content) ? content.join("\n") : content;
  const preview =
    fullText.length > 80 ? fullText.substring(0, 80) + "…" : fullText;
  const needsPopover =
    fullText.length > 80 || (Array.isArray(content) && content.length > 1);

  if (!needsPopover) return <span className='font-medium'>{fullText}</span>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className='text-left text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer w-full max-w-[300px] min-w-[250px] truncate'>
          {preview}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 max-h-[400px] overflow-y-scroll'
        side='right'
      >
        <div className='text-sm'>
          {Array.isArray(content) ? (
            <div className='space-y-1'>
              {content.map((item, idx) => (
                <p key={idx} className='font-medium'>
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className='font-medium'>{fullText}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ExpandableTextWithSource = ({
  description,
  dataSource,
}: {
  description: string | null;
  dataSource: string | null | undefined;
}) => {
  if (!description)
    return <span className='text-muted-foreground italic'>null</span>;

  const isValidDataSource =
    !!dataSource &&
    typeof dataSource === "string" &&
    dataSource.trim() !== "" &&
    (dataSource.startsWith("http://") || dataSource.startsWith("https://"));

  const preview =
    description.length > 80 ? description.substring(0, 80) + "…" : description;
  const needsPopover = description.length > 80 || isValidDataSource;

  if (!needsPopover) return <span className='font-medium'>{description}</span>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className='text-left text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer w-full max-w-[300px] min-w-[250px] truncate'>
          {preview}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 max-h-[400px] overflow-y-scroll'
        side='right'
      >
        <div className='text-sm space-y-3'>
          <div>
            <h4 className='font-semibold text-xs uppercase text-muted-foreground mb-1'>
              Description
            </h4>
            <p className='font-medium'>{description}</p>
          </div>

          {isValidDataSource && (
            <div>
              <h4 className='font-semibold text-xs uppercase text-muted-foreground mb-1'>
                Data Source
              </h4>
              <a
                href={dataSource}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:underline break-all text-orange-800'
              >
                {dataSource}
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ExpandableSubscribers = ({
  subscribers,
}: {
  subscribers: string[] | string | null;
}) => {
  if (
    !subscribers ||
    (Array.isArray(subscribers) && subscribers.length === 0)
  ) {
    return <span className='text-muted-foreground italic'>null</span>;
  }

  const listArray = Array.isArray(subscribers)
    ? subscribers
    : [String(subscribers)];
  const count = listArray.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className='text-teal-700 font-medium hover:text-primary hover:underline transition-colors cursor-pointer'>
          {count}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 max-h-[500px] overflow-y-scroll'
        side='right'
      >
        <div className='text-sm space-y-1'>
          {listArray.map((sub, idx) => (
            <p key={idx} className='font-medium break-all'>
              {sub}
            </p>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/* ───────────────────── Columns ───────────────────── */

export function getColumns(
  year: number,
  roleIdPassIn?: string
): ColumnDef<EJournalRow>[] {
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} year={year} basePath='ejournal' />
      ),
    },

    /** Journals & Databases (per-year) */
    {
      accessorKey: "journals",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>Journals<br />(# titles)</>} />
      ),
      cell: ({ row }) => {
        const v =
          (row.getValue("journals") as number | null | undefined) ??
          (row.original as any).counts ??
          0;
        return <div className='max-w-[60px]'>{v}</div>;
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
        return <div className='max-w-[60px]'>{v}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },

    /** CJK Title first, then English Title */
    {
      accessorKey: "cjk_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>CJK<br />Title</>} />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='min-w-[100px] max-w-[500px] font-medium'>
            {row.getValue("cjk_title")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>English<br />Title</>} />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='min-w-[200px] max-w-[500px] font-medium'>
            {row.getValue("title")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "romanized_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Romanized' />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] font-medium'>
            {row.getValue("romanized_title")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "series",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Series' />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] font-medium'>
            {row.getValue("series")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "subtitle",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Subtitle' />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span
            className='max-w-[500px] font-medium'
            // matches your existing usage
            dangerouslySetInnerHTML={{
              __html: (row.getValue("subtitle") as string) || "",
            }}
          />
        </div>
      ),
    },

    /** Language kept as 'language' so toolbar can filter it */
    {
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Language' />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2 justify-center'>
          {(row.getValue("language") as string[])?.map((lang) => (
            <span key={lang} className='max-w-[200px] font-medium'>
              {lang}
            </span>
          ))}
        </div>
      ),
      filterFn: (row, id, value) => {
        const rowLanguages = row.getValue(id) as string[] | undefined;
        if (!Array.isArray(rowLanguages)) return false;
        const selected = value as string[];
        return rowLanguages.some((lang) => selected.includes(lang));
      },
    },

    {
      accessorKey: "sub_series_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>Sub-Series<br />Number</>} />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] font-medium'>
            {row.getValue("sub_series_number")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "publisher",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Publisher' />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] font-medium'>
            {row.getValue("publisher")}
          </span>
        </div>
      ),
    },

    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={<>Description<br />& Source</>} />
      ),
      cell: ({ row }) => {
        const description =
          (row.original as { description?: string | null }).description ?? null;
        const dataSource =
          (row.original as { data_source?: string | null }).data_source ?? null;
        return (
          <ExpandableTextWithSource
            description={description}
            dataSource={dataSource}
          />
        );
      },
    },

    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Notes' />
      ),
      cell: ({ row }) => (
        <ExpandableText content={row.getValue("notes") as string | null} />
      ),
    },

    {
      accessorKey: "vendor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Vendor' />
      ),
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='max-w-[500px] font-medium'>
            {row.getValue("vendor")}
          </span>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },

    ...(roleIdPassIn?.trim() !== "2"
      ? ([
          {
            accessorKey: "subscribers",
            header: ({ column }: { column: any }) => (
              <DataTableColumnHeader column={column} title='Subscribers' />
            ),
            cell: ({ row }: { row: any }) => {
              const subscribers = row.getValue("subscribers") as
                | string[]
                | string
                | null
                | undefined;
              if (
                !subscribers ||
                (Array.isArray(subscribers) && subscribers.length === 0)
              ) {
                return (
                  <span className='text-muted-foreground italic'>
                    null
                  </span>
                );
              }
              const list = Array.isArray(subscribers)
                ? subscribers
                : [String(subscribers)];
              return <ExpandableSubscribers subscribers={list} />;
            },
          } as ColumnDef<EJournalRow>,
        ] as ColumnDef<EJournalRow>[])
      : []),
  ];
}
