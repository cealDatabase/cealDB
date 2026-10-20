"use client";

import type { EntryInstitution } from "@/lib/myAccessInstitution";
import { useAutoSequenceFix } from "@/hooks/useAutoSequenceFix";
import CreateEBookForm from "./createEBookForm";

export default function CreateEBookFormClient({
  selectedYear,
  userRoles,
  libraryId,
  institutions,
  viewedInstitutionId,
}: {
  selectedYear: number;
  userRoles: string[];
  libraryId?: number;
  institutions?: EntryInstitution[];
  viewedInstitutionId?: number;
}) {
  // Auto-fix sequences when page loads
  const { isFixing, hasRun } = useAutoSequenceFix(true);

  return (
    <>
      {isFixing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          Preparing database...
        </div>
      )}
      <CreateEBookForm 
        selectedYear={selectedYear}
        userRoles={userRoles}
        libraryId={libraryId}
        institutions={institutions}
        viewedInstitutionId={viewedInstitutionId}
      />
    </>
  );
}
