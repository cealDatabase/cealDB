"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { listEJournal } from "./data/schema";

export default function EditEJournalModal({
  open,
  onOpenChange,
  rowData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: listEJournal;
}) {
  const [formData, setFormData] = useState({
    title: rowData.title,
    counts: rowData.counts,
    notes: rowData.notes || "",
    publisher: rowData.publisher || "",
  });

  const handleSubmit = async () => {
    // Replace with actual API call
    console.log("Updating row with:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-white text-black'>
        <DialogHeader>
          <DialogTitle>Edit AV Record</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <Input
            placeholder='Title'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Input
            placeholder='Counts'
            value={formData.counts}
            onChange={(e) =>
              setFormData({ ...formData, counts: Number(e.target.value) })
            }
          />
          <Input
            placeholder='Publisher'
            value={formData.publisher}
            onChange={(e) =>
              setFormData({ ...formData, publisher: e.target.value })
            }
          />
          <Input
            placeholder='Notes'
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <Button onClick={handleSubmit} className='w-full'>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
