"use client"

import { toast } from "sonner"; // or any toast lib
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(`Delete “${row.original.title}” for ${year}?`);
    if (!ok) return;

    const res = await fetch(`/api/av/${row.original.id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      toast.success("Entry deleted");
      router.refresh(); // revalidates the current route so table refetches
    } else {
      toast.error(data.error ?? "Delete failed");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px] bg-white'>
          <DropdownMenuItem
            onClick={() => setOpenEdit(true)}
            className='hover:bg-blue-100/30'
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className='hover:bg-red-100/30 text-red-600'
          >
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
