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

    // Fetch all EBook counts for the specified year
    const listEBookCountsByYear = await prisma.list_EBook_Counts.findMany({
      where: {
        year: yearNum
      },
      orderBy: {
        listebook: 'asc'
      }
    });

    const records: any[] = [];

    // Process each EBook record
    for (const countRecord of listEBookCountsByYear) {
      if (countRecord.listebook === null) continue;

      const listEBookId = countRecord.listebook;
      
      // Get the main EBook record
      const listEBookItem = await prisma.list_EBook.findUnique({
        where: { id: listEBookId }
      });

      if (!listEBookItem) continue;

      // Get languages for this EBook
      const languageRecords = await prisma.list_EBook_Language.findMany({
        where: { listebook_id: listEBookId },
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
        id: listEBookId,
        titles: countRecord.titles ?? 0,
        volumes: countRecord.volumes ?? 0,
        cjk_title: listEBookItem.cjk_title,
        title: listEBookItem.title,
        romanized_title: listEBookItem.romanized_title,
        subtitle: listEBookItem.subtitle,
        language: languageArray,
        publisher: listEBookItem.publisher,
        description: listEBookItem.description,
        data_source: listEBookItem.data_source,
        notes: listEBookItem.notes
      });
    }

    // Convert to CSV format (excluding subscribers column for regular users)
    const headers = [
      'ID',
      'Titles',
      'Volumes',
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
        escapeCSV(record.titles),
        escapeCSV(record.volumes),
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
        'Content-Disposition': `attachment; filename="EBook_Database_${year}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting EBook data:', error);
    return NextResponse.json(
      { error: 'Failed to export EBook data' },
      { status: 500 }
    );}
}
