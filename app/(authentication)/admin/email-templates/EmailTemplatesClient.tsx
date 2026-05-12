'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  SlashIcon,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

type DeliveryMode =
  | 'manual_broadcast'
  | 'auto_on_open'
  | 'auto_one_week_before_close'
  | 'manual_individual';

interface TemplateRow {
  key: string;
  name: string;
  description?: string | null;
  delivery?: DeliveryMode;
  subject: string;
  html: string;
  isCustomized: boolean;
  updated_at: string | null;
  updated_by: number | null;
  announcementSentAt?: string | null;
  closingReminderSent?: boolean | null;
}

interface SessionInfo {
  year: number;
  openingDate: string;
  closingDate: string;
  isOpen: boolean;
}

interface PreviewData {
  subject: string;
  html: string;
  context: Record<string, string | number>;
}

interface EmailTemplatesClientProps {
  userRoles: string[];
}

const PLACEHOLDER_HINTS: { token: string; description: string }[] = [
  { token: '{{year}}', description: 'Current academic year (e.g. 2026)' },
  { token: '{{prevYear}}', description: 'year - 1 (e.g. 2025)' },
  { token: '{{nextYear}}', description: 'year + 1 (e.g. 2027)' },
  { token: '{{openingDate}}', description: 'Opening date formatted in Eastern Time' },
  { token: '{{closingDate}}', description: 'Closing date formatted in Pacific Time' },
  { token: '{{fiscalYearStart}}', description: 'July 1, prevYear' },
  { token: '{{fiscalYearEnd}}', description: 'June 30, year' },
  { token: '{{publicationMonth}}', description: 'Publication month/year (e.g. February 2027)' },
  { token: '{{siteUrl}}', description: 'https://cealstats.org/' },
];

export default function EmailTemplatesClient({ userRoles }: EmailTemplatesClientProps) {
  const isSuperAdmin = userRoles?.includes('1');

  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [defaults, setDefaults] = useState<{ subject: string; html: string } | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // Load list on mount
  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    void refreshList();
  }, [isSuperAdmin]);

  // Load active template detail when key changes
  useEffect(() => {
    if (activeKey) {
      void loadTemplate(activeKey);
    }
  }, [activeKey]);

  const refreshList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/email-templates');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load templates');
      setTemplates(data.templates);
      setSession(data.session ?? null);
      if (!activeKey && data.templates.length > 0) {
        setActiveKey(data.templates[0].key);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (key: string) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${key}?preview=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load template');
      setSubject(data.template.subject);
      setHtml(data.template.html);
      setDefaults(data.defaults);
      setPreview(data.preview);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const refreshPreview = async () => {
    if (!activeKey) return;
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}?preview=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html }),
      });
      // POST not supported; build preview client-side via GET endpoint instead.
      // Fall through to fallback below.
      if (!res.ok) {
        // Compose preview by replacing placeholders client-side using last known context.
        if (preview?.context) {
          setPreview({
            subject: substitute(subject, preview.context),
            html: substitute(html, preview.context),
            context: preview.context,
          });
        }
      } else {
        const data = await res.json();
        if (data.preview) setPreview(data.preview);
      }
    } catch {
      if (preview?.context) {
        setPreview({
          subject: substitute(subject, preview.context),
          html: substitute(html, preview.context),
          context: preview.context,
        });
      }
    } finally {
      setPreviewing(false);
    }
  };

  const save = async () => {
    if (!activeKey) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = [data.error, data.detail, data.hint].filter(Boolean).join(' — ');
        throw new Error(msg || 'Failed to save');
      }
      setInfo('Saved.');
      setDirty(false);
      await refreshList();
      await loadTemplate(activeKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const sendNow = async () => {
    if (!activeKey) return;
    const active = templates.find((t) => t.key === activeKey);
    if (!active || active.delivery !== 'manual_broadcast') return;

    const confirmMsg =
      `This will IMMEDIATELY send the "${active.name}" broadcast to the entire CEAL audience.\n\n` +
      `Subject: ${previewSubject}\n` +
      (session
        ? `Year: ${session.year}\nOpening: ${new Date(session.openingDate).toLocaleDateString()}\nClosing: ${new Date(session.closingDate).toLocaleDateString()}\n\n`
        : '\n') +
      `Make sure you have SAVED the latest edits first — the email uses the saved version, not unsaved changes.\n\n` +
      `Proceed?`;
    if (!confirm(confirmMsg)) return;

    setSending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = [data.error, data.detail].filter(Boolean).join(' — ');
        throw new Error(msg || 'Failed to send');
      }
      setInfo(`Broadcast sent. Resend broadcast id: ${data.broadcastId ?? '(unknown)'}`);
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const resetToDefault = async () => {
    if (!activeKey) return;
    if (!confirm('Reset this template to the built-in default? Your customizations will be lost.')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeKey}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset');
      setInfo('Reset to default.');
      await refreshList();
      await loadTemplate(activeKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const onChangeSubject = (v: string) => {
    setSubject(v);
    setDirty(true);
  };
  const onChangeHtml = (v: string) => {
    setHtml(v);
    setDirty(true);
  };

  const previewHtml = useMemo(() => {
    if (!preview?.context) return html;
    return substitute(html, preview.context);
  }, [html, preview?.context]);
  const previewSubject = useMemo(() => {
    if (!preview?.context) return subject;
    return substitute(subject, preview.context);
  }, [subject, preview?.context]);

  if (!isSuperAdmin) {
    return (
      <Container>
        <div className="max-w-2xl mx-auto my-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Access Denied</h2>
            </div>
            <p className="text-red-800 mb-4">
              Super Admin privileges (Role ID 1) are required to edit email templates.
            </p>
            <Link href="/admin">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

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
              <BreadcrumbPage>Email Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
          <p className="text-muted-foreground">
            Edit the content of broadcast and individual emails sent from this system. Use the
            placeholders on the right so dates and the year fill in automatically based on the
            currently scheduled session.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 whitespace-pre-wrap">{error}</p>
          </div>
        )}
        {info && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{info}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-2">
            {loading && templates.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : (
              templates.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    activeKey === t.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.key}</div>
                  <div className="text-xs mt-2">
                    {t.isCustomized ? (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Customized</span>
                    ) : (
                      <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Default</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </aside>

          {/* Editor + preview */}
          <section className="space-y-6">
            {!activeKey ? (
              <div className="text-gray-500">Select a template on the left.</div>
            ) : (
              <>
                {/* Delivery-mode banner (per template) */}
                {(() => {
                  const t = templates.find((x) => x.key === activeKey);
                  if (!t?.delivery) return null;
                  const map: Record<DeliveryMode, { color: string; title: string; body: string }> = {
                    manual_broadcast: {
                      color: 'bg-purple-50 border-purple-200 text-purple-900',
                      title: 'Manual broadcast — Super Admin sends it',
                      body: 'Use the "Send broadcast now" button below to deliver this to the entire CEAL audience. Nothing is sent automatically.',
                    },
                    auto_on_open: {
                      color: 'bg-green-50 border-green-200 text-green-900',
                      title: 'Automatic — sent on the opening date',
                      body: 'This is delivered automatically when the scheduled opening date is reached (via Resend scheduledAt + the daily cron as backup). You can only edit content here — timing is controlled by the SurveySession.',
                    },
                    auto_one_week_before_close: {
                      color: 'bg-amber-50 border-amber-200 text-amber-900',
                      title: 'Automatic — sent 1 week before closing',
                      body: 'The daily cron sends this once when the closing date is 7 days away. The `notifiedClosingReminder` flag on SurveySession prevents duplicate sends.',
                    },
                    manual_individual: {
                      color: 'bg-gray-50 border-gray-200 text-gray-900',
                      title: 'Individual resend — single user only',
                      body: 'Sent from the admin tools to one user at a time. Never broadcast to the whole audience.',
                    },
                  };
                  const m = map[t.delivery];
                  return (
                    <div className={`border rounded-lg p-4 text-sm ${m.color}`}>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-1">{m.title}</div>
                          <p className="text-sm">{m.body}</p>
                          {t.delivery === 'manual_broadcast' && t.announcementSentAt && (
                            <p className="text-sm mt-2">
                              <strong>Last sent:</strong>{' '}
                              {new Date(t.announcementSentAt).toLocaleString()}
                            </p>
                          )}
                          {t.delivery === 'auto_one_week_before_close' && t.closingReminderSent && (
                            <p className="text-sm mt-2">
                              <strong>Already sent for the current session.</strong>
                            </p>
                          )}
                          {session && (
                            <p className="text-xs mt-2 opacity-80">
                              Current session: year {session.year}, opens{' '}
                              {new Date(session.openingDate).toLocaleDateString()}, closes{' '}
                              {new Date(session.closingDate).toLocaleDateString()}.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Placeholder helper */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="font-semibold text-blue-900 mb-2">Available placeholders</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-blue-900">
                    {PLACEHOLDER_HINTS.map((p) => (
                      <div key={p.token} className="flex gap-2">
                        <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-xs">
                          {p.token}
                        </code>
                        <span className="text-blue-800 text-xs">{p.description}</span>
                      </div>
                    ))}
                  </div>
                  {preview?.context && (
                    <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-900">
                      <strong>Current preview values:</strong>{' '}
                      year={String(preview.context.year)}, opening={String(preview.context.openingDate)},
                      closing={String(preview.context.closingDate)}
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => onChangeSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* HTML body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-700">HTML body</label>
                    {defaults && html === defaults.html && (
                      <span className="text-xs text-gray-500">(matches default)</span>
                    )}
                  </div>
                  <textarea
                    value={html}
                    onChange={(e) => onChangeHtml(e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 font-mono text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={save} disabled={saving || !dirty} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                  {templates.find((t) => t.key === activeKey)?.delivery === 'manual_broadcast' && (
                    <Button
                      onClick={sendNow}
                      disabled={sending || dirty}
                      className="bg-purple-600 hover:bg-purple-700"
                      title={dirty ? 'Save your edits first' : 'Send this broadcast immediately to the CEAL audience'}
                    >
                      {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Send broadcast now
                    </Button>
                  )}
                  <Button onClick={refreshPreview} disabled={previewing} className="bg-gray-600 hover:bg-gray-700">
                    {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                    Refresh preview
                  </Button>
                  <Button onClick={() => activeKey && loadTemplate(activeKey)} className="bg-gray-500 hover:bg-gray-600">
                    <RefreshCw className="w-4 h-4 mr-2" /> Reload
                  </Button>
                  <Button onClick={resetToDefault} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset to default
                  </Button>
                </div>

                {/* Preview */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview</h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 text-sm">
                      <strong>Subject:</strong> {previewSubject}
                    </div>
                    <div
                      className="p-6 bg-white max-h-[500px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Preview values are pulled from the most recent SurveySession. They update when
                    you click <em>Refresh preview</em> or save.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </Container>
  );
}

/** Client-side mirror of the server-side substitution (best-effort preview). */
function substitute(template: string, ctx: Record<string, any>): string {
  return template.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g, (m, k) => {
    if (Object.prototype.hasOwnProperty.call(ctx, k)) {
      const v = ctx[k];
      return v === null || v === undefined ? '' : String(v);
    }
    return m;
  });
}
