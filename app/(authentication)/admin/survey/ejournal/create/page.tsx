"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
import CreateEJournalForm from "../components/forms/createEJournalForm";

function SelectYear(){
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get("year"));

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4 text-sky-700'>
        Create New E-Journal Entry for {selectedYear}
      </h1>
      <CreateEJournalForm selectedYear={selectedYear} />
    </div>
  );
}
export default function CreateEJournalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectYear />
    </Suspense>
  );
}
