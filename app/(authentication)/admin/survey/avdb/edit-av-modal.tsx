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
import { listAV } from "./data/schema";
import { languages, type } from "./data/data";

export default function EditAVModal({
  open,
  onOpenChange,
  rowData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: listAV;
}) {
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
    language: rowData.language.map((lang) => lang.language_id) || [],
    type: rowData.type || "",
  });

  const handleLanguageChange = (id: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      language: checked
        ? [...prev.language, id]
        : prev.language.filter((langId) => langId !== id),
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/av/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rowData.id,
          ...formData,
        }),
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
          <DialogTitle>Edit AV Record</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 max-h-[75vh] overflow-y-auto pr-2'>
          <div>
            <label className='text-sm font-medium'>Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>CJK Title</label>
            <Input
              value={formData.cjk_title}
              onChange={(e) =>
                setFormData({ ...formData, cjk_title: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Romanized Title</label>
            <Input
              value={formData.romanized_title}
              onChange={(e) =>
                setFormData({ ...formData, romanized_title: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Subtitle</label>
            <Input
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Description</label>
            <textarea
            className="w-full border rounded px-2 py-1 min-h-[80px] resize-y"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Counts</label>
            <Input
              value={formData.counts}
              onChange={(e) =>
                setFormData({ ...formData, counts: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Publisher</label>
            <Input
              value={formData.publisher}
              onChange={(e) =>
                setFormData({ ...formData, publisher: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Notes</label>
            <textarea
            className="w-full border rounded px-2 py-1 min-h-[80px] resize-y"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Data Source</label>
            <Input
              value={formData.data_source}
              onChange={(e) =>
                setFormData({ ...formData, data_source: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className='w-full border rounded-md px-3 py-2 text-sm'
            >
              {type.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium'>Languages</label>
            <div className='grid grid-cols-2 gap-2'>
              {languages.map((lang) => (
                <div key={lang.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`lang-${lang.value}`}
                    checked={formData.language.includes(lang.value)}
                    onCheckedChange={(checked) =>
                      handleLanguageChange(lang.value, Boolean(checked))
                    }
                  />
                  <label htmlFor={`lang-${lang.value}`} className='text-sm'>
                    {lang.label}
                  </label>
                </div>
              ))}
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
