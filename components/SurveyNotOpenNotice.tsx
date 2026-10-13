import { CalendarClock } from "lucide-react";
import db from "@/lib/db";

/**
 * Shown to member institutions in place of a database list whose survey year
 * has been scheduled but not opened yet (see canViewSurveyYearLists).
 */
export async function SurveyNotOpenNotice({ year }: { year: number }) {
  const session = await db.surveySession.findUnique({
    where: { academicYear: year },
    select: { openingDate: true },
  });
  const openingDate = session
    ? new Date(session.openingDate).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-900">
      <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold">The {year} survey has not opened yet</p>
        <p className="text-sm">
          {openingDate
            ? `This list will be available to your institution when the survey opens on ${openingDate} (12:00 AM ET).`
            : "This list will be available to your institution when the survey opens."}
        </p>
      </div>
    </div>
  );
}
