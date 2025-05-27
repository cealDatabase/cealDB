"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { listEBook } from "./data/schema";
import { languages } from "./data/data";

type EditEbookModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: listEBook;
};

export default function EditEbookModal({
  open,
  onOpenChange,
  rowData,
}: EditEbookModalProps) {
  const [formData, setFormData] = useState({
    title: rowData.title,
    subtitle: rowData.subtitle || "",
    description: rowData.description || "",
    notes: rowData.notes || "",
    publisher: rowData.publisher || "",
    data_source: rowData.data_source || "",
    cjk_title: rowData.cjk_title || "",
    romanized_title: rowData.romanized_title || "",
    counts: rowData.counts,
    sub_series_number: rowData.sub_series_number || "",
    is_global: rowData.is_global || false,
    language: Array.isArray(rowData.language)
      ? rowData.language
          .map((label) => {
            const match = languages.find((l) => l.label === label);
            return match ? String(match.value) : null;
          })
          .filter((id): id is string => id !== null)
      : [],
  });

  const handleLanguageChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      language: checked
        ? [...prev.language, id]
        : prev.language.filter((langId) => langId !== id),
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/ebook/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowData.id, ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Update failed:", data.error);
        return;
      }

      console.log("Update successful:", data);
      onOpenChange(false);
    } catch (error) {
      console.error("Request error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-white text-black max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit Ebook Record</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 max-h-[75vh] overflow-y-auto pr-2'>
          {[
            ["Title", "title"],
            ["Subtitle", "subtitle"],
            ["CJK Title", "cjk_title"],
            ["Romanized Title", "romanized_title"],
            ["Publisher", "publisher"],
            ["Data Source", "data_source"],
            ["Sub-series Number", "sub_series_number"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className='text-sm font-medium'>{label}</label>
              <Input
                value={(formData as any)[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <div>
            <label className='text-sm font-medium'>Description</label>
            <textarea
              className='w-full border rounded px-2 py-1 min-h-[80px] resize-y'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Notes</label>
            <textarea
              className='w-full border rounded px-2 py-1 min-h-[80px] resize-y'
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Counts</label>
            <Input
              type='number'
              value={formData.counts}
              onChange={(e) =>
                setFormData({ ...formData, counts: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Languages</label>
            <div className='grid grid-cols-2 gap-2'>
              {languages.map((lang) => {
                const langIdStr = String(lang.value);
                return (
                  <div key={langIdStr} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`lang-${langIdStr}`}
                      checked={formData.language.includes(langIdStr)}
                      onCheckedChange={(checked) =>
                        handleLanguageChange(langIdStr, Boolean(checked))
                      }
                    />
                    <label htmlFor={`lang-${langIdStr}`} className='text-sm'>
                      {lang.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={handleSubmit} className='w-full'>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
