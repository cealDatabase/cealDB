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
import { useRouter } from "next/navigation"; // ✅ NEW
import { listEJournal } from "./data/schema";
import { languages } from "./data/data";

type Props = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  rowData: listEJournal & {
    counts?: number | null; // legacy shape (if your table only supplies counts)
    journals?: number | null;
    dbs?: number | null;
  };
  year: number;
  userRoles?: string[];
};

export default function EditEjournalModal({
  open,
  onOpenChangeAction,
  rowData,
  year,
  userRoles,
}: Props) {
  const router = useRouter(); // ✅
  const [saving, setSaving] = useState(false); // ✅

  // No normalization needed - match exactly with languages array
  const normalizeLabel = (label: string) => label;

  // helper near the top of the component
  const labelToId = (lbl: string): number | undefined =>
    languages.find((l) => l.label === normalizeLabel(lbl))?.value;

  // Check if user is super admin (role 1) or eresource editor (role 3)
  const isAutoGlobal = userRoles?.includes("1") || userRoles?.includes("3");

  const [formData, setFormData] = useState({
    title: rowData.title || "",
    cjk_title: rowData.cjk_title || "",
    romanized_title: rowData.romanized_title || "",
    subtitle: rowData.subtitle || "",
    description: rowData.description || "",
    publisher: rowData.publisher || "",
    notes: rowData.notes || "",
    data_source: rowData.data_source || "",
    sub_series_number: (rowData as any).sub_series_number || "",
    is_global: isAutoGlobal ? true : !!rowData.is_global,
    // ↴ Use journals/dbs if present; fall back to counts for journals; dbs default 0
    journals: (rowData as any).journals ?? (rowData as any).counts ?? 0,
    dbs: (rowData as any).dbs ?? 0,
    language: Array.isArray((rowData as any).language)
      ? ((rowData as any).language as string[])
          .map(labelToId)
          .filter((val): val is number => typeof val === "number") // <-- typed filter
          .map((val) => String(val))
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
      setSaving(true); // ✅
      const res = await fetch("/api/ejournal/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: (rowData as any).id,
          year, // ✅ include year
          // counts alias is not needed anymore; send journals/dbs explicitly
          journals: Number(formData.journals) || 0,
          dbs: formData.dbs === "" ? null : Number(formData.dbs),
          // scalar fields:
          title: formData.title,
          cjk_title: formData.cjk_title,
          romanized_title: formData.romanized_title,
          subtitle: formData.subtitle,
          description: formData.description,
          publisher: formData.publisher,
          notes: formData.notes,
          data_source: formData.data_source,
          sub_series_number: formData.sub_series_number,
          is_global: !!formData.is_global,
          // languages as numbers:
          language: formData.language.map(Number),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Update failed:", data?.detail || data?.error);
        return;
      }

      onOpenChangeAction(false);
      router.refresh(); // ✅ instant UI update
    } catch (error) {
      console.error("Request error:", error);
    } finally {
      setSaving(false);
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

          {/* Replace single "Counts" with Journals + Databases */}
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>Journals (# titles)</label>
              <Input
                type='number'
                value={(formData as any).journals}
                onChange={(e) =>
                  setFormData({ ...formData, journals: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Databases</label>
              <Input
                type='number'
                value={(formData as any).dbs}
                onChange={(e) =>
                  setFormData({ ...formData, dbs: Number(e.target.value) })
                }
              />
            </div>
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

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_global'
              checked={formData.is_global}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_global: Boolean(checked) })
              }
              disabled={isAutoGlobal}
              className='hover:bg-blue-300/30 hover:cursor-pointer'
            />
            <label htmlFor='is_global' className='text-sm font-medium'>
              Is Global {isAutoGlobal && <span className='text-xs text-muted-foreground'>(Auto-enabled for your role)</span>}
            </label>
          </div>

          <div className='flex justify-end'>
            <Button
              onClick={handleSubmit}
              variant='outline'
              disabled={saving}
              className='hover:bg-gray-900 hover:text-white hover:cursor-pointer'
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
