'use client';

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { LocalDateTime } from '@/components/LocalDateTime';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AlertCircle, ChevronDown, ChevronRight, Loader2, RefreshCw, SlashIcon } from 'lucide-react';

// Mirrors lib/emailActivity.ts (server-only).
interface SendRecord {
  id: number;
  at: string;
  kind: string;
  label: string;
  channel: 'broadcast' | 'transactional';
  year: number | null;
  by: string;
  ok: boolean;
  error: string | null;
  recipients: string;
  attempted: number | null;
  accepted: number | null;
  failed: { email: string; reason: string }[];
  broadcastId: string | null;
  emailId: string | null;
}

interface BroadcastStatus {
  status: string | null;
  sentAt: string | null;
  counts: Record<string, number> | null;
  countsError: string | null;
  error: string | null;
}

interface EmailStatus {
  lastEvent: string | null;
  to: string[];
  subject: string | null;
  createdAt: string | null;
  error: string | null;
}

interface QuotaStatus {
  source: 'usage_api' | 'headers' | 'count';
  dailyUsed: number;
  dailyLimit: number | null;
  dailyResetsAt: string;
  monthlyUsed: number | null;
  monthlyLimit: number | null;
  monthlyResetsAt: string | null;
}

interface RecentEmails {
  emails: { id: string; to: string[]; subject: string; createdAt: string; lastEvent: string }[];
  incomplete: boolean;
  quota: QuotaStatus | null;
  error: string | null;
}

type Delivery =
  | { state: 'loading' }
  | { state: 'broadcast'; data: BroadcastStatus }
  | { state: 'email'; data: EmailStatus }
  | { state: 'error'; message: string };

// "Check delivery status" looks up this many of the newest sends.
const CHECK_LATEST = 10;
// Lookups from this page go one at a time, well under Resend's rate limit
// (10 requests per second by default, shared by every key on the team).
const LOOKUP_GAP_MS = 300;

const QUOTA_SOURCE: Record<QuotaStatus['source'], string> = {
  usage_api: 'From Resend’s usage figures.',
  headers: 'As reported by Resend.',
  count:
    'Counted from Resend’s list of sent emails. Emails the account receives also count and are not in the list.',
};

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-green-50 text-green-800 border-green-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  amber: 'bg-amber-50 text-amber-900 border-amber-200',
  red: 'bg-red-50 text-red-800 border-red-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
};

const EVENT_TONES: Record<string, Tone> = {
  delivered: 'green',
  opened: 'green',
  clicked: 'green',
  sent: 'blue',
  queued: 'gray',
  scheduled: 'gray',
  draft: 'gray',
  canceled: 'gray',
  delivery_delayed: 'amber',
  bounced: 'red',
  failed: 'red',
  complained: 'red',
  suppressed: 'red',
};

function Pill({ tone, children, title }: { tone: Tone; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

function eventLabel(event: string): string {
  const text = event.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function EventPill({ event }: { event: string | null }) {
  if (!event) return <span className="text-gray-400">—</span>;
  return <Pill tone={EVENT_TONES[event] ?? 'gray'}>{eventLabel(event)}</Pill>;
}

function hasProblem(r: SendRecord): boolean {
  return !r.ok || r.failed.length > 0;
}

function ResultCell({ r }: { r: SendRecord }) {
  if (r.kind === 'opening_broadcast_scheduled' && r.ok) {
    return (
      <Pill tone="blue" title="Resend accepted it. The daily job sends it on the opening date.">
        Scheduled
      </Pill>
    );
  }
  if (!r.ok && !r.accepted) return <Pill tone="red">Not sent</Pill>;
  if (r.failed.length > 0) {
    return (
      <Pill tone="amber">
        {r.failed.length}
        {r.attempted !== null ? ` of ${r.attempted}` : ''} not accepted
      </Pill>
    );
  }
  const count =
    r.attempted !== null && r.accepted !== null && r.attempted > 1
      ? ` ${r.accepted}/${r.attempted}`
      : r.accepted !== null && r.accepted > 1
        ? ` ${r.accepted}`
        : '';
  return <Pill tone="green">Accepted{count}</Pill>;
}

const COUNT_ORDER = ['delivered', 'bounced', 'complained', 'suppressed', 'failed', 'delivery_delayed'];

function DeliveryCell({ r, d, onCheck }: { r: SendRecord; d: Delivery | undefined; onCheck: () => void }) {
  if (!r.broadcastId && !r.emailId) return <span className="text-gray-400">—</span>;
  if (!d) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onCheck();
        }}
      >
        Check
      </Button>
    );
  }
  if (d.state === 'loading') return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />;
  if (d.state === 'error') {
    return (
      <span className="text-xs text-red-700" title={d.message}>
        Not available{' '}
        <button
          type="button"
          className="underline"
          onClick={(e) => {
            e.stopPropagation();
            onCheck();
          }}
        >
          retry
        </button>
      </span>
    );
  }
  if (d.state === 'email') {
    return d.data.error ? (
      <span className="text-xs text-gray-500" title={d.data.error}>
        Not available
      </span>
    ) : (
      <EventPill event={d.data.lastEvent} />
    );
  }

  const b = d.data;
  if (b.error) {
    return (
      <span className="text-xs text-gray-500" title={b.error}>
        Not available
      </span>
    );
  }
  const counts = b.counts
    ? COUNT_ORDER.filter((k) => (b.counts?.[k] ?? 0) > 0 || k === 'delivered').map(
        (k) => `${b.counts?.[k] ?? 0} ${eventLabel(k).toLowerCase()}`,
      )
    : [];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <EventPill event={b.status} />
      {counts.length > 0 && <span className="text-xs text-gray-700">{counts.join(' · ')}</span>}
    </div>
  );
}

export default function EmailStatusClient() {
  const [records, setRecords] = useState<SendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentEmails | null>(null);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Record<number, Delivery>>({});
  const [checking, setChecking] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [problemsOnly, setProblemsOnly] = useState(false);

  // Every Resend lookup waits for the one before it.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const enqueue = useCallback((task: () => Promise<void>) => {
    const run = queue.current.then(task).then(() => new Promise<void>((r) => setTimeout(r, LOOKUP_GAP_MS)));
    queue.current = run.catch(() => undefined);
    return run;
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/email-status', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load the send records');
      setRecords(data.records);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the send records');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecent = useCallback(
    () =>
      enqueue(async () => {
        setRecentLoading(true);
        setRecentError(null);
        try {
          const res = await fetch('/api/admin/email-status/resend?recent=1', { cache: 'no-store' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Resend lookup failed');
          setRecent(data);
          if (data.error) setRecentError(data.error);
        } catch (err) {
          setRecentError(err instanceof Error ? err.message : 'Resend lookup failed');
        } finally {
          setRecentLoading(false);
        }
      }),
    [enqueue],
  );

  useEffect(() => {
    void loadRecords();
    void loadRecent();
  }, [loadRecords, loadRecent]);

  const checkDelivery = useCallback(
    (r: SendRecord) =>
      enqueue(async () => {
        setDelivery((prev) => ({ ...prev, [r.id]: { state: 'loading' } }));
        const query = r.broadcastId ? `broadcastId=${r.broadcastId}` : `emailId=${r.emailId}`;
        try {
          const res = await fetch(`/api/admin/email-status/resend?${query}`, { cache: 'no-store' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Resend lookup failed');
          const next: Delivery = r.broadcastId ? { state: 'broadcast', data } : { state: 'email', data };
          setDelivery((prev) => ({ ...prev, [r.id]: next }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Resend lookup failed';
          setDelivery((prev) => ({ ...prev, [r.id]: { state: 'error', message } }));
        }
      }),
    [enqueue],
  );

  const shown = useMemo(() => (problemsOnly ? records.filter(hasProblem) : records), [records, problemsOnly]);
  const problemCount = useMemo(() => records.filter(hasProblem).length, [records]);
  const lastSend = records.find((r) => r.kind !== 'opening_broadcast_scheduled');

  const checkLatest = async () => {
    setChecking(true);
    const targets = shown.filter((r) => r.broadcastId || r.emailId).slice(0, CHECK_LATEST);
    await Promise.all(targets.map((r) => checkDelivery(r)));
    setChecking(false);
  };

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const recentByEvent = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of recent?.emails ?? []) totals[e.lastEvent] = (totals[e.lastEvent] ?? 0) + 1;
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [recent]);

  const quota = recent?.quota ?? null;
  const usedShare = quota?.dailyLimit ? quota.dailyUsed / quota.dailyLimit : 0;
  const usedTone = usedShare >= 0.9 ? 'bg-red-500' : usedShare >= 0.7 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <Container className="py-8">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Email Send Status</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Send Status</h1>
        <p className="text-muted-foreground max-w-4xl">
          Every email the system has sent, whether Resend accepted it, and what happened to it after.
          Broadcasts go to the CEAL audience in Resend. Transactional emails (individual emails, the
          &ldquo;forms closed&rdquo; notice, account emails) count against the free plan&rsquo;s 100 a day
          and 3,000 a month; broadcasts do not.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">Transactional emails today</div>
            <button
              type="button"
              onClick={() => void loadRecent()}
              disabled={recentLoading}
              className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
              title="Ask Resend again"
            >
              <RefreshCw className={`w-4 h-4 ${recentLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {quota ? (
            <>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {quota.dailyUsed}
                {quota.source === 'count' && recent?.incomplete ? '+' : ''}{' '}
                <span className="text-base font-normal text-gray-500">
                  {quota.dailyLimit !== null ? `/ ${quota.dailyLimit}` : '(no daily limit on this plan)'}
                </span>
              </div>
              {quota.dailyLimit !== null && (
                <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                  <div className={`h-full ${usedTone}`} style={{ width: `${Math.min(100, Math.round(usedShare * 100))}%` }} />
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                The day runs on UTC: it starts again at <LocalDateTime dateString={quota.dailyResetsAt} />.
                {quota.monthlyUsed !== null && quota.monthlyLimit !== null && (
                  <> This month: {quota.monthlyUsed} of {quota.monthlyLimit.toLocaleString('en-US')}.</>
                )}{' '}
                {QUOTA_SOURCE[quota.source]}
              </p>
            </>
          ) : recentError ? (
            <p className="mt-2 text-sm text-red-700">Resend did not answer: {recentError}</p>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Asking Resend…
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Sends with problems</div>
          <div className={`mt-1 text-2xl font-bold ${problemCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>
            {loading ? '…' : problemCount}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Not sent, or some recipients not accepted by Resend, among the {records.length} sends listed below.
          </p>
          {problemCount > 0 && (
            <button
              type="button"
              className="mt-1 text-xs text-blue-700 underline"
              onClick={() => setProblemsOnly(true)}
            >
              Show only these
            </button>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Last send</div>
          {lastSend ? (
            <>
              <div className="mt-1 font-semibold text-gray-900">{lastSend.label}</div>
              <div className="text-sm text-gray-600">
                <LocalDateTime dateString={lastSend.at} />
              </div>
              <div className="mt-2">
                <ResultCell r={lastSend} />
              </div>
            </>
          ) : (
            <div className="mt-1 text-sm text-gray-500">{loading ? '…' : 'Nothing sent yet'}</div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Send history */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900">Send history</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={problemsOnly} onChange={(e) => setProblemsOnly(e.target.checked)} />
              Problems only
            </label>
            <Button variant="outline" size="sm" onClick={() => void loadRecords()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Reload
            </Button>
            <Button size="sm" onClick={() => void checkLatest()} disabled={checking || loading}>
              {checking ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Check delivery for the latest {CHECK_LATEST}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="w-6" />
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">What</th>
                <th className="px-3 py-2 font-medium">Year</th>
                <th className="px-3 py-2 font-medium">To</th>
                <th className="px-3 py-2 font-medium">By</th>
                <th className="px-3 py-2 font-medium">Sending</th>
                <th className="px-3 py-2 font-medium">Delivery (Resend)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                    <Loader2 className="inline w-4 h-4 mr-2 animate-spin" /> Loading…
                  </td>
                </tr>
              ) : shown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                    {problemsOnly ? 'No problems recorded.' : 'No emails recorded yet.'}
                  </td>
                </tr>
              ) : (
                shown.map((r) => {
                  const open = expanded.has(r.id);
                  const d = delivery[r.id];
                  const lookupError =
                    d?.state === 'error' ? d.message : d?.state === 'email' || d?.state === 'broadcast' ? d.data.error : null;
                  return (
                    <Fragment key={r.id}>
                      <tr
                        className={`cursor-pointer hover:bg-gray-50 ${hasProblem(r) ? 'bg-red-50/40' : ''}`}
                        onClick={() => toggle(r.id)}
                      >
                        <td className="pl-2 text-gray-400">
                          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <LocalDateTime dateString={r.at} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900">{r.label}</div>
                          <div className="text-xs text-gray-500">{r.channel === 'broadcast' ? 'Broadcast' : 'Transactional'}</div>
                        </td>
                        <td className="px-3 py-2">{r.year ?? '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{r.recipients}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{r.by}</td>
                        <td className="px-3 py-2">
                          <ResultCell r={r} />
                        </td>
                        <td className="px-3 py-2">
                          <DeliveryCell r={r} d={d} onCheck={() => void checkDelivery(r)} />
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-gray-50/60">
                          <td />
                          <td colSpan={7} className="px-3 py-3 space-y-2 text-sm">
                            {r.error && (
                              <p className="text-red-800">
                                <span className="font-medium">Error:</span> {r.error}
                              </p>
                            )}
                            {r.failed.length > 0 && !(r.failed.length === 1 && r.failed[0].reason === r.error) && (
                              <div>
                                <div className="font-medium text-gray-800">Not accepted by Resend</div>
                                <ul className="mt-1 space-y-0.5">
                                  {r.failed.map((f, i) => (
                                    <li key={i} className="text-gray-700">
                                      <span className="font-mono text-xs">{f.email}</span> — {f.reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {d?.state === 'broadcast' && (
                              <div>
                                {d.data.sentAt && (
                                  <p className="text-gray-700">
                                    Sent by Resend: <LocalDateTime dateString={d.data.sentAt} />
                                  </p>
                                )}
                                {d.data.countsError && (
                                  <p className="text-gray-600">Delivery totals not available: {d.data.countsError}</p>
                                )}
                                {d.data.counts &&
                                  ['bounced', 'complained', 'suppressed', 'failed'].some((k) => (d.data.counts?.[k] ?? 0) > 0) && (
                                    <p className="text-gray-700">
                                      To see which addresses were not reached, open this broadcast in the Resend
                                      dashboard (Broadcasts).
                                    </p>
                                  )}
                              </div>
                            )}
                            {lookupError && (
                              <p className="text-gray-600">
                                Resend did not return the status: {lookupError}. Resend keeps email details only
                                for your plan&rsquo;s data retention period.
                              </p>
                            )}
                            {(r.broadcastId || r.emailId) && (
                              <p className="text-xs text-gray-500">
                                Resend {r.broadcastId ? 'broadcast' : 'email'} id:{' '}
                                <span className="font-mono">{r.broadcastId ?? r.emailId}</span> ·{' '}
                                <a
                                  href={`https://resend.com/${r.broadcastId ? 'broadcasts' : 'emails'}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 underline"
                                >
                                  Resend dashboard: {r.broadcastId ? 'Broadcasts' : 'Emails'}
                                </a>
                              </p>
                            )}
                            {!r.error && r.failed.length === 0 && !d && !r.broadcastId && !r.emailId && (
                              <p className="text-gray-500">No further details recorded.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500 max-w-4xl">
          <strong>Sending</strong> is what Resend said when the system handed the email over.{' '}
          <strong>Delivery</strong> is what happened after: <em>Delivered</em> means the recipient&rsquo;s
          mail server took it; <em>Bounced</em> means it refused it (for example, the address no longer
          exists); <em>Suppressed</em> means Resend did not send it because that address bounced or
          complained before. Account emails (welcome, password reset) are not in this list; they appear
          in the transactional list below.
        </p>
      </section>

      {/* Transactional emails from Resend */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900">Transactional emails in the last 24 hours</h2>
          <Button variant="outline" size="sm" onClick={() => void loadRecent()} disabled={recentLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${recentLoading ? 'animate-spin' : ''}`} /> Refresh from Resend
          </Button>
        </div>
        {recentByEvent.length > 0 && !recentError && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
            {recentByEvent.map(([event, count]) => (
              <span key={event} className="inline-flex items-center gap-1">
                <EventPill event={event} /> {count}
              </span>
            ))}
          </div>
        )}
        <div className="rounded-lg border bg-white overflow-auto max-h-[480px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">To</th>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!recent && recentLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                    <Loader2 className="inline w-4 h-4 mr-2 animate-spin" /> Asking Resend…
                  </td>
                </tr>
              ) : recentError ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-red-700">
                    Resend did not answer: {recentError}
                  </td>
                </tr>
              ) : !recent || recent.emails.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                    No transactional emails in the last 24 hours.
                  </td>
                </tr>
              ) : (
                recent.emails.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <LocalDateTime dateString={e.createdAt} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.to.join(', ')}</td>
                    <td className="px-3 py-2">{e.subject}</td>
                    <td className="px-3 py-2">
                      <EventPill event={e.lastEvent} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {recent?.incomplete && (
          <p className="mt-2 text-xs text-gray-500">Showing the newest {recent.emails.length}; there are more.</p>
        )}
      </section>
    </Container>
  );
}
