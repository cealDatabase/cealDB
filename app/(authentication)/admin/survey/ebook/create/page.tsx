"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
import CreateEBookForm from "../components/forms/createEBookForm";

function SelectYear(){
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get("year"));

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4 text-sky-700'>
        Create New EBook Entry for {selectedYear}
      </h1>
      <CreateEBookForm selectedYear={selectedYear} />
    </div>
  );
}
export default function CreateEBookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectYear />
    </Suspense>
  );
}
