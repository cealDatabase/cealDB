"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { languages } from "../../data/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CreateAVForm({
  selectedYear,
}: {
  selectedYear: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    notes: "",
    publisher: "",
    data_source: "",
    cjk_title: "",
    romanized_title: "",
    type: "",
    counts: 0,
    language: [] as number[],
    is_global: false,
  });
  const [status, setStatus] = useState("");

  /*── handlers ───────────────────────────────────────────────*/
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleLang = (id: number) =>
    setForm((p) => ({
      ...p,
      language: p.language.includes(id)
        ? p.language.filter((v) => v !== id)
        : [...p.language, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/av/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        libraryyear: selectedYear,
        counts: Number(form.counts),
        language: form.language,
      }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/admin/survey/avdb/${selectedYear}`);
    else {
      setStatus(data.error ?? "Failed");
      alert(`Failed: ${data.detail ?? data.error}`);
    }
  };

  /*── UI ─────────────────────────────────────────────────────*/
  return (
    <form onSubmit={handleSubmit} className='grid gap-5 max-w-2xl'>
      {/* Title */}
      <div className='grid gap-1.5'>
        <Label htmlFor='title'>Title</Label>
        <Input
          id='title'
          name='title'
          value={form.title}
          onChange={handleChange}
        />
      </div>

      {/* Subtitle */}
      <div className='grid gap-1.5'>
        <Label htmlFor='subtitle'>Subtitle</Label>
        <Input
          id='subtitle'
          name='subtitle'
          value={form.subtitle}
          onChange={handleChange}
        />
      </div>

      {/* Publisher */}
      <div className='grid gap-1.5'>
        <Label htmlFor='publisher'>Publisher</Label>
        <Input
          id='publisher'
          name='publisher'
          value={form.publisher}
          onChange={handleChange}
        />
      </div>

      {/* Data Source */}
      <div className='grid gap-1.5'>
        <Label htmlFor='data_source'>Data Source</Label>
        <Input
          id='data_source'
          name='data_source'
          value={form.data_source}
          onChange={handleChange}
        />
      </div>

      {/* CJK + Romanized titles in two-column grid */}
      <div className='grid sm:grid-cols-2 gap-5'>
        <div className='grid gap-1.5'>
          <Label htmlFor='cjk_title'>CJK Title</Label>
          <Input
            id='cjk_title'
            name='cjk_title'
            value={form.cjk_title}
            onChange={handleChange}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='romanized_title'>Romanized Title</Label>
          <Input
            id='romanized_title'
            name='romanized_title'
            value={form.romanized_title}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Type */}
      <div className='grid gap-1.5'>
        <Label htmlFor='type'>Type</Label>
        <Input
          id='type'
          name='type'
          value={form.type}
          onChange={handleChange}
        />
      </div>

      {/* Counts */}
      <div className='grid gap-1.5'>
        <Label htmlFor='counts'>Counts</Label>
        <Input
          id='counts'
          name='counts'
          type='number'
          value={form.counts}
          onChange={handleChange}
        />
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
          onCheckedChange={() =>
            setForm((p) => ({ ...p, is_global: !p.is_global }))
          }
        />
        <Label htmlFor='is_global'>Is Global</Label>
      </div>

      <Button type='submit'>Create AV Entry</Button>
      {status && <p className='text-sm text-red-600'>{status}</p>}
    </form>
  );
}
