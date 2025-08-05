"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { languages } from "../../data/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CreateEJournalForm({
  selectedYear,
}: {
  selectedYear: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    series: "",
    sub_series_number: "",
    vendor: "",
    description: "",
    notes: "",
    publisher: "",
    data_source: "",
    cjk_title: "",
    romanized_title: "",
    journals: 0,
    dbs: 0,
    language: [] as number[],
    is_global: false,
  });
  const [status, setStatus] = useState("");

  /*──────── input helpers ────────*/
  const setVal = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setVal(e.target.name, e.target.value);
  const toggleLang = (id: number) =>
    setVal(
      "language",
      form.language.includes(id)
        ? form.language.filter((v) => v !== id)
        : [...form.language, id]
    );

  /*──────── submit ───────────────*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving…");
    const res = await fetch("/api/ejournal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        libraryyear: selectedYear,
        journals: Number(form.journals),
        dbs: form.dbs ? Number(form.dbs) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/admin/survey/ejournal/${selectedYear}`);
    } else {
      setStatus(data.error ?? "Failed");
      alert(`Failed: ${data.detail ?? data.error}`);
    }
  };

  /*──────── UI ──────────────────*/
  return (
    <form onSubmit={handleSubmit} className='grid gap-5 max-w-2xl'>
      {[
        ["Title", "title"],
        ["Subtitle", "subtitle"],
        ["Series", "series"],
        ["Sub-series No.", "sub_series_number"],
        ["Vendor", "vendor"],
        ["Publisher", "publisher"],
        ["Data Source", "data_source"],
        ["CJK Title", "cjk_title"],
        ["Romanized Title", "romanized_title"],
      ].map(([lbl, key]) => (
        <div key={key} className='grid gap-1.5'>
          <Label htmlFor={key}>{lbl}</Label>
          <Input
            id={key}
            name={key}
            value={(form as any)[key]}
            onChange={handleChange}
          />
        </div>
      ))}

      {/* Description & Notes */}
      {["description", "notes"].map((k) => (
        <div key={k} className='grid gap-1.5'>
          <Label htmlFor={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</Label>
          <textarea
            id={k}
            name={k}
            className='border rounded p-2 w-full min-h-[80px] resize-y'
            value={(form as any)[k]}
            onChange={(e) => setVal(k, e.target.value)}
          />
        </div>
      ))}

      {/* Journals + DBs */}
      <div className='grid sm:grid-cols-2 gap-5'>
        <div className='grid gap-1.5'>
          <Label htmlFor='journals'># Journals</Label>
          <Input
            id='journals'
            name='journals'
            type='number'
            value={form.journals}
            onChange={handleChange}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='dbs'># Databases</Label>
          <Input
            id='dbs'
            name='dbs'
            type='number'
            value={form.dbs}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Languages */}
      <fieldset className='border p-4 rounded space-y-2'>
        <legend className='text-sm font-medium text-sky-700'>Languages</legend>
        {languages.map((lang) => (
          <div key={lang.value} className='flex items-center space-x-2'>
            <Checkbox
              id={`lang-${lang.value}`}
              checked={form.language.includes(lang.value)}
              onCheckedChange={() => toggleLang(lang.value)}
            />
            <Label htmlFor={`lang-${lang.value}`}>{lang.label}</Label>
          </div>
        ))}
      </fieldset>

      {/* Global toggle */}
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='is_global'
          checked={form.is_global}
          onCheckedChange={() => setVal("is_global", !form.is_global)}
        />
        <Label htmlFor='is_global'>Is Global</Label>
      </div>

      <Button type='submit'>Create E-Journal Entry</Button>
      {status && <p className='text-sm text-red-600'>{status}</p>}
    </form>
  );
}
