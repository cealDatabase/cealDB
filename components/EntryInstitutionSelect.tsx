"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntryInstitution } from "@/lib/myAccessInstitution";

/**
 * For the AV, E-Book and E-Journal create forms, when an admin unticks
 * "Global Resource": the institution the new entry belongs to. Required:
 * the server no longer picks one.
 */
export function EntryInstitutionSelect({
  institutions,
  value,
  onChange,
  year,
}: {
  institutions: EntryInstitution[];
  value: string;
  onChange: (value: string) => void;
  year: number;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="entry-institution" className="text-sm font-medium leading-none">
        Institution*
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="entry-institution" aria-label="Institution this entry belongs to">
          <SelectValue placeholder="Choose the institution this entry belongs to" />
        </SelectTrigger>
        <SelectContent>
          {institutions.map((institution) => (
            <SelectItem key={institution.id} value={String(institution.id)}>
              {institution.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Not shared: the entry belongs to this institution only, and is checked in its {year} My Access.
      </p>
    </div>
  );
}
