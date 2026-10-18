// lib/email.ts (server-only)
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { formatDateWithWeekday, formatSimpleDate } from './dateFormatting';
import {
  formatOpeningDate,
  openingDateKey,
  closingDateKey,
  OPENING_TIME_LABEL,
  CLOSING_TIME_LABEL,
} from './surveyTime';
import { EmailFailure, resendFailure, resendReason } from './emailError';

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return false;
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "CEAL Statistics Database System <admin@cealstats.org>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    if (error) {
      console.error('Email sending failed:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

/**
 * What happened to one email. On failure, Resend's error name and status
 * come with it, so the caller can show an error code (lib/emailError.ts).
 */
export type EmailSendResult = { ok: true; id: string | null } | { ok: false; failure: EmailFailure };

const notConfigured = (setting: string): EmailSendResult => ({
  ok: false,
  failure: new EmailFailure(`${setting} is not set`, 'config_missing'),
});

const unexpected = (error: unknown): EmailSendResult => ({
  ok: false,
  failure:
    error instanceof EmailFailure
      ? error
      : new EmailFailure(error instanceof Error ? error.message : String(error), 'application_error'),
});

export async function sendPasswordResetEmail(
  email: string, 
  username: string, 
  resetToken: string,
  isInitialSetup = false
): Promise<EmailSendResult> {
  const resetUrl = `${ROOT_URL}/reset-password?token=${resetToken}`;
  
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return notConfigured('RESEND_API_KEY');
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "CEAL Statistics Database System <admin@cealstats.org>",
      to: email,
      subject: isInitialSetup ? 'CEAL Statistics Database - Set Up Your Password' : 'CEAL Statistics Database - Password Reset Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CEAL Statistics Database - ${isInitialSetup ? 'Set Up Your Password' : 'Password Reset Required'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px 0; }
            .button { 
              display: inline-block; 
              background-color: #007bff; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
            .security-note { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CEAL Statistics Database System</h1>
              <h2>${isInitialSetup ? 'Set Up Your Password' : 'Password Reset Required'}</h2>
            </div>
            
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>${isInitialSetup ? 
                'Welcome to the CEAL Statistics Database! To complete your account setup, you need to create a secure password.' :
                'As part of our security enhancement, you must create a new password to continue accessing your CEAL Statistics Database account.'
              }</p>
              
              <p><strong>What you need to do:</strong></p>
              <ol>
                <li>Click the button below to ${isInitialSetup ? 'create' : 'set'} your ${isInitialSetup ? 'initial' : 'new'} password</li>
                <li>Choose a strong password (minimum 12 characters, including an uppercase letter, a lowercase letter, a number and a special character)</li>
                <li>Include uppercase, lowercase, numbers, and special characters</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button text-white">${isInitialSetup ? 'Create Password' : 'Set New Password'}</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetUrl}</p>
              
              <div class="security-note">
                <strong>Security Note:</strong> This link will expire in 24 hours. If you don't ${isInitialSetup ? 'create' : 'set'} a password within this time, you'll need to contact your CEAL administrator.
              </div>
              
              <p>If you have any questions or need assistance, please contact your CEAL administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the CEAL Statistics Database System. Please do not reply to this email.</p>
              <p>If you did not expect this email, please contact your administrator immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Password reset email sending failed:', error);
      return { ok: false, failure: resendFailure('Resend did not accept the email', error) };
    }

    console.log('Password reset email sent successfully:', data?.id);
    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    return unexpected(error);
  }
}

export async function sendWelcomeEmail(
  email: string, 
  username: string, 
  resetToken?: string
): Promise<EmailSendResult> {
  const resetUrl = `${ROOT_URL}/reset-password?token=${resetToken}`;
  
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return notConfigured('RESEND_API_KEY');
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "CEAL Statistics Database System <admin@cealstats.org>",
      to: email,
      subject: 'Welcome to CEAL Statistics Database - Set Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to CEAL Statistics Database</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px 0; }
            .button { 
              display: inline-block; 
              background-color: #28a745; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CEAL Statistics Database</h1>
            </div>
            
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>Your CEAL Statistics Database account has been created successfully! To complete your account setup, you need to create a secure password.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button text-white">Create Your Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px;">${resetUrl}</p>
              
              <p><strong>Password Requirements:</strong></p>
              <ul>
                <li>Minimum 12 characters long</li>
                <li>Include uppercase letters (A-Z)</li>
                <li>Include lowercase letters (a-z)</li>
                <li>Include numbers (0-9)</li>
                <li>Include special characters (!@#$%^&*)</li>
              </ul>
              
              <p>This link will expire in 24 hours. If you don't complete your password setup within this time, please contact your CEAL administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the CEAL StatisticsDatabase System. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Welcome email sending failed:', error);
      return { ok: false, failure: resendFailure('Resend did not accept the email', error) };
    }

    console.log('Welcome email sent successfully:', data?.id);
    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    return unexpected(error);
  }
}

// New automated notification functions for form scheduling

export interface FormNotificationOptions {
  academicYear: number;
  openingDate: Date;
  closingDate: Date;
  recipientEmails: string[];
}

/** What happened to a notification sent to a list of people. */
export interface NotificationResult {
  /** Distinct recipients the notification was meant for. */
  attempted: number;
  /** Emails Resend accepted for delivery. */
  sent: number;
  /** Recipients Resend did not accept, with the reason it gave. */
  failed: { email: string; reason: string }[];
}

// Resend takes at most 100 emails per batch request.
const BATCH_SIZE = 100;
// Resend's default rate limit is 10 requests per second per team (it was 2),
// shared by every key on the team; the gap keeps a large send well under it.
const BATCH_GAP_MS = 600;
const MAX_ATTEMPTS = 3;
// Retries stop once this much time has gone by, so a Resend outage cannot
// run the cron job into its time limit before it records what happened.
const RETRY_BUDGET_MS = 25_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ResendError = { name?: string; message?: string; statusCode?: number | null };

/**
 * Rate limiting, a server error, or no response at all. Quota errors are also
 * HTTP 429 but will not clear by retrying, so they are not retried.
 */
function isRetryable(error: ResendError): boolean {
  if (error.name === 'rate_limit_exceeded' || error.name === 'concurrent_idempotent_requests') return true;
  if (error.name === 'daily_quota_exceeded' || error.name === 'monthly_quota_exceeded') return false;
  const status = error.statusCode;
  return status === null || status === undefined || status >= 500;
}

function retryDelayMs(headers: Record<string, string> | null | undefined, attempt: number): number {
  const retryAfter = Number(headers?.['retry-after']);
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 5_000);
  return 1_000 * 2 ** (attempt - 1); // 1s, 2s
}

function failAll(recipients: string[], reason: string): NotificationResult {
  return {
    attempted: recipients.length,
    sent: 0,
    failed: recipients.map((email) => ({ email, reason })),
  };
}

/**
 * Send the same email to each recipient separately (nobody sees anyone
 * else's address) and report what Resend actually accepted.
 *
 * The Resend SDK does not throw when a send fails; it returns `{ error }`.
 * Counting settled promises therefore reported every email as sent, even
 * when Resend had rejected them - which it does when a few hundred requests
 * arrive at once, because of its rate limit. This sends in batches of 100,
 * spaced out, retries rate limiting and server errors, and counts the
 * emails Resend accepted.
 */
export async function sendToEachRecipient(
  resend: Pick<Resend, 'batch'>,
  recipients: string[],
  message: { from: string; subject: string; html: string },
): Promise<NotificationResult> {
  // One email per address, however many accounts share it.
  const seen = new Set<string>();
  const unique = recipients
    .map((email) => email.trim())
    .filter((email) => {
      const key = email.toLowerCase();
      if (!email || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const result: NotificationResult = { attempted: unique.length, sent: 0, failed: [] };
  // A retried request carries the same key, so Resend never delivers a batch
  // twice even when a response is lost after it was accepted.
  const runId = randomUUID();
  const retryDeadline = Date.now() + RETRY_BUDGET_MS;

  for (let start = 0; start < unique.length; start += BATCH_SIZE) {
    if (start > 0) await sleep(BATCH_GAP_MS);
    const chunk = unique.slice(start, start + BATCH_SIZE);
    let lastReason = 'Unknown error';
    let accepted = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let response: Awaited<ReturnType<typeof sendBatch>>;
      try {
        response = await sendBatch(resend, chunk, message, `${runId}-${start}`);
      } catch (err) {
        response = {
          data: null,
          error: { name: 'application_error', statusCode: null, message: err instanceof Error ? err.message : String(err) },
          headers: null,
        };
      }

      if (response.data && !response.error) {
        // Permissive validation: the valid addresses go out and each invalid
        // one is reported by its position in the batch.
        const rejected = response.data.errors ?? [];
        const rejectedIndexes = new Set(rejected.map((e) => e.index));
        for (const e of rejected) {
          result.failed.push({ email: chunk[e.index] ?? `(batch position ${e.index})`, reason: e.message });
        }
        result.sent += chunk.length - rejectedIndexes.size;
        accepted = true;
        break;
      }

      const error: ResendError = response.error ?? {};
      lastReason = `${error.message || error.name || 'Unknown error'}${error.name ? ` [${error.name}${error.statusCode ? ` ${error.statusCode}` : ''}]` : ''}`;
      const delay = retryDelayMs(response.headers, attempt);
      if (attempt === MAX_ATTEMPTS || !isRetryable(error) || Date.now() + delay > retryDeadline) break;
      console.warn(`Resend batch attempt ${attempt} failed (${lastReason}); retrying in ${delay}ms`);
      await sleep(delay);
    }

    if (!accepted) {
      for (const email of chunk) result.failed.push({ email, reason: lastReason });
    }
  }

  return result;
}

function sendBatch(
  resend: Pick<Resend, 'batch'>,
  chunk: string[],
  message: { from: string; subject: string; html: string },
  idempotencyKey: string,
) {
  return resend.batch.send(
    chunk.map((to) => ({ ...message, to })),
    { batchValidation: 'permissive' as const, idempotencyKey },
  );
}

/** Sender for broadcasts to the CEAL audience. */
export const BROADCAST_FROM = 'CEAL Statistics Database <noreply@cealstats.org>';

/**
 * Create a broadcast to the CEAL audience and send it now.
 *
 * The SDK does not throw when Resend refuses a request; it returns
 * `{ error }`. Callers awaited `broadcasts.send` without looking at the
 * result, so a broadcast Resend never sent was recorded as sent and never
 * tried again. This throws instead, an EmailFailure with Resend's reason and
 * error name, so the caller can leave the job pending and report what went
 * wrong.
 */
export async function sendBroadcastNow(
  resend: Pick<Resend, 'broadcasts'>,
  message: { audienceId: string; subject: string; html: string },
): Promise<{ id: string }> {
  const created = await resend.broadcasts.create({
    audienceId: message.audienceId,
    from: BROADCAST_FROM,
    subject: message.subject,
    html: message.html,
  });
  const id = created.data?.id;
  if (created.error || !id) {
    throw created.error
      ? resendFailure('Resend did not create the broadcast', created.error)
      : new EmailFailure('Resend did not create the broadcast: Resend returned no broadcast id', 'application_error');
  }

  const sent = await resend.broadcasts.send(id);
  if (sent.error) {
    // The reply can be lost after Resend has accepted the send. Check before
    // calling it a failure, or the retry would send the broadcast twice.
    const check = await resend.broadcasts.get(id);
    const status = check.data?.status;
    if (status === 'sent' || status === 'queued') return { id };
    throw resendFailure(`Resend created broadcast ${id} but did not send it`, sent.error);
  }
  return { id };
}

function logNotificationResult(label: string, result: NotificationResult): void {
  const line = `${label}: ${result.sent}/${result.attempted} emails accepted by Resend`;
  if (result.failed.length === 0) {
    console.log(`✅ ${line}`);
  } else {
    console.error(`❌ ${line}; ${result.failed.length} failed:`, result.failed);
  }
}

/**
 * Send notification to all CEAL members that forms are now open
 * Uses Resend Broadcast API for mass distribution
 */
export async function sendFormsOpenedNotification(
  options: FormNotificationOptions
): Promise<NotificationResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return failAll(options.recipientEmails, 'RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    // Calendar days from the opening date to the closing date, both included.
    // Subtracting the instants would count the extra hours between 12:00 AM
    // Eastern and 11:59 PM Pacific and round up to one day too many.
    const dayMs = 1000 * 60 * 60 * 24;
    const dayIndex = (key: string) => Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / dayMs;
    const totalDays = dayIndex(closingDateKey(options.closingDate)) - dayIndex(openingDateKey(options.openingDate)) + 1;

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CEAL Statistics Database Forms Now Open</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .info-box { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .button { 
            display: inline-block; 
            background-color: #2563eb; 
            color: white !important; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📊 CEAL Statistics Database Forms</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Forms Now Open for ${options.academicYear}</h2>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Dear CEAL Member,</p>
            
            <p>The annual data collection forms are <strong>now open</strong> for academic year <strong>${options.academicYear}</strong>.</p>
            
            <div class="info-box">
              <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📅 Important Dates</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Forms Opened:</strong> ${formatOpeningDate(options.openingDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${OPENING_TIME_LABEL}</li>
                <li><strong>Forms Close:</strong> ${formatDateWithWeekday(options.closingDate)} at ${CLOSING_TIME_LABEL}</li>
                <li><strong>Submission Period:</strong> ${totalDays} days</li>
              </ul>
            </div>
            
            <p><strong>What you need to do:</strong></p>
            <ol>
              <li>Sign in to the CEAL Statistics Database system</li>
              <li>Navigate to the Forms section</li>
              <li>Complete all required forms for your library</li>
              <li>Submit before the closing date</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ROOT_URL}/admin/forms" class="button">Access Forms Now</a>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">⚠️ Important: Please ensure all forms are completed and submitted before the closing date.</p>
            
            <p>If you have any questions or encounter any issues, please contact the CEAL Statistics Database administrators.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>
            <strong>CEAL Statistics Database Administration</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">This is an automated notification from the CEAL Statistics Database System.</p>
            <p style="margin: 5px 0;">Council on East Asian Libraries (CEAL)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendToEachRecipient(resend, options.recipientEmails, {
      from: "CEAL Statistics Database <notifications@cealstats.org>",
      subject: `🔓 CEAL Statistics Database Forms Open for ${options.academicYear} - Action Required`,
      html: emailTemplate,
    });
    logNotificationResult('Forms opened notification', result);
    return result;
  } catch (error) {
    console.error('Forms opened notification failed:', error);
    return failAll(options.recipientEmails, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Send notification to all CEAL members that forms are now closed
 */
export async function sendFormsClosedNotification(
  options: FormNotificationOptions
): Promise<NotificationResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return failAll(options.recipientEmails, 'RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CEAL Statistics Database Forms Closed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .info-box { background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔒 CEAL Statistics Database Forms</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Forms Now Closed for ${options.academicYear}</h2>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Dear CEAL Member,</p>
            
            <p>The data collection forms for academic year <strong>${options.academicYear}</strong> are <strong>now closed</strong>.</p>
            
            <div class="info-box">
              <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">📅 Session Summary</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Forms Opened:</strong> ${formatOpeningDate(options.openingDate)}</li>
                <li><strong>Forms Closed:</strong> ${formatSimpleDate(options.closingDate)}</li>
                <li><strong>Status:</strong> Submissions are no longer accepted</li>
              </ul>
            </div>
            
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>All submitted data is being reviewed and processed</li>
              <li>You will receive updates on data compilation and reporting</li>
              <li>Forms will reopen for the next academic year according to the schedule</li>
            </ul>
            
            <p>Thank you for your participation in the CEAL Statistics Database data collection for ${options.academicYear}.</p>
            
            <p>If you have any questions or concerns about your submission, please contact the CEAL Statistics Database administrators as soon as possible.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>
            <strong>CEAL Statistics Database Administration</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">This is an automated notification from the CEAL Statistics Database System.</p>
            <p style="margin: 5px 0;">Council on East Asian Libraries (CEAL)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendToEachRecipient(resend, options.recipientEmails, {
      from: "CEAL Statistics Database <notifications@cealstats.org>",
      subject: `🔒 CEAL Statistics Database Forms Closed for ${options.academicYear}`,
      html: emailTemplate,
    });
    logNotificationResult('Forms closed notification', result);
    return result;
  } catch (error) {
    console.error('Forms closed notification failed:', error);
    return failAll(options.recipientEmails, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Send admin notification when forms are automatically opened
 */
export async function sendAdminFormsOpenedNotification(
  adminEmails: string[],
  academicYear: number,
  stats: { librariesOpened: number; totalLibraries: number }
): Promise<NotificationResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return failAll(adminEmails, 'RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Alert: Forms Automatically Opened</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .stats-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔓 Admin Alert</h1>
            <h2 style="margin: 10px 0 0 0; font-weight: normal;">Forms Automatically Opened</h2>
          </div>
          
          <div class="content">
            <p><strong>Dear CEAL Statistics Database Administrator,</strong></p>
            
            <p>The automated scheduling system has successfully opened the forms for academic year <strong>${academicYear}</strong>.</p>
            
            <div class="stats-box">
              <h3 style="color: #047857; margin-top: 0;">📊 System Status</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Academic Year:</strong> ${academicYear}</li>
                <li><strong>Libraries Opened:</strong> ${stats.librariesOpened} out of ${stats.totalLibraries}</li>
                <li><strong>Action Time:</strong> ${new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</li>
                <li><strong>Status:</strong> ✅ All members notified</li>
              </ul>
            </div>
            
            <p><strong>Actions Completed:</strong></p>
            <ul>
              <li>All Library_Year records updated to <code>is_open_for_editing = true</code></li>
              <li>Email notifications sent to all CEAL members</li>
              <li>Audit log entries created for tracking</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Monitor form submissions through the admin dashboard</li>
              <li>Forms will automatically close on the scheduled date</li>
              <li>Review audit logs for any issues</li>
            </ul>
            
            <p>You can view the <a href="${ROOT_URL}/admin/superguide">admin dashboard</a> to monitor form status and submissions.</p>
            
            <p style="margin-top: 30px;">This is an automated notification from the CEAL Statistics Database scheduling system.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">CEAL Statistics Database System - Automated Scheduling</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendToEachRecipient(resend, adminEmails, {
      from: "CEAL Statistics Database System <system@cealstats.org>",
      subject: `✅ Admin Alert: Forms Automatically Opened for ${academicYear}`,
      html: emailTemplate,
    });
    logNotificationResult('Admin forms opened notification', result);
    return result;
  } catch (error) {
    console.error('Admin forms opened notification failed:', error);
    return failAll(adminEmails, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Send admin notification when forms are automatically closed
 */
export async function sendAdminFormsClosedNotification(
  adminEmails: string[],
  academicYear: number,
  stats: { librariesClosed: number; totalLibraries: number }
): Promise<NotificationResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Email configuration missing: RESEND_API_KEY required');
      return failAll(adminEmails, 'RESEND_API_KEY is not configured');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Alert: Forms Automatically Closed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .stats-box { background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔒 Admin Alert</h1>
            <h2 style="margin: 10px 0 0 0; font-weight: normal;">Forms Automatically Closed</h2>
          </div>
          
          <div class="content">
            <p><strong>Dear CEAL Statistics Database Administrator,</strong></p>
            
            <p>The automated scheduling system has successfully closed the forms for academic year <strong>${academicYear}</strong>.</p>
            
            <div class="stats-box">
              <h3 style="color: #991b1b; margin-top: 0;">📊 System Status</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Academic Year:</strong> ${academicYear}</li>
                <li><strong>Libraries Closed:</strong> ${stats.librariesClosed} out of ${stats.totalLibraries}</li>
                <li><strong>Action Time:</strong> ${new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</li>
                <li><strong>Status:</strong> 🔒 All members notified</li>
              </ul>
            </div>
            
            <p><strong>Actions Completed:</strong></p>
            <ul>
              <li>All Library_Year records updated to <code>is_open_for_editing = false</code></li>
              <li>Email notifications sent to all CEAL members</li>
              <li>Audit log entries created for tracking</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review submission completeness through the admin dashboard</li>
              <li>Begin data validation and compilation process</li>
              <li>Follow up with libraries that didn't submit</li>
              <li>Prepare for next year's data collection cycle</li>
            </ul>
            
            <p>You can view the <a href="${ROOT_URL}/admin/superguide">admin dashboard</a> to review submission status.</p>
            
            <p style="margin-top: 30px;">This is an automated notification from the CEAL Statistics Database scheduling system.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">CEAL Statistics Database System - Automated Scheduling</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendToEachRecipient(resend, adminEmails, {
      from: "CEAL Statistics Database System <system@cealstats.org>",
      subject: `🔒 Admin Alert: Forms Automatically Closed for ${academicYear}`,
      html: emailTemplate,
    });
    logNotificationResult('Admin forms closed notification', result);
    return result;
  } catch (error) {
    console.error('Admin forms closed notification failed:', error);
    return failAll(adminEmails, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Add a new user to the Resend audience that broadcasts go to. Someone not
 * on it gets no broadcasts, so a failure is reported, not only logged.
 */
export async function addUserToResendContacts(
  email: string,
  firstName?: string | null,
  lastName?: string | null
): Promise<EmailSendResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend contact creation skipped: RESEND_API_KEY not configured');
      return notConfigured('RESEND_API_KEY');
    }

    if (!process.env.RESEND_BROADCAST_LIST_ID) {
      console.error('Resend contact creation skipped: RESEND_BROADCAST_LIST_ID not configured');
      return notConfigured('RESEND_BROADCAST_LIST_ID');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Create contact in Resend audience
    const { data, error } = await resend.contacts.create({
      email: email,
      firstName: firstName || '',
      lastName: lastName || '',
      unsubscribed: false,
      audienceId: process.env.RESEND_BROADCAST_LIST_ID,
    });

    if (error) {
      // Already on the list is what this was for.
      if (/already exists/i.test(resendReason(error))) return { ok: true, id: null };
      console.error('Failed to add contact to Resend:', error);
      return { ok: false, failure: resendFailure('Resend did not add the contact to the broadcast list', error) };
    }

    console.log(`✅ Added user to Resend contacts: ${email} (Contact ID: ${data?.id})`);
    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    console.error('Resend contact creation error:', error);
    return unexpected(error);
  }
}
