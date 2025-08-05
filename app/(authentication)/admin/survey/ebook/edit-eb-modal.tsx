"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { listEBook } from "./data/schema";
import { languages } from "./data/data";

// 👇 put at the top of edit-eb-modal.tsx, after imports
type EBookWithCounts = listEBook & {
  volumes?: number | null;
  chapters?: number | null;
};

type Props = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  rowData: listEBook;
  year: number;
};

export default function EditEbookModal({
  open,
  onOpenChangeAction,
  rowData,
  year,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  rowData: EBookWithCounts; // ⬅️ use the patched type
  year: number;
}) {
  /*───────── util to map NON → NONCJK label ─────────*/
  const normalizeLabel = (l: string) => (l === "NON" ? "NONCJK" : l);

  /*───────── local form state ─────────*/
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    notes: "",
    publisher: "",
    data_source: "",
    cjk_title: "",
    romanized_title: "",
    sub_series_number: "",
    counts: 0,
    volumes: 0,
    chapters: 0,
    language: [] as string[], // array of language-id strings
    is_global: false,
  });

  /*── populate form when modal opens ─────────────────────*/
  useEffect(() => {
    if (!open) return;

    setForm({
      title: rowData.title ?? "",
      subtitle: rowData.subtitle ?? "",
      description: rowData.description ?? "",
      notes: rowData.notes ?? "",
      publisher: rowData.publisher ?? "",
      data_source: rowData.data_source ?? "",
      cjk_title: rowData.cjk_title ?? "",
      romanized_title: rowData.romanized_title ?? "",
      sub_series_number: rowData.sub_series_number ?? "",
      counts: rowData.counts ?? 0,
      volumes: rowData.volumes ?? 0,
      chapters: rowData.chapters ?? 0,
      language: Array.isArray(rowData.language)
        ? rowData.language
            .map(
              (lbl) =>
                languages.find((l) => l.label === normalizeLabel(lbl))?.value
            )
            .filter(Boolean)
            .map((id) => String(id))
        : [],
      is_global: !!rowData.is_global,
    });
  }, [open, rowData]);

  /*───────── helpers ─────────*/
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const toggleLang = (id: string, checked: boolean) =>
    setForm((p) => ({
      ...p,
      language: checked
        ? [...p.language, id]
        : p.language.filter((x) => x !== id),
    }));

  /*───────── save to API ─────────*/
  async function handleSave() {
    const res = await fetch("/api/ebook/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: rowData.id,
        ...form,
        counts: Number(form.counts),
        volumes: form.volumes ? Number(form.volumes) : null,
        chapters: form.chapters ? Number(form.chapters) : null,
        language: form.language.map(Number), // strings → numbers
        year,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      onOpenChangeAction(false);
      window.location.reload(); // refresh list
    } else {
      alert(data.error ?? "Update failed");
    }
  }

  /*───────── UI ─────────*/
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className='bg-white text-black max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit E-Book Record – {year}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 max-h-[75vh] overflow-y-auto pr-2'>
          {/** Simple text inputs */}
          {(
            [
              ["Title", "title"],
              ["Subtitle", "subtitle"],
              ["CJK Title", "cjk_title"],
              ["Romanized Title", "romanized_title"],
              ["Publisher", "publisher"],
              ["Data Source", "data_source"],
              ["Sub-series Number", "sub_series_number"],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <Label className='text-sm'>{label}</Label>
              <Input
                value={(form as any)[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}

          {/** Description + Notes */}
          {(["Description", "Notes"] as const).map((lbl) => {
            const k = lbl.toLowerCase() as "description" | "notes";
            return (
              <div key={k}>
                <Label className='text-sm'>{lbl}</Label>
                <textarea
                  className='w-full border rounded px-2 py-1 min-h-[80px] resize-y'
                  value={(form as any)[k]}
                  onChange={(e) => set(k, e.target.value)}
                />
              </div>
            );
          })}

          {/** Numeric trio */}
          <div className='grid sm:grid-cols-3 gap-4'>
            {(
              [
                ["Counts (# titles)", "counts"],
                ["Volumes", "volumes"],
                ["Chapters", "chapters"],
              ] as const
            ).map(([lbl, key]) => (
              <div key={key}>
                <Label className='text-sm'>{lbl}</Label>
                <Input
                  type='number'
                  value={(form as any)[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          {/** Languages */}
          <div className='space-y-1'>
            <Label className='text-sm'>Languages</Label>
            <div className='grid grid-cols-2 gap-2'>
              {languages.map((lang) => {
                const idStr = String(lang.value);
                return (
                  <div key={idStr} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`lang-${idStr}`}
                      checked={form.language.includes(idStr)}
                      onCheckedChange={(c) => toggleLang(idStr, Boolean(c))}
                    />
                    <label htmlFor={`lang-${idStr}`} className='text-sm'>
                      {lang.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/** Global flag */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_global'
              checked={form.is_global}
              onCheckedChange={() => set("is_global", !form.is_global)}
            />
            <Label htmlFor='is_global'>Is Global</Label>
          </div>

          {/** Save button */}
          <div className='flex justify-end'>
            <Button
              onClick={handleSave}
              variant='outline'
              className='hover:bg-gray-900 hover:text-white'
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
