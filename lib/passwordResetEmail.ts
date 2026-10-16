// lib/passwordResetEmail.ts (server-only)
//
// Password setup and reset emails are transactional, so they use Resend's
// daily quota: 100 emails a day on the free plan, shared with every other
// single email the system sends. The sign-in page sent one each time an
// account without a password entered its email, and the forgot-password
// form one per click, with no limit; none of these needs a login, so
// entering one address again and again could use up the day's quota.
// Each account now gets at most one such email every 10 minutes.
//
// No new column is needed: every link is valid for 24 hours from the email
// that carries it, so the last email went out 24 hours before the stored
// expiry.

import db from '@/lib/db';
import { generateResetToken } from '@/lib/auth';

/** How long a password setup or reset link stays valid. */
export const RESET_LINK_TTL_MS = 24 * 60 * 60 * 1000;
/** At most one setup or reset email per account in this time. */
export const RESET_EMAIL_INTERVAL_MS = 10 * 60 * 1000;

export type ResetEmailClaim =
  | { ok: true; token: string }
  | { ok: false; retryInMinutes: number };

/**
 * Take the account's turn to be sent a setup or reset email: store the link
 * token with a fresh 24-hour expiry, unless an email went out in the last
 * 10 minutes. The check and the update are one statement, so two requests
 * at the same moment send one email.
 *
 * keepValidToken keeps the current link when it has not expired, so a link
 * in an earlier email still works.
 */
export async function claimResetEmail(
  userId: number,
  { keepValidToken = false }: { keepValidToken?: boolean } = {},
): Promise<ResetEmailClaim> {
  const now = Date.now();
  const current = await db.user.findUnique({
    where: { id: userId },
    select: { password_reset_token: true, password_reset_expires: true },
  });
  const currentToken =
    keepValidToken && current?.password_reset_token && current.password_reset_expires && current.password_reset_expires.getTime() > now
      ? current.password_reset_token
      : null;
  const token = currentToken ?? generateResetToken();

  // A link expiring after this was emailed less than 10 minutes ago.
  const sentRecently = new Date(now + RESET_LINK_TTL_MS - RESET_EMAIL_INTERVAL_MS);
  const claimed = await db.user.updateMany({
    where: {
      id: userId,
      OR: [{ password_reset_expires: null }, { password_reset_expires: { lte: sentRecently } }],
    },
    data: {
      password_reset_token: token,
      password_reset_expires: new Date(now + RESET_LINK_TTL_MS),
      requires_password_reset: true,
    },
  });
  if (claimed.count === 1) return { ok: true, token };

  const latest = await db.user.findUnique({ where: { id: userId }, select: { password_reset_expires: true } });
  const sentAt = (latest?.password_reset_expires?.getTime() ?? now + RESET_LINK_TTL_MS) - RESET_LINK_TTL_MS;
  const waitMs = sentAt + RESET_EMAIL_INTERVAL_MS - now;
  return { ok: false, retryInMinutes: Math.max(1, Math.ceil(waitMs / 60_000)) };
}

/**
 * The email could not be sent: let the account ask again straight away.
 * The link stays valid.
 */
export async function releaseResetEmail(userId: number, token: string): Promise<void> {
  await db.user.updateMany({
    where: { id: userId, password_reset_token: token },
    data: { password_reset_expires: new Date(Date.now() + RESET_LINK_TTL_MS - RESET_EMAIL_INTERVAL_MS - 1000) },
  });
}

export function retryMessage(minutes: number): string {
  return `A link was emailed to this address less than 10 minutes ago, so no new email was sent. Please use that one (check your spam folder too), or ask again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}
