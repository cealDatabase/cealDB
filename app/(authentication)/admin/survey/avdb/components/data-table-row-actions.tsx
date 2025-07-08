"use client"

import { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import EditAVModal from "../edit-av-modal";

export function DataTableRowActions({ row, year }: { row: Row<any>, year: number }) {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px] bg-white'>
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="hover:bg-blue-100/30">
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert("Delete logic here")} className="hover:bg-blue-100/30">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAVModal
        open={openEdit}
        onOpenChangeAction={setOpenEdit}
        rowData={row.original}
        year={year}
      />
    </>
  );
}
