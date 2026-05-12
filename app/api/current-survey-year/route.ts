import { NextResponse } from 'next/server';
import { getActiveSurveyYear, getReportingDefaultYear } from '@/lib/currentSurveyYear';

/**
 * GET /api/current-survey-year
 * Returns:
 *   - active:    the year currently being collected (matches the most recent
 *                SurveySession, or the calendar year if none exists)
 *   - reporting: the default year for the reports page (active - 1)
 *
 * Used by the reports page to align its default year with the rest of the app.
 */
export async function GET() {
  const [active, reporting] = await Promise.all([
    getActiveSurveyYear(),
    getReportingDefaultYear(),
  ]);
  return NextResponse.json({ active, reporting });
}
