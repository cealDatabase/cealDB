import { redirect } from 'next/navigation';

/**
 * Survey Dates Management has been consolidated into "Open Forms for New Year"
 * Redirect users to the new page
 */
export default function SurveyDatesPage() {
  redirect('/admin/open-year');
}
