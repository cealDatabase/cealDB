'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import {
  formatYearLabel,
  groupByDecade,
  type PublishedReportRow,
} from '@/lib/publishedReports';

interface Props {
  userRoles: string[];
}

const EMPTY_FORM = {
  academicYear: new Date().getFullYear() - 1, // last completed FY by default
  title: '',
  url: '',
  journal: 'Journal of East Asian Libraries, ',
  appendix: '',
  displayOrder: 0,
  isPublished: true,
};

type FormState = typeof EMPTY_FORM & { id?: number };

export default function PublishedReportsClient({ userRoles }: Props) {
  const isSuperAdmin = userRoles?.includes('1');

  const [rows, setRows] = useState<PublishedReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/published-reports');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRows(data.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const decades = useMemo(() => groupByDecade(rows), [rows]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (row: PublishedReportRow) => {
    setEditingId(row.id);
    setForm({
      id: row.id,
      academicYear: row.academicYear,
      title: row.title,
      url: row.url ?? '',
      journal: row.journal ?? '',
      appendix: row.appendix ?? '',
      displayOrder: row.displayOrder,
      isPublished: row.isPublished,
    });
    // Scroll to form
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const url = editingId
        ? `/api/admin/published-reports/${editingId}`
        : '/api/admin/published-reports';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYear: Number(form.academicYear),
          title: form.title,
          url: form.url,
          journal: form.journal,
          appendix: form.appendix,
          displayOrder: Number(form.displayOrder),
          isPublished: form.isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setInfo(editingId ? 'Updated.' : 'Created.');
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (row: PublishedReportRow) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/published-reports/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !row.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const remove = async (row: PublishedReportRow) => {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/published-reports/${row.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setInfo('Deleted.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (!isSuperAdmin) {
    return (
      <Container className="py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900 mb-1">Access denied</h2>
            <p className="text-red-800">Super Admin access is required to manage published reports.</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-3">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to admin
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Manage Published PDFs</h1>
        <p className="text-gray-600 mt-2">
          Upload a PDF URL, set its publication year, and it will appear on the public{' '}
          <Link href="/statistics/pdf" className="text-blue-600 hover:underline">Statistics (PDFs)</Link> page.
          Decade groupings (<strong>2020 to Current</strong>, <strong>2010-2019</strong>, etc.) and per-decade counts
          are computed automatically.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {info && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{info}</p>
        </div>
      )}

      {/* Form */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {editingId ? <Edit3 className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-green-600" />}
            {editingId ? `Editing report #${editingId}` : 'Add a new published report'}
          </h2>
          {editingId && (
            <Button onClick={resetForm} className="bg-gray-500 hover:bg-gray-600">
              <X className="w-4 h-4 mr-1" /> Cancel edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic year (start year)
            </label>
            <input
              type="number"
              min={1900}
              max={2999}
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the start year only. The page label will render as{' '}
              <code className="bg-gray-100 px-1 rounded">{formatYearLabel(Number(form.academicYear) || 0)}</code>{' '}
              and the decade bucket is computed automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display order within year</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first. Default 0.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Council on East Asian Libraries Statistics 2023-2024: For North American Institutions."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL <span className="text-gray-400">(optional)</span></label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://scholarsarchive.byu.edu/jeal/vol2025/iss180/2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for historical years where the PDF is not yet available. The entry will show on the public page with a
              <span className="mx-1 inline-block text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-100 rounded px-1 py-0.5">PDF not available</span>
              badge until a URL is added.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Journal citation prefix (italic)</label>
            <input
              type="text"
              value={form.journal}
              onChange={(e) => setForm({ ...form, journal: e.target.value })}
              placeholder="Journal of East Asian Libraries, "
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank for non-JEAL items (e.g. instructions PDFs).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appendix (issue / page / article)</label>
            <input
              type="text"
              value={form.appendix}
              onChange={(e) => setForm({ ...form, appendix: e.target.value })}
              placeholder="2025: no. 180, Article 2."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Published — visible on the public Statistics page
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={submit} disabled={saving || !form.title} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {editingId ? 'Save changes' : 'Add report'}
          </Button>
          <Button onClick={refresh} className="bg-gray-500 hover:bg-gray-600">
            <RefreshCw className="w-4 h-4 mr-2" /> Reload list
          </Button>
        </div>
      </section>

      {/* Decade preview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Preview ({rows.length} total, {decades.length} decade{decades.length === 1 ? '' : 's'})
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : decades.length === 0 ? (
          <p className="text-gray-500 italic">No published reports yet.</p>
        ) : (
          decades.map((decade) => (
            <div key={decade.value} className="border border-gray-200 rounded-lg mb-4 px-4 py-3">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                <Calendar className="w-5 h-5 text-amber-600" />
                {decade.label}
              </div>

              {decade.yearLabels.map((yearLabel) => (
                <div key={yearLabel} className="border-l-2 border-amber-300 pl-4 mb-4">
                  <p className="font-semibold text-gray-800 mb-2">{yearLabel}</p>
                  <ul className="space-y-2">
                    {decade.rowsByYear[yearLabel].map((row) => (
                      <li
                        key={row.id}
                        className={`flex items-start justify-between gap-3 p-2 rounded ${row.isPublished ? '' : 'bg-gray-50 opacity-60'}`}
                      >
                        <div className="flex-1 text-sm">
                          {row.url ? (
                            <a
                              href={row.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {row.title}
                            </a>
                          ) : (
                            <span className="font-medium text-gray-800">{row.title}</span>
                          )}{' '}
                          {row.journal && <span className="italic text-gray-600">{row.journal}</span>}
                          {row.appendix && <span className="text-gray-500">{row.appendix}</span>}
                          {!row.url && (
                            <span className="ml-2 inline-block text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                              PDF not available
                            </span>
                          )}
                          <div className="text-xs text-gray-400 mt-0.5">
                            order {row.displayOrder} · id #{row.id}
                            {!row.isPublished && ' · hidden'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleVisibility(row)}
                            title={row.isPublished ? 'Hide from public page' : 'Publish on public page'}
                            className="p-1.5 rounded hover:bg-gray-100"
                          >
                            {row.isPublished
                              ? <Eye className="w-4 h-4 text-gray-600" />
                              : <EyeOff className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => startEdit(row)}
                            title="Edit"
                            className="p-1.5 rounded hover:bg-amber-100"
                          >
                            <Edit3 className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => remove(row)}
                            title="Delete"
                            className="p-1.5 rounded hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </Container>
  );
}
