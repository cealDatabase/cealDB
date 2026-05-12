'use client';

import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar } from 'lucide-react';
import type { DecadeGroup } from '@/lib/publishedReports';

interface Props {
  decades: DecadeGroup[];
}

/**
 * Client wrapper for the decade-by-decade accordion on /statistics/pdf.
 * The Radix Accordion needs to live in a client component, but all data
 * fetching happens on the server in page.tsx.
 */
export default function PublishedPDFsAccordion({ decades }: Props) {
  if (decades.length === 0) {
    return (
      <p className="text-gray-500 italic">No published reports yet.</p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue={decades[0]?.value}>
      {decades.map((decade) => (
        <AccordionItem key={decade.value} value={decade.value} className="border rounded-lg mb-4 px-4">
          <AccordionTrigger className="text-lg font-bold hover:no-underline">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {decade.label}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-6 pt-4">
              {decade.yearLabels.map((yearLabel) => (
                <div key={yearLabel} className="border-l-2 border-gray-300 pl-4">
                  <p className="font-semibold text-lg text-gray-800 mb-2">{yearLabel}</p>
                  <ol className="space-y-2">
                    {decade.rowsByYear[yearLabel].map((row) => (
                      <li key={row.id} className="text-gray-700">
                        {row.url ? (
                          <Link
                            href={row.url}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {row.title}
                          </Link>
                        ) : (
                          <span className="text-gray-700">{row.title}</span>
                        )}{' '}
                        {row.journal && (
                          <span className="italic text-gray-600">{row.journal}</span>
                        )}
                        {row.appendix && (
                          <span className="text-gray-500">{row.appendix}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
