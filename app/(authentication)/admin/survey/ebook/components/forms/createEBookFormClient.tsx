"use client";

import { useAutoSequenceFix } from "@/hooks/useAutoSequenceFix";
import CreateEBookForm from "./createEBookForm";

export default function CreateEBookFormClient({
  selectedYear,
  userRoles,
  libraryId,
}: {
  selectedYear: number;
  userRoles: string[];
  libraryId?: number;
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
      />
    </>
  );
}
