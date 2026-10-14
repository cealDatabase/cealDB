"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Controls the shared DataTable hands to a catalogue toolbar, so the AV,
 * E-Book and E-Journal lists lay out the same controls in the same places.
 */
export interface CatalogueToolbarControls {
  /** List / table display switch. */
  viewToggle?: React.ReactNode;
  /** The "Bulk manage" button, or the bulk-manage bar while it is on. */
  bulk?: React.ReactNode;
  /** True while bulk manage is on: the bulk bar replaces the Admin strip. */
  bulkMode?: boolean;
}

const TONES = {
  access: {
    strip: "border-blue-200 bg-blue-50/70",
    label: "text-blue-800",
  },
  admin: {
    strip: "border-amber-200 bg-amber-50/70",
    label: "text-amber-900",
  },
} as const;

/**
 * One labelled row of related actions. Blue is the institution's own
 * holdings (My Access), amber is catalogue maintenance (Admin) - the same
 * colours as the two side columns of each entry in the list view.
 */
export function ZoneStrip({
  tone,
  label,
  status,
  children,
}: {
  tone: keyof typeof TONES;
  label: string;
  status?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md border px-3 py-1.5",
        t.strip
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className={cn("text-[11px] font-semibold uppercase tracking-wide", t.label)}>{label}</span>
        {status}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
