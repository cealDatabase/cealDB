"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ NEW
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

type EBookWithCounts = listEBook & {
  volumes?: number | null;
  chapters?: number | null;
};

export default function EditEbookModal({
  open,
  onOpenChangeAction,
  rowData,
  year,
  userRoles,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  rowData: EBookWithCounts;
  year: number;
  userRoles?: string[];
}) {
  const router = useRouter(); // ✅ NEW
  const [saving, setSaving] = useState(false); // ✅ NEW

  // No normalization needed - match exactly with languages array
  const normalizeLabel = (l: string) => l;

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
    language: [] as string[],
    is_global: false,
  });

  // Check if user is super admin (role 1) or eresource editor (role 3)
  const isAutoGlobal = userRoles?.includes("1") || userRoles?.includes("3");

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
      is_global: isAutoGlobal ? true : (!!rowData.is_global),
    });
  }, [open, rowData, userRoles]);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const toggleLang = (id: string, checked: boolean) =>
    setForm((p) => ({
      ...p,
      language: checked
        ? [...p.language, id]
        : p.language.filter((x) => x !== id),
    }));

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/ebook/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rowData.id,
          ...form,
          counts: Number(form.counts) || 0,
          volumes:
            form.volumes === null || form.volumes === ("" as any)
              ? null
              : Number(form.volumes),
          chapters:
            form.chapters === null || form.chapters === ("" as any)
              ? null
              : Number(form.chapters),
          language: form.language.map(Number),
          year, // ✅ include year
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data?.detail || data?.error || "Update failed");
        return;
      }

      onOpenChangeAction(false);
      router.refresh(); // ✅ instant UI update
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className='bg-white text-black max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit E-Book Record – {year}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 max-h-[75vh] overflow-y-auto pr-2'>
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

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_global'
              checked={form.is_global}
              onCheckedChange={() => set("is_global", !form.is_global)}
              disabled={isAutoGlobal}
            />
            <Label htmlFor='is_global'>
              Is Global {isAutoGlobal && <span className='text-xs text-muted-foreground'>(Auto-enabled for your role)</span>}
            </Label>
          </div>

          <div className='flex justify-end'>
            <Button
              onClick={handleSave}
              variant='outline'
              disabled={saving}
              className='hover:bg-gray-900 hover:text-white'
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
