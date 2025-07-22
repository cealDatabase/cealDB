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
import { listEJournal } from "./data/schema";
import { languages } from "./data/data";



type EditEjournalModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  rowData: listEJournal;
  year: number;
};

export default function EditEjournalModal({
  open,
  onOpenChangeAction,
  rowData,
  year,
}: EditEjournalModalProps) {

  const normalizeLabel = (label: string) => {
    if (label === "NON") return "NONCJK";
    return label;
  };

  const [formData, setFormData] = useState({
    title: rowData.title,
    cjk_title: rowData.cjk_title || "",
    romanized_title: rowData.romanized_title || "",
    subtitle: rowData.subtitle || "",
    description: rowData.description || "",
    counts: rowData.counts,
    publisher: rowData.publisher || "",
    notes: rowData.notes || "",
    data_source: rowData.data_source || "",
    sub_series_number: rowData.sub_series_number || "",
    is_global: rowData.is_global || false,
    language: Array.isArray(rowData.language)
      ? rowData.language
        .map(
          (langLabel) =>
            languages.find((l) => l.label === normalizeLabel(langLabel))
              ?.value
        )
        .filter((id) => id !== undefined)
        .map((id) => String(id))
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
      const res = await fetch("/api/ejournal/update", {
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
      onOpenChangeAction(false);
    } catch (error) {
      console.error("Request error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className='bg-white text-black max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit Ejournal Record - {year}</DialogTitle>
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
                      className='hover:bg-blue-300/30 hover:cursor-pointer'
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

          <div className='flex justify-end'>
            <Button
              onClick={handleSubmit}
              variant="outline"
              className='hover:bg-gray-900 hover:text-white hover:cursor-pointer'
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}