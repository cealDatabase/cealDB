// lib/emailActivity.ts (server-only)
//
// What the Email Send Status page (/admin/email-status) shows: every email
// the system sent, from the audit log, and what Resend says happened to it.
// Nothing new is stored. Each send already writes an audit log entry, so this
// reads those entries and, on request, asks Resend for the delivery status.

import { Resend } from 'resend';
import db from '@/lib/db';
import { DEFAULT_TEMPLATES, type TemplateKey } from '@/lib/emailTemplate';

export type SendKind =
  | 'opening_broadcast'
  | 'opening_broadcast_scheduled'
  | 'closing_reminder'
  | 'announcement'
  | 'admin_close_notice'
  | 'individual'
  | 'testing_tool';

export interface SendRecord {
  /** Audit log entry id. */
  id: number;
  at: string;
  kind: SendKind;
  label: string;
  /** Broadcasts go to the Resend audience; transactional emails count against the daily quota. */
  channel: 'broadcast' | 'transactional';
  year: number | null;
  /** Who started it: a username, or "Scheduled job". */
  by: string;
  ok: boolean;
  error: string | null;
  recipients: string;
  /** Emails the system tried to send, when it is known. */
  attempted: number | null;
  /** Emails Resend accepted, when it is known. */
  accepted: number | null;
  failed: { email: string; reason: string }[];
  broadcastId: string | null;
  emailId: string | null;
}

type LogRow = {
  id: number;
  username: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  new_values: unknown;
  success: boolean;
  error_message: string | null;
  timestamp: Date;
};

const SCHEDULED_JOB = 'Scheduled job';

/**
 * The audit log entries written when an email is sent, newest first.
 * See classify() for which entry is which.
 */
export async function getSendRecords(limit = 200): Promise<SendRecord[]> {
  const rows = await db.$queryRaw<LogRow[]>`
    SELECT id, username, action, table_name, record_id, new_values, success, error_message, timestamp
    FROM "AuditLog"
    WHERE table_name IN ('EmailBroadcast', 'Email')
       OR action IN ('SYSTEM_CLOSE_FORMS', 'TEST_OPEN_FORMS', 'TEST_CLOSE_FORMS')
       OR (table_name = 'ScheduledEvent' AND new_values->>'action' IN ('BROADCAST_SENT', 'BROADCAST_FAILED'))
       OR (table_name = 'Library_Year' AND action = 'UPDATE' AND new_values->>'broadcast_id' IS NOT NULL)
       OR (table_name = 'Library_Year' AND action = 'CREATE' AND record_id = 'failed')
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;
  return rows.map(classify).filter((r): r is SendRecord => r !== null);
}

function obj(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

function num(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value && value !== 'unknown' ? value : null;
}

function failedList(value: unknown): { email: string; reason: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((f) => obj(f))
    .filter((f) => typeof f.email === 'string')
    .map((f) => ({ email: f.email, reason: typeof f.reason === 'string' ? f.reason : 'Unknown error' }));
}

function templateName(key: string | null): string {
  if (key && Object.prototype.hasOwnProperty.call(DEFAULT_TEMPLATES, key)) {
    return DEFAULT_TEMPLATES[key as TemplateKey].name;
  }
  return key ?? 'Broadcast';
}

function classify(row: LogRow): SendRecord | null {
  const v = obj(row.new_values);
  const base = {
    id: row.id,
    at: row.timestamp.toISOString(),
    ok: row.success,
    error: row.error_message,
    failed: [] as { email: string; reason: string }[],
    attempted: null as number | null,
    accepted: null as number | null,
    broadcastId: null as string | null,
    emailId: null as string | null,
  };
  const year = num(v.academicYear) ?? num(v.year);

  // Opening broadcast sent by the daily job (cron STEP 1).
  if (row.table_name === 'ScheduledEvent') {
    return {
      ...base,
      kind: 'opening_broadcast',
      label: 'Forms open broadcast',
      channel: 'broadcast',
      year,
      by: SCHEDULED_JOB,
      recipients: 'CEAL audience',
      broadcastId: str(v.broadcast_id),
    };
  }

  // One-week reminder (cron STEP 2.5), or a broadcast sent from Email Templates.
  if (row.table_name === 'EmailBroadcast') {
    const reminder = (row.record_id ?? '').startsWith('auto:');
    return {
      ...base,
      kind: reminder ? 'closing_reminder' : 'announcement',
      label: reminder ? 'One-week closing reminder' : templateName(str(v.templateKey)),
      channel: 'broadcast',
      year,
      by: reminder ? SCHEDULED_JOB : row.username ?? 'Unknown',
      recipients: 'CEAL audience',
      broadcastId: str(v.broadcastId),
    };
  }

  // Individual "forms are open" email from Manage Users.
  if (row.table_name === 'Email') {
    const emailId = row.success ? str(row.record_id) : null;
    return {
      ...base,
      kind: 'individual',
      label: 'Individual forms open email',
      channel: 'transactional',
      year,
      by: row.username ?? 'Unknown',
      recipients: str(v.to) ?? 'Unknown',
      attempted: 1,
      accepted: row.success ? 1 : 0,
      failed: row.success ? [] : [{ email: str(v.to) ?? 'Unknown', reason: row.error_message ?? 'Unknown error' }],
      emailId: emailId === 'resend' ? null : emailId,
    };
  }

  // "Forms closed" notice to super admins (cron STEP 3).
  if (row.action === 'SYSTEM_CLOSE_FORMS') {
    const failed = failedList(v.emailsFailed);
    const accepted = num(v.emailsSent);
    return {
      ...base,
      kind: 'admin_close_notice',
      label: '"Forms closed" notice',
      channel: 'transactional',
      year,
      by: SCHEDULED_JOB,
      recipients: 'Super admins',
      accepted,
      attempted: num(v.emailsAttempted) ?? (accepted === null ? null : accepted + failed.length),
      failed,
    };
  }

  // Emails sent from the Testing page. Only entries that sent something.
  if (row.action === 'TEST_OPEN_FORMS' || row.action === 'TEST_CLOSE_FORMS') {
    const accepted = num(v.emailsSent);
    if (!accepted) return null;
    return {
      ...base,
      kind: 'testing_tool',
      label: row.action === 'TEST_OPEN_FORMS' ? 'Testing page: open forms emails' : 'Testing page: close forms emails',
      channel: 'transactional',
      year,
      by: row.username ?? 'Unknown',
      recipients: row.action === 'TEST_OPEN_FORMS' ? 'Members and super admins' : 'Super admins',
      accepted,
    };
  }

  // Open/Close Annual Surveys page: "Send now" sends the opening broadcast;
  // "Schedule" only checks it with Resend and the daily job sends it later.
  if (row.table_name === 'Library_Year') {
    const scheduled = v.send_mode === 'scheduled';
    if (row.record_id === 'failed') {
      return {
        ...base,
        ok: false,
        kind: scheduled ? 'opening_broadcast_scheduled' : 'opening_broadcast',
        label: scheduled ? 'Forms open broadcast scheduled' : 'Forms open broadcast',
        channel: 'broadcast',
        year,
        by: row.username ?? 'Unknown',
        recipients: 'CEAL audience',
      };
    }
    return {
      ...base,
      kind: scheduled ? 'opening_broadcast_scheduled' : 'opening_broadcast',
      label: scheduled
        ? 'Forms open broadcast scheduled'
        : v.send_mode === 'immediate'
          ? 'Forms open broadcast'
          : 'Forms open broadcast (sent now or scheduled)',
      channel: 'broadcast',
      year,
      by: row.username ?? 'Unknown',
      recipients: 'CEAL audience',
      broadcastId: str(v.broadcast_id),
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Resend
// ---------------------------------------------------------------------------

// Resend ids are UUIDs. Checked so a request cannot reach other API paths.
const RESEND_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isResendId(id: string | null): id is string {
  return !!id && RESEND_ID.test(id);
}

// Resend allows 2 requests per second per team by default.
const REQUEST_GAP_MS = 550;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

type ResendError = { message?: string; name?: string } | null | undefined;

function describe(error: ResendError): string {
  return error?.message || error?.name || 'Resend did not answer';
}

export interface BroadcastStatus {
  status: string | null;
  sentAt: string | null;
  /** Totals from Resend's metrics, for the counts Resend returned. */
  counts: Record<string, number> | null;
  countsError: string | null;
  /** Addresses that bounced or were suppressed, when Resend lists them. */
  problems: { email: string; type: string }[];
  problemsError: string | null;
  error: string | null;
}

const BROADCAST_METRICS = ['sent', 'delivered', 'bounced', 'complained', 'suppressed', 'failed', 'delivery_delayed'] as const;

/** What Resend says about one broadcast: its status, delivery totals, and who it did not reach. */
export async function getBroadcastStatus(id: string): Promise<BroadcastStatus> {
  const empty: BroadcastStatus = {
    status: null, sentAt: null, counts: null, countsError: null, problems: [], problemsError: null, error: null,
  };
  const resend = getResend();
  if (!resend) return { ...empty, error: 'RESEND_API_KEY is not configured' };

  const got = await resend.broadcasts.get(id);
  if (got.error || !got.data) return { ...empty, error: describe(got.error) };
  const result: BroadcastStatus = { ...empty, status: got.data.status, sentAt: got.data.sent_at };
  // A draft or queued broadcast has no deliveries to report yet.
  if (got.data.status !== 'sent') return result;

  try {
    await sleep(REQUEST_GAP_MS);
    const sentAt = new Date(got.data.sent_at ?? got.data.created_at);
    const metrics = await resend.emails.metrics({
      broadcastId: [id],
      metrics: [...BROADCAST_METRICS],
      startDate: new Date(sentAt.getTime() - 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    });
    if (metrics.error || !metrics.data) {
      result.countsError = describe(metrics.error);
    } else {
      const counts: Record<string, number> = {};
      for (const [key, value] of Object.entries(metrics.data.totals ?? {})) {
        if (typeof value === 'number') counts[key] = value;
      }
      result.counts = counts;
    }
  } catch (err) {
    result.countsError = err instanceof Error ? err.message : String(err);
  }

  for (const type of ['bounced', 'suppressed'] as const) {
    try {
      await sleep(REQUEST_GAP_MS);
      const listed = await resend.broadcasts.recipients(id, { type, limit: 100 });
      if (listed.error || !listed.data) {
        result.problemsError = describe(listed.error);
        break;
      }
      for (const r of listed.data.data) {
        const bounce = (r as { bounce_type?: string }).bounce_type;
        result.problems.push({ email: r.email, type: bounce ? `${type} (${bounce})` : type });
      }
    } catch (err) {
      result.problemsError = err instanceof Error ? err.message : String(err);
      break;
    }
  }

  return result;
}

export interface EmailStatus {
  lastEvent: string | null;
  to: string[];
  subject: string | null;
  createdAt: string | null;
  error: string | null;
}

/** What Resend says happened to one transactional email. */
export async function getEmailStatus(id: string): Promise<EmailStatus> {
  const resend = getResend();
  if (!resend) return { lastEvent: null, to: [], subject: null, createdAt: null, error: 'RESEND_API_KEY is not configured' };
  const got = await resend.emails.get(id);
  if (got.error || !got.data) {
    return { lastEvent: null, to: [], subject: null, createdAt: null, error: describe(got.error) };
  }
  return { lastEvent: got.data.last_event, to: got.data.to, subject: got.data.subject, createdAt: got.data.created_at, error: null };
}

export interface RecentEmails {
  emails: { id: string; to: string[]; subject: string; createdAt: string; lastEvent: string }[];
  /** Transactional emails Resend created in the last 24 hours. */
  last24h: number;
  /** True when there were more emails than were read, so last24h is a lower bound. */
  incomplete: boolean;
  /** Quota headers on Resend's reply, if it sends any. */
  quotaHeaders: Record<string, string>;
  error: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PAGES = 3;

/**
 * Transactional emails from the last 24 hours, newest first, read from
 * Resend's email list. The free plan allows 100 a day; broadcasts are not
 * part of this list or of that quota.
 */
export async function getRecentEmails(): Promise<RecentEmails> {
  const result: RecentEmails = { emails: [], last24h: 0, incomplete: false, quotaHeaders: {}, error: null };
  const resend = getResend();
  if (!resend) return { ...result, error: 'RESEND_API_KEY is not configured' };

  const since = Date.now() - DAY_MS;
  let after: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0) await sleep(REQUEST_GAP_MS);
    const listed = await resend.emails.list(after ? { limit: 100, after } : { limit: 100 });
    for (const [name, value] of Object.entries(listed.headers ?? {})) {
      if (/quota/i.test(name)) result.quotaHeaders[name] = value;
    }
    if (listed.error || !listed.data) {
      result.error = describe(listed.error);
      break;
    }
    let reachedOlder = false;
    for (const e of listed.data.data) {
      if (new Date(e.created_at).getTime() < since) {
        reachedOlder = true;
        break;
      }
      result.emails.push({ id: e.id, to: e.to, subject: e.subject, createdAt: e.created_at, lastEvent: e.last_event });
    }
    const last = listed.data.data[listed.data.data.length - 1];
    if (reachedOlder || !listed.data.has_more || !last) break;
    if (page === MAX_PAGES - 1) result.incomplete = true;
    after = last.id;
  }
  result.last24h = result.emails.length;
  return result;
}
