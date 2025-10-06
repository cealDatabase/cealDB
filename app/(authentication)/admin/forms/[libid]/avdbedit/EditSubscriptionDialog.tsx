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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const languages = [
  { value: 1, label: "CHN" },
  { value: 2, label: "JPN" },
  { value: 3, label: "KOR" },
  { value: 4, label: "NON" },
];

const types = [
  { value: "online map", label: "online map" },
  { value: "online image/photograph", label: "online image/photograph" },
  { value: "streaming audio/music", label: "streaming audio/music" },
  { value: "streaming film/video", label: "streaming film/video" },
];

interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: {
    id: number;
    title: string;
    subtitle: string;
    cjk_title: string;
    romanized_title: string;
    description: string;
    notes: string;
    publisher: string;
    data_source: string;
    type: string;
    counts: number;
    language: string[];
    is_global: boolean;
  };
  libid: number;
  year: number;
  onSuccess: () => void;
}

export default function EditSubscriptionDialog({
  open,
  onOpenChange,
  record,
  libid,
  year,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const [saving, setSaving] = useState(false);

  // Initialize form data with current record values
  const [formData, setFormData] = useState({
    title: record.title || "",
    cjk_title: record.cjk_title || "",
    romanized_title: record.romanized_title || "",
    subtitle: record.subtitle || "",
    description: record.description || "",
    counts: record.counts || 0,
    publisher: record.publisher || "",
    notes: record.notes || "",
    data_source: record.data_source || "",
    type: record.type || "",
    language: record.language
      .map((langLabel) => {
        const normalized = langLabel === "NON" ? "NONCJK" : langLabel;
        return languages.find((l) => l.label === normalized)?.value;
      })
      .filter((id): id is number => id !== undefined),
  });

  // Update form data when record changes (when user clicks different edit buttons)
  useEffect(() => {
    setFormData({
      title: record.title || "",
      cjk_title: record.cjk_title || "",
      romanized_title: record.romanized_title || "",
      subtitle: record.subtitle || "",
      description: record.description || "",
      counts: record.counts || 0,
      publisher: record.publisher || "",
      notes: record.notes || "",
      data_source: record.data_source || "",
      type: record.type || "",
      language: record.language
        .map((langLabel) => {
          const normalized = langLabel === "NON" ? "NONCJK" : langLabel;
          return languages.find((l) => l.label === normalized)?.value;
        })
        .filter((id): id is number => id !== undefined),
    });
  }, [record]);

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
      setSaving(true);

      // Validate required fields
      if (!formData.title.trim()) {
        toast.error("Title is required");
        return;
      }

      if (formData.language.length === 0) {
        toast.error("At least one language must be selected");
        return;
      }

      // Use the new /api/av/edit endpoint that handles global vs library-specific logic
      const res = await fetch("/api/av/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: record.id,
          libid,
          year,
          ...formData,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to save changes");
      }

      // Show success message based on whether a new record was created
      if (data.isNewRecord) {
        toast.success(
          "Created library-specific copy successfully! Your changes are now saved to your library.",
          { duration: 4000 }
        );
      } else {
        toast.success("Record updated successfully!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Edit error:", error);
      toast.error(error.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-black max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit AV Record - {year}
            {record.is_global && (
              <Badge variant="secondary" className="text-xs">
                Global Record
              </Badge>
            )}
          </DialogTitle>
          {record.is_global && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ This is a global record. Saving changes will create a
              library-specific copy for your library.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">CJK Title</label>
            <Input
              value={formData.cjk_title}
              onChange={(e) =>
                setFormData({ ...formData, cjk_title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Romanized Title</label>
            <Input
              value={formData.romanized_title}
              onChange={(e) =>
                setFormData({ ...formData, romanized_title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[80px] resize-y"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Counts *</label>
            <Input
              type="number"
              inputMode="numeric"
              value={formData.counts}
              onChange={(e) =>
                setFormData({ ...formData, counts: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Publisher</label>
            <Input
              value={formData.publisher}
              onChange={(e) =>
                setFormData({ ...formData, publisher: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[80px] resize-y"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data Source</label>
            <Input
              value={formData.data_source}
              onChange={(e) =>
                setFormData({ ...formData, data_source: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type *</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select type...</option>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Languages *</label>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <div key={lang.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang.value}`}
                    className="hover:bg-blue-300/30 hover:cursor-pointer"
                    checked={formData.language.includes(lang.value)}
                    onCheckedChange={(checked) =>
                      handleLanguageChange(lang.value, Boolean(checked))
                    }
                  />
                  <label htmlFor={`lang-${lang.value}`} className="text-sm">
                    {lang.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
