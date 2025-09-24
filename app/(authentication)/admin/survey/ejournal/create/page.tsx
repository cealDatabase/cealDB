"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'
import CreateEJournalForm from "../components/forms/createEJournalForm";
import { Container } from "@/components/Container";
import { useAutoSequenceFix } from "@/hooks/useAutoSequenceFix";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";

function SelectYear(){
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get("year"));
  
  // Auto-fix sequences when page loads
  const { isFixing, hasRun } = useAutoSequenceFix(true);

  return (
    <div className='p-6'>
      <Container>
        <SurveyBreadcrumb surveyType="ejournal" year={selectedYear.toString()} />
        <h1 className='text-2xl font-semibold mb-4 text-sky-700'>
          Create New E-Journal Entry for {selectedYear}
          {isFixing && <span className="text-sm text-blue-600 ml-2">(Preparing database...)</span>}
        </h1>
        <CreateEJournalForm selectedYear={selectedYear} />
      </Container>
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
