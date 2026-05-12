/**
 * Email template loader & renderer
 *
 * Templates are stored in the EmailTemplate table and edited by Super Admins
 * via /admin/email-templates. They use {{placeholder}} substitution.
 *
 * If a template is missing in the DB (fresh install or after revert), the
 * built-in DEFAULT_TEMPLATES are used as a fallback.
 *
 * Supported placeholders for the open-forms templates:
 *   {{year}}              -> 2026
 *   {{prevYear}}          -> 2025
 *   {{nextYear}}          -> 2027
 *   {{openingDate}}       -> "October 1, 2025"  (Eastern time formatted)
 *   {{closingDate}}       -> "December 1, 2025" (Pacific time formatted)
 *   {{fiscalYearStart}}   -> "July 1, 2025"
 *   {{fiscalYearEnd}}     -> "June 30, 2026"
 *   {{publicationMonth}}  -> "February 2027"
 *   {{siteUrl}}           -> "https://cealstats.org/"
 */

import db from '@/lib/db';
import { getSurveyDates, formatPublicationDate } from '@/lib/surveyDates';

export type TemplateKey =
  | 'broadcast_announcement'   // Manual pre-announcement ("surveys WILL open on X")
  | 'broadcast_open_forms'     // Auto on opening date ("surveys are NOW open")
  | 'broadcast_closing_reminder' // Auto 7 days before closing ("survey closes in 1 week")
  | 'individual_open_forms';   // Manual one-off resend to a single user

export interface TemplateContext {
  year: number;
  prevYear: number;
  nextYear: number;
  openingDate: string;   // formatted (Eastern)
  closingDate: string;   // formatted (Pacific)
  fiscalYearStart: string;
  fiscalYearEnd: string;
  publicationMonth: string;
  siteUrl: string;
}

export interface RenderedTemplate {
  subject: string;
  html: string;
}

// ---------------------------------------------------------------------------
// Defaults — kept identical (in spirit) to the previous hardcoded strings so
// existing emails look the same until the admin edits them.
// ---------------------------------------------------------------------------

const DEFAULT_BROADCAST_HTML = `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinators of the CEAL Statistics Survey,</h3>

  <p style="margin-bottom: 16px;"><strong>Greetings! The annual CEAL Statistics online surveys are now open.</strong></p>

  <p style="margin-bottom: 16px;"><i>You are receiving this message because you are listed in the CEAL Statistics Database as the primary contact or CEAL statistics coordinator for your institution. If you are no longer serving in this role, please reply to this email with updated contact information for your institution. Thank you for your cooperation.</i></p>

  <div style="margin: 24px 0;">
    <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
    <p style="margin: 0;">Please report data for <strong>Fiscal Year (FY) {{prevYear}}–{{year}}</strong>, defined as the most recent 12-month period ending before October 1, {{year}}, corresponding to your institution's fiscal year. For most institutions, this period covers <strong>{{fiscalYearStart}} through {{fiscalYearEnd}}</strong>.</p>
  </div>

  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
    <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Data Collection Period:</h4>
    <p style="margin: 0;">The CEAL Online Survey will be open from <strong>{{openingDate}} through {{closingDate}} (11:59 PM Pacific Time)</strong>.</p>
  </div>

  <div style="margin: 24px 0;">
    <h4 style="color: #374151; margin-top: 0; margin-bottom: 12px;">Accessing the Surveys:</h4>
    <p style="margin-bottom: 16px;">Visit the CEAL Statistics Database at <a href="{{siteUrl}}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{{siteUrl}}</a> to access the online survey forms and instructions.</p>

    <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 12px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px; color: #7f1d1d;"><strong>Please note:</strong> The CEAL Statistics Database has recently been <strong>migrated and rebuilt</strong>. This is our first year using the new platform, which is currently in a "beta" phase. <strong>Some functions from the old site are still under processing (e.g., database search)</strong>. You might experience slower loading times or other minor issues. We sincerely appreciate your patience and understanding as we continue improving the system.</p>
    </div>

    <p style="margin-bottom: 12px;">For a quick guide to using the new survey forms, please refer to:</p>
    <p style="margin-bottom: 16px;">👉 <a href="https://cealstats.org/docs/user-guide.pdf" style="color: #2563eb; text-decoration: none; font-weight: 600;">CEAL Statistics Database User Guide (PDF)</a></p>

    <p style="margin: 0;">If you find it difficult to use the new platform, you are welcome to schedule a one-on-one meeting with Anlin Yang via <a href="https://calendly.com/yanganlin/meeting" style="color: #2563eb; text-decoration: none; font-weight: 600;">https://calendly.com/yanganlin/meeting</a>.</p>
  </div>

  <div style="margin: 24px 0;">
    <h4 style="color: #065f46; margin-top: 0; margin-bottom: 12px; font-size: 18px;">Contact Information:</h4>
    <p style="margin-bottom: 12px;">For questions about specific language resources, please contact:</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;"><strong>Chinese resources:</strong> Jian P. Lee – <a href="mailto:jlee37@uw.edu" style="color: #2563eb; text-decoration: none;">jlee37@uw.edu</a></li>
      <li style="margin-bottom: 8px;"><strong>Japanese resources:</strong> Michiko Ito – <a href="mailto:mito@ku.edu" style="color: #2563eb; text-decoration: none;">mito@ku.edu</a></li>
      <li style="margin-bottom: 8px;"><strong>Korean resources:</strong> Ellie Kim – <a href="mailto:eunahkim@hawaii.edu" style="color: #2563eb; text-decoration: none;">eunahkim@hawaii.edu</a></li>
    </ul>
    <p style="margin-top: 12px; margin-bottom: 0;">For general questions or technical issues, please contact: <strong>Anlin Yang</strong> – <a href="mailto:anlin.yang@wisc.edu" style="color: #2563eb; text-decoration: none;">anlin.yang@wisc.edu</a></p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="{{siteUrl}}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Access Survey Forms</a>
  </div>

  <p style="margin-bottom: 8px;">Thank you for your continued participation and support!</p>

  <p style="margin-bottom: 20px;"><strong>Warm regards,</strong><br/>Anlin Yang<br/><em>(on behalf of the CEAL Statistics Committee)</em></p>

  <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Committee Members:</p>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6b7280;">
      <li>Michiko Ito, Japanese Studies Librarian, University of Kansas</li>
      <li>Ellie Kim, Korean Studies Librarian, University of Hawaiʻi at Mānoa</li>
      <li>Jian P. Lee, Chinese Language Cataloging and Metadata Librarian, University of Washington</li>
      <li>Vickie Fu Doll, Advisor, Librarian Emerita, University of Kansas</li>
    </ul>
  </div>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;"/>
  <p style="font-size: 12px; color: #6b7280; text-align: left;">
    You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
  </p>
</div>
`.trim();

const DEFAULT_ANNOUNCEMENT_HTML = `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinators of the CEAL Statistics Survey,</h3>

  <p style="margin-bottom: 16px;"><strong>This is an advance notice that the annual CEAL Statistics online surveys are scheduled to open soon.</strong></p>

  <p style="margin-bottom: 16px;"><i>You are receiving this message because you are listed in the CEAL Statistics Database as the primary contact or CEAL statistics coordinator for your institution. If you are no longer serving in this role, please reply to this email with updated contact information for your institution.</i></p>

  <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
    <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Scheduled Survey Window:</h4>
    <p style="margin: 0;"><strong>Opens:</strong> {{openingDate}}<br/><strong>Closes:</strong> {{closingDate}} (11:59 PM Pacific Time)</p>
  </div>

  <div style="margin: 24px 0;">
    <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
    <p style="margin: 0;">Please prepare data for <strong>Fiscal Year (FY) {{prevYear}}–{{year}}</strong>, generally <strong>{{fiscalYearStart}} through {{fiscalYearEnd}}</strong>. You will receive a follow-up email when the survey is actually open.</p>
  </div>

  <p style="margin-bottom: 16px;">For preparation, you may wish to review the <a href="https://cealstats.org/docs/user-guide.pdf" style="color: #2563eb; text-decoration: none; font-weight: 600;">CEAL Statistics Database User Guide (PDF)</a> in advance.</p>

  <p style="margin-bottom: 8px;">Thank you for your continued participation and support!</p>

  <p style="margin-bottom: 20px;"><strong>Warm regards,</strong><br/>Anlin Yang<br/><em>(on behalf of the CEAL Statistics Committee)</em></p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;"/>
  <p style="font-size: 12px; color: #6b7280; text-align: left;">
    You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
  </p>
</div>
`.trim();

const DEFAULT_CLOSING_REMINDER_HTML = `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h3 style="color: #b45309; margin-bottom: 20px;">Reminder: One Week Until the CEAL Statistics Survey Closes</h3>

  <p style="margin-bottom: 16px;"><strong>The CEAL Statistics online surveys will close in one week, on {{closingDate}} (11:59 PM Pacific Time).</strong></p>

  <p style="margin-bottom: 16px;">If you have not yet submitted your institution's data for <strong>FY {{prevYear}}–{{year}}</strong>, please do so before the deadline. Late submissions cannot be accepted once the survey is closed.</p>

  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
    <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Closing Date:</h4>
    <p style="margin: 0;"><strong>{{closingDate}}</strong> at 11:59 PM Pacific Time</p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="{{siteUrl}}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Complete Your Submission</a>
  </div>

  <p style="margin-bottom: 16px;">If you have already completed your submission, thank you — no further action is required.</p>

  <p style="margin-bottom: 16px;">For technical issues or questions, please contact <strong>Anlin Yang</strong> at <a href="mailto:anlin.yang@wisc.edu" style="color: #2563eb; text-decoration: none;">anlin.yang@wisc.edu</a>.</p>

  <p style="margin-bottom: 20px;"><strong>Warm regards,</strong><br/>CEAL Statistics Committee</p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;"/>
  <p style="font-size: 12px; color: #6b7280; text-align: left;">
    You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
  </p>
</div>
`.trim();

const DEFAULT_INDIVIDUAL_HTML = `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinator of the CEAL Statistics Survey,</h3>
  <p style="margin-bottom: 16px;"><strong>Greetings! The annual CEAL Statistics online surveys are now open.</strong></p>
  <div style="margin: 24px 0;">
    <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
    <p style="margin: 0;">Please report data for <strong>Fiscal Year (FY) {{prevYear}}–{{year}}</strong>, generally <strong>{{fiscalYearStart}} through {{fiscalYearEnd}}</strong>.</p>
  </div>
  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
    <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Data Collection Period:</h4>
    <p style="margin: 0;">The CEAL Online Survey will be open from <strong>{{openingDate}} through {{closingDate}} (11:59 PM Pacific Time)</strong>.</p>
  </div>
  <div style="margin: 24px 0;">
    <h4 style="color: #374151; margin-top: 0; margin-bottom: 12px;">Accessing the Surveys:</h4>
    <p style="margin-bottom: 16px;">Visit the CEAL Statistics Database at <a href="{{siteUrl}}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{{siteUrl}}</a> to access the online survey forms and instructions.</p>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{siteUrl}}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Access Survey Forms</a>
  </div>
  <p style="margin-bottom: 8px;">Thank you for your continued participation and support!</p>
  <p style="margin-bottom: 20px;"><strong>Warm regards,</strong><br/>CEAL Statistics Committee</p>
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;"/>
  <p style="font-size: 12px; color: #6b7280; text-align: left;">This message was sent to you individually by a super admin upon request.</p>
</div>
`.trim();

export const DEFAULT_TEMPLATES: Record<TemplateKey, {
  name: string;
  description: string;
  subject: string;
  html: string;
  /** How this template is actually sent — drives UI affordances. */
  delivery: 'manual_broadcast' | 'auto_on_open' | 'auto_one_week_before_close' | 'manual_individual';
}> = {
  // 1) Pre-announcement — manual click by super admin
  broadcast_announcement: {
    name: 'Broadcast 1 — Survey Scheduled Announcement',
    description: 'Pre-announcement that the surveys are scheduled to open. Super Admin clicks "Send broadcast now" on this page to deliver it. Not sent automatically.',
    subject: 'CEAL Statistics Survey — Scheduled to Open {{openingDate}}',
    html: DEFAULT_ANNOUNCEMENT_HTML,
    delivery: 'manual_broadcast',
  },

  // 2) Forms open — automatic on opening date (via cron / Resend scheduled)
  broadcast_open_forms: {
    name: 'Broadcast 2 — Forms Now Open (auto)',
    description: 'Automatically sent to the entire CEAL audience on the scheduled opening date. You can edit the content here, but the send timing is governed by the SurveySession opening date and the daily cron.',
    subject: 'CEAL Statistics Online Surveys Are Now Open',
    html: DEFAULT_BROADCAST_HTML,
    delivery: 'auto_on_open',
  },

  // 3) 1-week-before-close reminder — automatic via cron
  broadcast_closing_reminder: {
    name: 'Broadcast 3 — Closing in One Week (auto)',
    description: 'Automatically sent to the entire CEAL audience one week before the scheduled closing date. The daily cron checks the SurveySession and sends this once per session.',
    subject: 'Reminder: CEAL Statistics Survey Closes in One Week ({{closingDate}})',
    html: DEFAULT_CLOSING_REMINDER_HTML,
    delivery: 'auto_one_week_before_close',
  },

  // 4) Per-user resend (existing) — manual, to a single user only
  individual_open_forms: {
    name: 'Individual Resend — Forms Open',
    description: 'Sent to a single user from the admin tools when a coordinator requests a personal copy of the open-forms email.',
    subject: 'CEAL Statistics Online Surveys Are Now Open',
    html: DEFAULT_INDIVIDUAL_HTML,
    delivery: 'manual_individual',
  },
};

// ---------------------------------------------------------------------------
// Context builder
// ---------------------------------------------------------------------------

/**
 * Build a TemplateContext from a year and the survey opening/closing dates.
 * Dates are formatted following the existing convention:
 *   - openingDate: Eastern Time (when the survey starts)
 *   - closingDate: Pacific Time (when the survey ends, intentional)
 */
export function buildTemplateContext(
  year: number,
  openingDate: Date,
  closingDate: Date,
): TemplateContext {
  const surveyDates = getSurveyDates(year, openingDate, closingDate);

  const formatLong = (d: Date, tz: string) =>
    new Date(d).toLocaleDateString('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return {
    year,
    prevYear: year - 1,
    nextYear: year + 1,
    openingDate: formatLong(openingDate, 'America/New_York'),
    closingDate: formatLong(closingDate, 'America/Los_Angeles'),
    fiscalYearStart: formatLong(surveyDates.fiscalYearStart, 'UTC'),
    fiscalYearEnd: formatLong(surveyDates.fiscalYearEnd, 'UTC'),
    publicationMonth: formatPublicationDate(year),
    siteUrl: 'https://cealstats.org/',
  };
}

// ---------------------------------------------------------------------------
// Substitution
// ---------------------------------------------------------------------------

/**
 * Replace {{key}} placeholders with values from `ctx`. Unknown placeholders
 * are left untouched (so things like {{{RESEND_UNSUBSCRIBE_URL}}} pass
 * through to Resend unmodified).
 */
export function renderTemplateString(template: string, ctx: TemplateContext): string {
  return template.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(ctx, key)) {
      const v = (ctx as any)[key];
      return v === null || v === undefined ? '' : String(v);
    }
    return match;
  });
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/**
 * Load the raw template (subject + html) for a given key. Falls back to the
 * built-in DEFAULT_TEMPLATES if the DB row is missing.
 */
export async function loadRawTemplate(key: TemplateKey): Promise<{ subject: string; html: string }> {
  try {
    const row = await (db as any).emailTemplate?.findUnique?.({ where: { key } });
    if (row && row.subject && row.html) {
      return { subject: row.subject, html: row.html };
    }
  } catch (err) {
    // Table may not exist yet (migration not run). Fall back silently.
    console.warn(`[emailTemplate] Falling back to default for "${key}":`, err instanceof Error ? err.message : err);
  }
  const def = DEFAULT_TEMPLATES[key];
  return { subject: def.subject, html: def.html };
}

/**
 * Load the template, render it with the given context, and return both the
 * rendered subject and html.
 */
export async function renderTemplate(
  key: TemplateKey,
  ctx: TemplateContext,
): Promise<RenderedTemplate> {
  const raw = await loadRawTemplate(key);
  return {
    subject: renderTemplateString(raw.subject, ctx),
    html: renderTemplateString(raw.html, ctx),
  };
}
