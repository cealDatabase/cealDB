"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { languages } from "../../data/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CreateEBookForm({
  selectedYear,
}: {
  selectedYear: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    sub_series_number: "",
    description: "",
    notes: "",
    publisher: "",
    data_source: "",
    cjk_title: "",
    romanized_title: "",
    counts: 0,
    volumes: 0,
    chapters: 0,
    language: [] as number[],
    is_global: false,
  });
  const [status, setStatus] = useState("");

  /*────── handlers ──────*/
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
    const res = await fetch("/api/ebook/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        libraryyear: selectedYear,
        counts: Number(form.counts),
        volumes: Number(form.volumes) || null,
        chapters: Number(form.chapters) || null,
      }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/admin/survey/ebook/${selectedYear}`);
    else {
      setStatus(data.error ?? "Failed");
      alert(`Failed: ${data.detail ?? data.error}`);
    }
  };

  /*────── UI ──────*/
  return (
    <form onSubmit={handleSubmit} className='grid gap-5 max-w-2xl'>
      {/** Title */}
      <div className='grid gap-1.5'>
        <Label htmlFor='title'>Title</Label>
        <Input
          id='title'
          name='title'
          value={form.title}
          onChange={handleChange}
        />
      </div>

      {/** Subtitle */}
      <div className='grid gap-1.5'>
        <Label htmlFor='subtitle'>Subtitle</Label>
        <Input
          id='subtitle'
          name='subtitle'
          value={form.subtitle}
          onChange={handleChange}
        />
      </div>

      {/** Series / Number */}
      <div className='grid gap-1.5'>
        <Label htmlFor='sub_series_number'>Series / Number</Label>
        <Input
          id='sub_series_number'
          name='sub_series_number'
          value={form.sub_series_number}
          onChange={handleChange}
        />
      </div>

      {/** Publisher */}
      <div className='grid gap-1.5'>
        <Label htmlFor='publisher'>Publisher</Label>
        <Input
          id='publisher'
          name='publisher'
          value={form.publisher}
          onChange={handleChange}
        />
      </div>

      {/** Data source */}
      <div className='grid gap-1.5'>
        <Label htmlFor='data_source'>Data Source</Label>
        <Input
          id='data_source'
          name='data_source'
          value={form.data_source}
          onChange={handleChange}
        />
      </div>

      {/** CJK + Romanized */}
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

      {/** Counts / Volumes / Chapters */}
      <div className='grid sm:grid-cols-3 gap-5'>
        <div className='grid gap-1.5'>
          <Label htmlFor='counts'># Titles</Label>
          <Input
            id='counts'
            name='counts'
            type='number'
            value={form.counts}
            onChange={handleChange}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='volumes'># Volumes</Label>
          <Input
            id='volumes'
            name='volumes'
            type='number'
            value={form.volumes}
            onChange={handleChange}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='chapters'># Chapters</Label>
          <Input
            id='chapters'
            name='chapters'
            type='number'
            value={form.chapters}
            onChange={handleChange}
          />
        </div>
      </div>

      {/** Languages */}
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

      {/** Global toggle */}
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

      <Button type='submit'>Create E-Book Entry</Button>
      {status && <p className='text-sm text-red-600'>{status}</p>}
    </form>
  );
}
