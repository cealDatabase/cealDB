import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const prisma = db;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await context.params;
    const yearNum = parseInt(year);

    if (isNaN(yearNum)) {
      return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
    }

    // Fetch all EJournal counts for the specified year
    const listEJournalCountsByYear = await prisma.list_EJournal_Counts.findMany({
      where: {
        year: yearNum
      },
      orderBy: {
        listejournal: 'asc'
      }
    });

    const records: any[] = [];

    // Process each EJournal record
    for (const countRecord of listEJournalCountsByYear) {
      if (countRecord.listejournal === null) continue;

      const listEJournalId = countRecord.listejournal;
      
      // Get the main EJournal record
      const listEJournalItem = await prisma.list_EJournal.findUnique({
        where: { id: listEJournalId }
      });

      if (!listEJournalItem) continue;

      // Get languages for this EJournal
      const languageRecords = await prisma.list_EJournal_Language.findMany({
        where: { listejournal_id: listEJournalId },
        select: { language_id: true }
      });

      const languages = await Promise.all(
        languageRecords.map(async (lr) => {
          if (lr.language_id) {
            const lang = await prisma.language.findUnique({
              where: { id: lr.language_id },
              select: { short: true }
            });
            return lang?.short || null;
          }
          return null;
        })
      );

      const languageArray = languages.filter(Boolean);

      records.push({
        id: listEJournalId,
        journals: countRecord.journals ?? 0,
        databases: countRecord.dbs ?? 0,
        cjk_title: listEJournalItem.cjk_title,
        title: listEJournalItem.title,
        romanized_title: listEJournalItem.romanized_title,
        subtitle: listEJournalItem.subtitle,
        language: languageArray,
        publisher: listEJournalItem.publisher,
        description: listEJournalItem.description,
        data_source: listEJournalItem.data_source,
        notes: listEJournalItem.notes
      });
    }

    // Convert to CSV format (excluding subscribers column for regular users)
    const headers = [
      'ID',
      'Journals',
      'Databases',
      'CJK Title',
      'English Title',
      'Romanized Title',
      'Subtitle',
      'Language',
      'Publisher',
      'Description',
      'Data Source',
      'Notes'
    ];

    // Helper function to escape CSV fields
    const escapeCSV = (field: any): string => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      // Escape double quotes and wrap in quotes if contains comma, newline, or quote
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper to format array fields
    const formatArray = (field: any): string => {
      if (Array.isArray(field)) {
        return field.join('; ');
      }
      return String(field || '');
    };

    const csvRows = [headers.join(',')];

    for (const record of records) {
      const row = [
        escapeCSV(record.id),
        escapeCSV(record.journals),
        escapeCSV(record.databases),
        escapeCSV(record.cjk_title),
        escapeCSV(record.title),
        escapeCSV(record.romanized_title),
        escapeCSV(record.subtitle),
        escapeCSV(formatArray(record.language)),
        escapeCSV(record.publisher),
        escapeCSV(record.description),
        escapeCSV(record.data_source),
        escapeCSV(record.notes)
      ];
      csvRows.push(row.join(','));
    }

    // Add UTF-8 BOM for proper Excel encoding of CJK characters
    const csvContent = '\uFEFF' + csvRows.join('\n');

    // Return CSV response with UTF-8 charset
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="EJournal_Database_${year}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting EJournal data:', error);
    return NextResponse.json(
      { error: 'Failed to export EJournal data' },
      { status: 500 }
    );}
}
