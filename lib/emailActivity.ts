// lib/emailActivity.ts (server-only)
//
// What the Email Send Status page (/admin/email-status) shows: every email
// the system sent, from the audit log, and what Resend says happened to it.
// Nothing new is stored. Each send already writes an audit log entry, so this
// reads those entries and, on request, asks Resend for the delivery status.

import { Resend } from 'resend';
import db from '@/lib/db';
import { DEFAULT_TEMPLATES, type TemplateKey } from '@/lib/emailTemplate';
import { type EmailError, emailErrorFromLog } from '@/lib/emailError';

export type SendKind =
  | 'opening_broadcast'
  | 'opening_broadcast_scheduled'
  | 'closing_reminder'
  | 'announcement'
  | 'admin_close_notice'
  | 'individual'
  | 'account_email'
  | 'broadcast_list'
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
  /**
   * For a failure: the error code to copy (lib/emailError.ts). Entries from
   * before error codes get LOG-<audit log id> as their reference.
   */
  errorCode: EmailError | null;
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

/**
 * The entry an error code points to: EM-… as copied from an error message,
 * or LOG-<id> for an entry from before error codes. Older than the history
 * list reaches, too.
 */
export async function findSendRecordByRef(ref: string): Promise<SendRecord[]> {
  const code = ref.trim().toUpperCase();
  const logId = /^LOG-(\d{1,9})$/.exec(code)?.[1];
  if (!logId && !/^EM-[A-Z0-9]{8}$/.test(code)) return [];
  const rows = logId
    ? await db.$queryRaw<LogRow[]>`
        SELECT id, username, action, table_name, record_id, new_values, success, error_message, timestamp
        FROM "AuditLog" WHERE id = ${Number(logId)}`
    : await db.$queryRaw<LogRow[]>`
        SELECT id, username, action, table_name, record_id, new_values, success, error_message, timestamp
        FROM "AuditLog" WHERE new_values->>'ref' = ${code}`;
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
  const record = classifyRow(row);
  if (!record || (record.ok && record.failed.length === 0)) return record;
  const v = obj(row.new_values);
  return {
    ...record,
    errorCode: emailErrorFromLog(v, record.at, row.error_message) ?? {
      code: 'unknown',
      status: null,
      where: record.kind,
      ref: `LOG-${row.id}`,
      at: record.at,
      message: row.error_message ?? record.failed[0]?.reason,
    },
  };
}

/** What an email "mode" in an Email entry was, for the ones sent to one person. */
const ONE_PERSON_EMAILS: Record<string, { kind: SendKind; label: string }> = {
  individual: { kind: 'individual', label: 'Individual forms open email' },
  password_reset: { kind: 'account_email', label: 'Password reset email' },
  password_setup: { kind: 'account_email', label: 'Password setup email' },
  welcome: { kind: 'account_email', label: 'New account: password setup email' },
};

function classifyRow(row: LogRow): SendRecord | null {
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
    errorCode: null as EmailError | null,
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

  // A new account that could not be added to the broadcast list.
  if (row.table_name === 'Email' && v.mode === 'contact') {
    return {
      ...base,
      kind: 'broadcast_list',
      label: 'New account: add to the broadcast list',
      channel: 'broadcast',
      year,
      by: row.username ?? 'Unknown',
      recipients: str(v.to) ?? 'Unknown',
      attempted: 1,
      accepted: row.success ? 1 : 0,
      failed: row.success ? [] : [{ email: str(v.to) ?? 'Unknown', reason: row.error_message ?? 'Unknown error' }],
    };
  }

  // An email to one person: the "forms are open" email from Manage Users,
  // or a password setup or reset email that Resend did not take.
  if (row.table_name === 'Email') {
    const emailId = row.success ? str(row.record_id) : null;
    const which = ONE_PERSON_EMAILS[typeof v.mode === 'string' ? v.mode : 'individual'] ?? ONE_PERSON_EMAILS.individual;
    return {
      ...base,
      kind: which.kind,
      label: which.label,
      channel: 'transactional',
      year,
      // Password emails are asked for on public pages: nobody signed in.
      by: row.username ?? (which.kind === 'account_email' ? 'Sign-in / forgot password page' : 'Unknown'),
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

// Resend's default limit is 10 requests per second, shared by every key on
// the team, so the sends and the daily job use it too. Lookups stay well
// under it.
const REQUEST_GAP_MS = 250;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

type ResendError = { message?: string; name?: string; statusCode?: number | null } | null | undefined;

function describe(error: ResendError): string {
  // Reading anything from Resend needs a key with Full access; a key with
  // Sending access can only send.
  if (error?.name === 'restricted_api_key') {
    return 'RESEND_API_KEY can only send emails. Reading the status needs a key with Full access (Resend → API Keys).';
  }
  return error?.message || error?.name || 'Resend did not answer';
}

export interface BroadcastStatus {
  status: string | null;
  sentAt: string | null;
  /** Delivery totals from Resend's email metrics, when it has them. */
  counts: Record<string, number> | null;
  countsError: string | null;
  error: string | null;
}

const BROADCAST_METRICS = ['sent', 'delivered', 'bounced', 'complained', 'suppressed', 'failed', 'delivery_delayed'] as const;

/**
 * What Resend says about one broadcast: its status and delivery totals.
 *
 * The totals come from the email metrics endpoint (GET /emails/metrics),
 * which takes a broadcast id. Resend's per-broadcast metrics and recipient
 * endpoints would also list the addresses, but they are a private beta and
 * answer 404 on most accounts, so they are not used; who bounced is in the
 * Resend dashboard.
 */
export async function getBroadcastStatus(id: string): Promise<BroadcastStatus> {
  const empty: BroadcastStatus = { status: null, sentAt: null, counts: null, countsError: null, error: null };
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
      // All zero means Resend has nothing for it: it went out minutes ago,
      // or it is older than the plan keeps data.
      if (Object.values(counts).some((n) => n > 0)) {
        result.counts = counts;
      } else {
        result.countsError =
          'Resend has no delivery totals for it yet. It may have gone out in the last few minutes, or be older than your plan keeps data.';
      }
    }
  } catch (err) {
    result.countsError = err instanceof Error ? err.message : String(err);
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

/**
 * How much of the free plan's email quota is used.
 *
 * The free plan allows 100 emails a day and 3,000 a month. The day is the
 * UTC calendar day: it resets at 00:00 UTC, not 24 hours after a send. Sent
 * and received emails count, each To, CC and BCC address separately;
 * broadcasts do not count.
 */
export interface QuotaStatus {
  /**
   * usage_api: Resend's usage endpoint (GET /usage);
   * headers:   the x-resend-daily-quota / x-resend-monthly-quota headers;
   * count:     counted here from the email list, received emails missing.
   */
  source: 'usage_api' | 'headers' | 'count';
  dailyUsed: number;
  /** Null on a paid plan, which has no daily limit. */
  dailyLimit: number | null;
  dailyResetsAt: string;
  monthlyUsed: number | null;
  monthlyLimit: number | null;
  monthlyResetsAt: string | null;
}

export interface RecentEmails {
  emails: { id: string; to: string[]; subject: string; createdAt: string; lastEvent: string }[];
  /** True when there were more emails than were read. */
  incomplete: boolean;
  quota: QuotaStatus | null;
  error: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PAGES = 3;
const FREE_DAILY_LIMIT = 100;
const FREE_MONTHLY_LIMIT = 3000;

function nextUtcMidnight(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function headerCount(headers: Record<string, string> | null | undefined, name: string): number | null {
  const value = headers?.[name];
  if (value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Transactional emails from the last 24 hours, newest first, and the quota
 * used. Broadcasts are not in Resend's email list or in the quota.
 *
 * The usage figures come from Resend's usage endpoint when the account has
 * it (it is a private beta), then from the quota headers on Resend's
 * replies, and otherwise from counting the list since 00:00 UTC.
 */
export async function getRecentEmails(): Promise<RecentEmails> {
  const result: RecentEmails = { emails: [], incomplete: false, quota: null, error: null };
  const resend = getResend();
  if (!resend) return { ...result, error: 'RESEND_API_KEY is not configured' };

  let headers: Record<string, string> = {};
  try {
    const usage = await resend.usage.get();
    headers = { ...(usage.headers ?? {}) };
    const e = usage.data?.emails;
    if (!usage.error && e?.daily && e.monthly) {
      result.quota = {
        source: 'usage_api',
        dailyUsed: e.daily.used,
        dailyLimit: e.daily.limit,
        dailyResetsAt: e.daily.resets_at,
        monthlyUsed: e.monthly.used,
        monthlyLimit: e.monthly.limit,
        monthlyResetsAt: e.monthly.resets_at,
      };
    }
  } catch {
    // Not available on this account; the list and its headers are used.
  }

  const dayStart = nextUtcMidnight().getTime() - DAY_MS;
  const since = Date.now() - DAY_MS;
  let todayCount = 0;
  let after: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    await sleep(REQUEST_GAP_MS);
    const listed = await resend.emails.list(after ? { limit: 100, after } : { limit: 100 });
    headers = { ...headers, ...(listed.headers ?? {}) };
    if (listed.error || !listed.data) {
      result.error = describe(listed.error);
      break;
    }
    let reachedOlder = false;
    for (const e of listed.data.data) {
      const at = new Date(e.created_at).getTime();
      if (at < since) {
        reachedOlder = true;
        break;
      }
      if (at >= dayStart) todayCount += e.to.length + (e.cc?.length ?? 0) + (e.bcc?.length ?? 0);
      result.emails.push({ id: e.id, to: e.to, subject: e.subject, createdAt: e.created_at, lastEvent: e.last_event });
    }
    const last = listed.data.data[listed.data.data.length - 1];
    if (reachedOlder || !listed.data.has_more || !last) break;
    if (page === MAX_PAGES - 1) result.incomplete = true;
    after = last.id;
  }

  if (!result.quota) {
    // Resend reports the quota used so far on its replies; the daily header
    // is sent only on the free plan.
    const daily = headerCount(headers, 'x-resend-daily-quota');
    const monthly = headerCount(headers, 'x-resend-monthly-quota');
    const resetsAt = nextUtcMidnight().toISOString();
    if (daily !== null) {
      result.quota = {
        source: 'headers',
        dailyUsed: daily,
        dailyLimit: FREE_DAILY_LIMIT,
        dailyResetsAt: resetsAt,
        monthlyUsed: monthly,
        monthlyLimit: monthly !== null ? FREE_MONTHLY_LIMIT : null,
        monthlyResetsAt: null,
      };
    } else if (!result.error) {
      result.quota = {
        source: 'count',
        dailyUsed: todayCount,
        dailyLimit: FREE_DAILY_LIMIT,
        dailyResetsAt: resetsAt,
        monthlyUsed: monthly,
        monthlyLimit: monthly !== null ? FREE_MONTHLY_LIMIT : null,
        monthlyResetsAt: null,
      };
    }
  }
  return result;
}
