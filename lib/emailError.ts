// lib/emailError.ts
//
// One error code for every email the system could not hand to Resend.
// Whoever sees the failure (a super admin, or a member on the sign-in and
// forgot-password pages) can copy it in one click and send it on; whoever
// reads it knows where to start: what Resend said (its own error name, such
// as daily_quota_exceeded), which page or job it happened on, and when. The
// reference is also written to the audit log, so the full record can be
// found on the Email Send Status page.
//
// Used by both the server and the browser, so nothing server-only here.

/** Where an email failed. The key goes in the error code; the text says it in words. */
export const EMAIL_PLACES = {
  'open-close-schedule': 'Open/Close Annual Surveys: schedule the opening broadcast',
  'open-close-send-now': 'Open/Close Annual Surveys: send the opening broadcast now',
  'open-close': 'Open/Close Annual Surveys',
  'template-broadcast': 'Email Templates: send a broadcast',
  'individual-email': 'Manage Users: forms open email to one person',
  'new-account-email': 'New account: password setup email',
  'new-account-contact': 'New account: add to the broadcast list',
  'forgot-password': 'Forgot password page: reset email',
  'signin-password-email': 'Sign-in page: password setup or reset email',
  'password-reset-request': 'Password reset request: reset email',
  'cron-opening-broadcast': 'Scheduled job: forms open broadcast',
  'cron-closing-reminder': 'Scheduled job: one-week closing reminder',
} as const;

export type EmailPlace = keyof typeof EMAIL_PLACES;

export interface EmailError {
  /**
   * Resend's error name (for example daily_quota_exceeded or
   * invalid_api_key), or one of ours: config_missing, server_error.
   */
  code: string;
  /** Resend's HTTP status, when Resend answered. */
  status: number | null;
  /** An EMAIL_PLACES key. */
  where: string;
  /** Short reference, also in the audit log entry (new_values.ref). */
  ref: string;
  /** When it happened, ISO 8601. */
  at: string;
  /** Resend's own words. Not sent to the public pages. */
  message?: string;
}

/**
 * What a code usually means and where to look. For the people who fix it,
 * so these are shown to super admins only.
 */
const HINTS: Record<string, string> = {
  missing_api_key: 'RESEND_API_KEY is not set for this deployment (Vercel → Settings → Environment Variables); redeploy after setting it.',
  invalid_api_key: 'RESEND_API_KEY is wrong or was revoked. Create a key in Resend, put it in Vercel, and redeploy.',
  restricted_api_key: 'The Resend key can only send emails. Broadcasts, contacts and status lookups need a Full access key.',
  validation_error: 'Resend refused what was sent. Most often the sending domain (cealstats.org) is not verified in Resend, or an address is not valid; Resend\'s message says which.',
  invalid_from_address: 'The From address is not on a domain verified in Resend (Resend → Domains).',
  not_found: 'Resend has no such audience or broadcast. Check RESEND_BROADCAST_LIST_ID in Vercel against Resend → Audience.',
  rate_limit_exceeded: 'Too many requests to Resend at once. Trying again a minute later normally works.',
  daily_quota_exceeded: 'Today\'s 100 transactional emails (free plan) are used up. The count resets at 00:00 UTC (8 pm Eastern in summer, 7 pm in winter). Broadcasts are not affected.',
  monthly_quota_exceeded: 'This month\'s 3,000 transactional emails (free plan) are used up. Wait for the new month or upgrade the Resend plan.',
  security_error: 'Resend blocked the request for security reasons. Contact Resend support with the time shown here.',
  invalid_access: 'The Resend key has no access to what was asked for. Check the key\'s permission and domain in Resend → API Keys.',
  application_error: 'Resend had a problem or could not be reached. Trying again later normally works; see status.resend.com.',
  internal_server_error: 'Resend had a problem. Trying again later normally works; see status.resend.com.',
  config_missing: 'A Resend setting is missing for this deployment (Vercel → Settings → Environment Variables); the message says which. Redeploy after setting it.',
  server_error: 'Something on our side failed, not Resend. The message says what; the server log for this time has the details.',
};

const CODE_PROBLEM =
  'The request the system sent was not valid. This is a problem in the code: send these details to the developer.';

export function emailErrorHint(code: string): string {
  return HINTS[code] ?? CODE_PROBLEM;
}

/** A Resend failure that keeps Resend's error name and status. */
export class EmailFailure extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = 'EmailFailure';
  }
}

type ResendErrorLike = { name?: string; message?: string; statusCode?: number | null };

/** Resend's reason in words, falling back to its error name. */
export function resendReason(error: ResendErrorLike | null | undefined): string {
  if (!error) return 'Resend gave no reason';
  return error.message || error.name || 'Unknown error';
}

/** An EmailFailure carrying Resend's error name and status, with `context` before Resend's words. */
export function resendFailure(context: string, error: ResendErrorLike | null | undefined): EmailFailure {
  return new EmailFailure(`${context}: ${resendReason(error)}`, error?.name || 'application_error', error?.statusCode ?? null);
}

// No 0/O or 1/I/L, so a reference read aloud or retyped stays the same.
const REF_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function newErrorRef(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return 'EM-' + Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
}

/** The error code for a failure: Resend's name and status when Resend said no. */
export function emailErrorFrom(err: unknown, where: EmailPlace): EmailError {
  const base = { where, ref: newErrorRef(), at: new Date().toISOString() };
  if (err instanceof EmailFailure) {
    return { ...base, code: err.code, status: err.status, message: err.message };
  }
  if (err && typeof err === 'object' && 'name' in err && 'statusCode' in err) {
    const e = err as ResendErrorLike;
    return { ...base, code: e.name || 'application_error', status: e.statusCode ?? null, message: resendReason(e) };
  }
  return { ...base, code: 'server_error', status: null, message: err instanceof Error ? err.message : String(err) };
}

/** The same without Resend's words, for pages anyone can open. */
export function publicEmailError(e: EmailError): EmailError {
  const { message: _message, ...rest } = e;
  return rest;
}

/** Audit log fields that let the Email Send Status page show the error code. */
export function emailErrorLogFields(e: EmailError) {
  return { ref: e.ref, error_code: e.code, error_status: e.status, where: e.where };
}

/** The error code from an audit log entry written with emailErrorLogFields. */
export function emailErrorFromLog(
  values: Record<string, unknown>,
  at: string,
  message: string | null,
): EmailError | null {
  const { ref, error_code: code, error_status: status, where } = values;
  if (typeof ref !== 'string' || typeof code !== 'string' || typeof where !== 'string') return null;
  return {
    code,
    status: typeof status === 'number' ? status : null,
    where,
    ref,
    at,
    message: message ?? undefined,
  };
}

/** One line: the reference and the code, for showing next to an error. */
export function emailErrorCodeLine(e: EmailError): string {
  return `${e.ref} · ${e.code}${e.status ? ` (${e.status})` : ''} · ${e.where}`;
}

function easternTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * The text the copy button puts on the clipboard. The hint is for the
 * people who fix it, so public pages leave it out.
 */
export function emailErrorReport(e: EmailError, { page, forAdmin }: { page?: string; forAdmin: boolean }): string {
  const lines = [
    'CEAL Statistics Database: email error',
    `Error code: ${e.ref}`,
    `Problem: ${e.code}${e.status ? ` (HTTP ${e.status})` : ''}`,
    `Where: ${(EMAIL_PLACES as Record<string, string>)[e.where] ?? e.where} [${e.where}]`,
    `When: ${easternTime(e.at)} (${e.at})`,
  ];
  if (page) lines.push(`Page: ${page}`);
  if (e.message) lines.push(`Message: ${e.message}`);
  if (forAdmin) lines.push(`Usually means: ${emailErrorHint(e.code)}`);
  return lines.join('\n');
}
