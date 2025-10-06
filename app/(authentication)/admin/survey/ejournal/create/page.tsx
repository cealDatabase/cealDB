import { cookies } from "next/headers";
import { Suspense } from 'react'
import CreateEJournalFormClient from "../components/forms/createEJournalFormClient";
import { Container } from "@/components/Container";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";

async function CreateEJournalContent({
  year,
}: {
  year: string;
}) {
  const cookieStore = await cookies();
  const roleId = cookieStore.get("role")?.value;
  const libraryId = cookieStore.get("library")?.value;

  // Parse user roles
  let userRoles: string[] = [];
  if (roleId) {
    try {
      userRoles = roleId.startsWith('[') ? JSON.parse(roleId) : [roleId];
    } catch (error) {
      console.error('Error parsing role cookie:', error);
      userRoles = [roleId];
    }
  }

  const selectedYear = Number(year);

  return (
    <div className='p-6'>
      <Container>
        <SurveyBreadcrumb surveyType="ejournal" year={selectedYear.toString()} />
        <h1 className='text-2xl font-semibold mb-4 text-sky-700'>
          Create New E-Journal Entry for {selectedYear}
        </h1>
        <CreateEJournalFormClient 
          selectedYear={selectedYear}
          userRoles={userRoles}
          libraryId={libraryId ? Number(libraryId) : undefined}
        />
      </Container>
    </div>
  );
}

export default async function CreateEJournalPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const year = searchParams.year || new Date().getFullYear().toString();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEJournalContent year={year} />
    </Suspense>
  );
}
