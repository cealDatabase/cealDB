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
    description: "",
    notes: "",
    publisher: "",
    data_source: "",
    cjk_title: "",
    romanized_title: "",
    type: "",
    counts: 0,
    language: [] as string[],
    is_global: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      language: prev.language.includes(value)
        ? prev.language.filter((v) => v !== value)
        : [...prev.language, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      libraryyear: selectedYear, // 👈 correct key
      counts: Number(form.counts), // make sure it’s a number
      language: form.language.map(Number), // ["1","2"] → [1,2]
    };

    const res = await fetch("/api/ejournal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json(); // grab the server response

    if (res.ok) {
      router.push(`/admin/survey/ejournal/${selectedYear}`);
    } else {
      alert(`Failed: ${data.error ?? "unknown error"}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='grid gap-4 max-w-2xl'>
      <Input
        name='title'
        value={form.title}
        onChange={handleChange}
        placeholder='Title'
      />
      <Input
        name='subtitle'
        value={form.subtitle}
        onChange={handleChange}
        placeholder='Subtitle'
      />
      <Input
        name='description'
        value={form.description}
        onChange={handleChange}
        placeholder='Description'
      />
      <Input
        name='notes'
        value={form.notes}
        onChange={handleChange}
        placeholder='Notes'
      />
      <Input
        name='publisher'
        value={form.publisher}
        onChange={handleChange}
        placeholder='Publisher'
      />
      <Input
        name='data_source'
        value={form.data_source}
        onChange={handleChange}
        placeholder='Data Source'
      />
      <Input
        name='cjk_title'
        value={form.cjk_title}
        onChange={handleChange}
        placeholder='CJK Title'
      />
      <Input
        name='romanized_title'
        value={form.romanized_title}
        onChange={handleChange}
        placeholder='Romanized Title'
      />
      <Input
        name='type'
        value={form.type}
        onChange={handleChange}
        placeholder='Type'
      />
      <Input
        name='counts'
        type='number'
        value={form.counts}
        onChange={handleChange}
        placeholder='Counts'
      />

      <fieldset className='border p-3 rounded'>
        <legend className='text-sm font-medium text-sky-700 mb-2'>
          Languages
        </legend>
        {languages.map((lang) => (
          <div key={lang.value} className='flex items-center space-x-2'>
            <Checkbox
              checked={form.language.includes(String(lang.value))}
              onCheckedChange={() => handleCheckboxChange(String(lang.value))}
            />
            <Label>{lang.label}</Label>
          </div>
        ))}
      </fieldset>

      <div className='flex items-center space-x-2'>
        <Checkbox
          checked={form.is_global}
          onCheckedChange={() =>
            setForm((prev) => ({ ...prev, is_global: !prev.is_global }))
          }
        />
        <Label>Is Global</Label>
      </div>

      <Button type='submit' className='mt-4'>
        Submit New Entry
      </Button>
    </form>
  );
}