"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
import CreateAVForm from "../components/forms/createAVForm";

function SelectYear(){
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get("year"));

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4 text-sky-700'>
        Create New AV Entry for {selectedYear}
      </h1>
      <CreateAVForm selectedYear={selectedYear} />
    </div>
  );
}
export default function CreateAVPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectYear />
    </Suspense>
  );
}
