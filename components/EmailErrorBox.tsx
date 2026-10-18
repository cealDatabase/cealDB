'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { type EmailError, emailErrorHint, emailErrorReport } from '@/lib/emailError';

/**
 * Put the error details on the clipboard. Falls back to a hidden text area
 * where the clipboard API is not available (an older browser, or a page not
 * served over https).
 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * "Copy error details" button. When copying is not possible, the details are
 * shown so they can be selected by hand.
 */
export function CopyErrorButton({ error, forAdmin }: { error: EmailError; forAdmin: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const report = () =>
    emailErrorReport(error, { page: typeof window === 'undefined' ? undefined : window.location.href, forAdmin });

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={async (e) => {
          e.stopPropagation();
          setState((await copyText(report())) ? 'copied' : 'manual');
          setTimeout(() => setState((s) => (s === 'copied' ? 'idle' : s)), 2500);
        }}
        className="inline-flex w-fit items-center gap-1.5 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
      >
        {state === 'copied' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {state === 'copied' ? 'Copied' : 'Copy error details'}
      </button>
      {state === 'manual' && (
        <textarea
          readOnly
          rows={6}
          value={report()}
          onFocus={(e) => e.currentTarget.select()}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl rounded border border-gray-300 bg-white p-2 font-mono text-xs text-gray-800"
        />
      )}
    </span>
  );
}

/** The error code, and what it usually means for super admins. */
export function EmailErrorCode({ error, forAdmin }: { error: EmailError; forAdmin: boolean }) {
  return (
    <div className="space-y-1.5 text-sm">
      <p className="text-red-900">
        Error code: <span className="select-all font-mono font-semibold">{error.ref}</span>
        <span className="ml-2 font-mono text-xs text-red-700">
          {error.code}
          {error.status ? ` (${error.status})` : ''}
        </span>
      </p>
      {forAdmin && <p className="text-xs text-red-800">Usually means: {emailErrorHint(error.code)}</p>}
      <CopyErrorButton error={error} forAdmin={forAdmin} />
      <p className="text-xs text-gray-600">
        {forAdmin
          ? 'Send the copied details to whoever looks after the site. The same code is on the Email Send Status page.'
          : 'If you contact your CEAL administrator, include the copied details.'}
      </p>
    </div>
  );
}

/** A red box with a message and, when there is one, the copyable error code. */
export function EmailErrorBox({
  message,
  error,
  forAdmin,
}: {
  message: React.ReactNode;
  error?: EmailError | null;
  forAdmin: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="whitespace-pre-line text-red-800">{message}</div>
        {error && <EmailErrorCode error={error} forAdmin={forAdmin} />}
      </div>
    </div>
  );
}
