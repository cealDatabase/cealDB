"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";

interface FallbackYearBannerProps {
  /** The survey year actually being displayed on the page. */
  year: number;
  /** Optional override for "now". Defaults to the current calendar year. */
  calendarYear?: number;
  className?: string;
}

/**
 * Yellow warning banner shown when the user is viewing a survey year that
 * is older than the current calendar year. Used by the 10 statistics forms
 * (via FormWrapper), the AV/EBook/EJournal survey pages, and the matching
 * access-management pages so the impersonation/year-fallback UI stays
 * consistent across the app. Includes a dismiss button so users can hide
 * it after they've acknowledged the message.
 */
export function FallbackYearBanner({
  year,
  calendarYear = new Date().getFullYear(),
  className = "",
}: FallbackYearBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (typeof year !== "number" || year >= calendarYear) return null;
  if (dismissed) return null;

  return (
    <Card className={`relative border-amber-300 bg-amber-50 ${className}`}>
      <CardContent>
        <div className="flex items-start gap-3 pr-8">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-amber-900 space-y-1">
            <p className="font-semibold">
              Viewing data for survey year {year}
            </p>
            <p className="text-sm">
              No record exists yet for {calendarYear}. The page is showing the
              most recent available year ({year}). Once the {calendarYear}{" "}
              survey is scheduled, this page will switch to {calendarYear}.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notice"
          className="absolute top-2 right-2 p-1 rounded-md text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}
