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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ NEW
import { toast } from "sonner"; // ✅ NEW
import { listAV } from "./data/schema";
import { languages, type } from "./data/data";

export default function EditAVModal({
  open,
  onOpenChangeAction,
  rowData,
  year,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  rowData: listAV;
  year: number;
}) {
  const router = useRouter(); // ✅ NEW

  // No normalization needed - match exactly with languages array
  const normalizeLabel = (label: string) => label;

  const [saving, setSaving] = useState(false); // ✅ NEW

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
    type: rowData.type || "",
  });

  // Reset form data when modal opens with new rowData
  useEffect(() => {
    if (open) {
      console.log("🔄 Modal opened with rowData:", {
        id: rowData.id,
        title: rowData.title,
        counts: rowData.counts,
        countsType: typeof rowData.counts
      });
      
      setFormData({
        title: rowData.title,
        cjk_title: rowData.cjk_title || "",
        romanized_title: rowData.romanized_title || "",
        subtitle: rowData.subtitle || "",
        description: rowData.description || "",
        counts: rowData.counts,
        publisher: rowData.publisher || "",
        notes: rowData.notes || "",
        data_source: rowData.data_source || "",
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
        type: rowData.type || "",
      });
    }
  }, [open, rowData]);

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
      setSaving(true);
      
      const payload = { id: rowData.id, year, ...formData };
      
      // Debug logging
      console.log("📤 Sending update request:", {
        id: rowData.id,
        year,
        counts: formData.counts,
        countsType: typeof formData.counts,
        fullPayload: payload
      });
      
      const res = await fetch("/api/av/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      console.log("📥 API Response:", { ok: res.ok, status: res.status, data });
      
      if (!res.ok) {
        console.error("Update failed:", data?.error || data);
        toast.error(data?.error || "Failed to update AV record");
        return;
      }

      // ✅ Show success message
      toast.success("AV record updated successfully");
      
      // Close modal
      onOpenChangeAction(false);
      
      // ✅ Refresh data without losing table state (sorting, filters)
      router.refresh();
    } catch (error) {
      console.error("Request error:", error);
      toast.error("An error occurred while updating the record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className='bg-white text-black max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit AV Record - {year}</DialogTitle>
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
              className='w-full border rounded px-2 py-1 min-h-[80px] resize-y'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Counts</label>
            <Input
              type='number' // ✅ ensure numeric
              inputMode='numeric'
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
              className='w-full border rounded px-2 py-1 min-h-[80px] resize-y'
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
              variant='outline'
              disabled={saving} // ✅
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
