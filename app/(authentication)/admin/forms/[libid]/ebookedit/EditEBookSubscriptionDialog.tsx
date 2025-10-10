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

interface EditEBookSubscriptionDialogProps {
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
    sub_series_number: string;
    titles: number;
    volumes: number;
    chapters: number;
    language: string[];
    is_global: boolean;
  };
  libid: number;
  year: number;
  onSuccess: () => void;
  roleId?: string;
}

export default function EditEBookSubscriptionDialog({
  open,
  onOpenChange,
  record,
  libid,
  year,
  onSuccess,
  roleId,
}: EditEBookSubscriptionDialogProps) {
  const [saving, setSaving] = useState(false);
  
  // Check if fields should be disabled (role 2 or 4, and editing a global record)
  // For E-Book: Only titles, volumes, and chapters should be editable
  // Role cookie is stored as JSON array, e.g., '["2"]' or '["1","4"]'
  const getUserRoles = (): string[] => {
    if (!roleId) return [];
    try {
      return JSON.parse(roleId);
    } catch {
      return [];
    }
  };
  
  const userRoles = getUserRoles();
  const isMemberOnly = userRoles.length === 1 && userRoles[0] === "2"; // Only role 2, no other roles
  const isAssistantAdmin = userRoles.includes("4");
  const shouldDisableFields = isMemberOnly || isAssistantAdmin; // Disable fields for member-only and assistant admin
  const isRestrictedEdit = shouldDisableFields;

  const normalizeLabel = (label: string) => label === "NON" ? "NON-CJK" : label;

  // Initialize form data with current record values
  const [formData, setFormData] = useState({
    title: record.title || "",
    cjk_title: record.cjk_title || "",
    romanized_title: record.romanized_title || "",
    subtitle: record.subtitle || "",
    description: record.description || "",
    titles: record.titles || 0,
    volumes: record.volumes || 0,
    chapters: record.chapters || 0,
    publisher: record.publisher || "",
    notes: record.notes || "",
    data_source: record.data_source || "",
    sub_series_number: record.sub_series_number || "",
    language: record.language
      .map((langLabel) => {
        const normalized = normalizeLabel(langLabel);
        return languages.find((l) => l.label === normalized)?.value;
      })
      .filter((id): id is number => id !== undefined),
  });

  // Update form data when record changes
  useEffect(() => {
    setFormData({
      title: record.title || "",
      cjk_title: record.cjk_title || "",
      romanized_title: record.romanized_title || "",
      subtitle: record.subtitle || "",
      description: record.description || "",
      titles: record.titles || 0,
      volumes: record.volumes || 0,
      chapters: record.chapters || 0,
      publisher: record.publisher || "",
      notes: record.notes || "",
      data_source: record.data_source || "",
      sub_series_number: record.sub_series_number || "",
      language: record.language
        .map((langLabel) => {
          const normalized = normalizeLabel(langLabel);
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

      // Use the new /api/ebook/edit endpoint
      const res = await fetch("/api/ebook/edit", {
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

      // Show success message
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
            Edit E-Book Record - {year}
            {record.is_global && (
              <Badge variant="secondary" className="text-xs">
                Global Record
              </Badge>
            )}
          </DialogTitle>
          {isMemberOnly && record.is_global && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ This is a global record. You can only edit titles, volumes, and chapters. Saving changes will create a
              library-specific copy for your library.
            </p>
          )}
          {isMemberOnly && !record.is_global && (
            <p className="text-sm text-blue-600 mt-2">
              ℹ️ This is your library-specific record. You can only edit titles, volumes, and chapters.
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
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">CJK Title</label>
            <Input
              value={formData.cjk_title}
              onChange={(e) =>
                setFormData({ ...formData, cjk_title: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Romanized Title</label>
            <Input
              value={formData.romanized_title}
              onChange={(e) =>
                setFormData({ ...formData, romanized_title: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Sub Series Number</label>
            <Input
              value={formData.sub_series_number}
              onChange={(e) =>
                setFormData({ ...formData, sub_series_number: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className={`w-full border rounded px-2 py-1 min-h-[80px] resize-y ${
                isRestrictedEdit ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "bg-white"
              }`}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Titles</label>
              <Input
                type="number"
                inputMode="numeric"
                value={formData.titles}
                onChange={(e) =>
                  setFormData({ ...formData, titles: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Volumes</label>
              <Input
                type="number"
                inputMode="numeric"
                value={formData.volumes}
                onChange={(e) =>
                  setFormData({ ...formData, volumes: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Chapters</label>
              <Input
                type="number"
                inputMode="numeric"
                value={formData.chapters}
                onChange={(e) =>
                  setFormData({ ...formData, chapters: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Publisher</label>
            <Input
              value={formData.publisher}
              onChange={(e) =>
                setFormData({ ...formData, publisher: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className={`w-full border rounded px-2 py-1 min-h-[80px] resize-y ${
                isRestrictedEdit ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "bg-white"
              }`}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data Source</label>
            <Input
              value={formData.data_source}
              onChange={(e) =>
                setFormData({ ...formData, data_source: e.target.value })
              }
              disabled={isRestrictedEdit}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Languages</label>
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
                    disabled={isRestrictedEdit}
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
