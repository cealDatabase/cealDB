"use client";

import { useSearchParams } from "next/navigation";
import CreateAVForm from "../components/forms/createAVForm";

export default function CreateAVPage() {
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
