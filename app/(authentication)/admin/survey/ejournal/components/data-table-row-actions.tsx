"use client";

import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"; // or any toast lib
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import EditAVModal from "../edit-ej-modal"; // keep using same modal

type Props = {
  row: Row<any>;
  year: number;
  basePath?: "av" | "ebook" | "ejournal"; // default = "av"
};

export function DataTableRowActions({ row, year, basePath = "av" }: Props) {
  const router = useRouter();
  const [openEdit, setOpenEdit] = useState(false);

  /*── Delete handler ──────────────────────────────*/
  async function handleDelete() {
    const ok = confirm(`Delete “${row.original.title}” (${year})?`);
    if (!ok) return;

    const res = await fetch(`/api/${basePath}/${row.original.id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (res.ok) {
      toast.success("Entry deleted");
      router.refresh(); // revalidate table data
    } else {
      toast.error(data.error ?? "Delete failed");
    }
  }

  /*── JSX ─────────────────────────────────────────*/
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-40 bg-white'>
          {/* Edit */}
          <DropdownMenuItem
            onClick={() => setOpenEdit(true)}
            className='hover:bg-blue-100/30'
          >
            Edit
          </DropdownMenuItem>

          {/* Delete */}
          <DropdownMenuItem
            onClick={handleDelete}
            className='hover:bg-red-100/30 text-red-600'
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Re-use the existing modal component */}
      <EditAVModal
        open={openEdit}
        onOpenChangeAction={setOpenEdit}
        rowData={row.original}
        year={year}
      />
    </>
  );
}
