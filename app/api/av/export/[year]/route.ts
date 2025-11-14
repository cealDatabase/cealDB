import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Fetch all AV counts for the specified year
    const listAVCountsByYear = await prisma.list_AV_Counts.findMany({
      where: {
        year: yearNum
      },
      orderBy: {
        listav: 'asc'
      }
    });

    const records: any[] = [];

    // Process each AV record
    for (const countRecord of listAVCountsByYear) {
      if (countRecord.listav === null) continue;

      const listAVId = countRecord.listav;
      
      // Get the main AV record
      const listAVItem = await prisma.list_AV.findUnique({
        where: { id: listAVId }
      });

      if (!listAVItem) continue;

      // Get languages for this AV
      const languageRecords = await prisma.list_AV_Language.findMany({
        where: { listav_id: listAVId },
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
        id: listAVId,
        counts: countRecord.titles ?? 0,
        cjk_title: listAVItem.cjk_title,
        title: listAVItem.title,
        romanized_title: listAVItem.romanized_title,
        subtitle: listAVItem.subtitle,
        language: languageArray,
        type: listAVItem.type,
        publisher: listAVItem.publisher,
        description: listAVItem.description,
        data_source: listAVItem.data_source,
        notes: listAVItem.notes
      });
    }

    // Convert to CSV format (excluding subscribers column for regular users)
    const headers = [
      'ID',
      'Counts',
      'CJK Title',
      'English Title',
      'Romanized Title',
      'Subtitle',
      'Language',
      'Type',
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
        escapeCSV(record.counts),
        escapeCSV(record.cjk_title),
        escapeCSV(record.title),
        escapeCSV(record.romanized_title),
        escapeCSV(record.subtitle),
        escapeCSV(formatArray(record.language)),
        escapeCSV(record.type),
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
        'Content-Disposition': `attachment; filename="AV_Database_${year}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting AV data:', error);
    return NextResponse.json(
      { error: 'Failed to export AV data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
