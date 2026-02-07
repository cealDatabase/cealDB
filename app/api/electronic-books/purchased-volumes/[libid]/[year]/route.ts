import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ libid: string; year: string }> }
) {
  try {
    const resolvedParams = await params;
    const libraryId = parseInt(resolvedParams.libid);
    const year = parseInt(resolvedParams.year);

    if (isNaN(libraryId) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid library ID or year' },
        { status: 400 }
      );
    }

    // Find Library_Year record for the library and year
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: year,
      },
      select: { id: true }
    });

    if (!libraryYear) {
      return NextResponse.json(
        { total: 0, message: 'No library year record found' },
        { status: 200 }
      );
    }

    // Fetch Electronic Books data for this library and year
    // Include prev+add fields as fallback for records that haven't been re-submitted
    const electronicBooksData = await db.electronic_Books.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
      select: {
        ebooks_purchased_volumes_subtotal: true,
        ebooks_purchased_volumes_chinese: true,
        ebooks_purchased_volumes_japanese: true,
        ebooks_purchased_volumes_korean: true,
        ebooks_purchased_volumes_noncjk: true,
        ebooks_purchased_prev_volumes_chinese: true,
        ebooks_purchased_prev_volumes_japanese: true,
        ebooks_purchased_prev_volumes_korean: true,
        ebooks_purchased_prev_volumes_noncjk: true,
        ebooks_purchased_add_volumes_chinese: true,
        ebooks_purchased_add_volumes_japanese: true,
        ebooks_purchased_add_volumes_korean: true,
        ebooks_purchased_add_volumes_noncjk: true,
      }
    });

    if (!electronicBooksData) {
      return NextResponse.json({
        total: 0,
        chinese: 0,
        japanese: 0,
        korean: 0,
        noncjk: 0,
        message: 'No electronic books data found for this library and year'
      });
    }

    // Calculate per-language totals: use stored total fields, else compute from prev + add
    const chinese = electronicBooksData.ebooks_purchased_volumes_chinese ??
      ((electronicBooksData.ebooks_purchased_prev_volumes_chinese ?? 0) + (electronicBooksData.ebooks_purchased_add_volumes_chinese ?? 0));
    const japanese = electronicBooksData.ebooks_purchased_volumes_japanese ??
      ((electronicBooksData.ebooks_purchased_prev_volumes_japanese ?? 0) + (electronicBooksData.ebooks_purchased_add_volumes_japanese ?? 0));
    const korean = electronicBooksData.ebooks_purchased_volumes_korean ??
      ((electronicBooksData.ebooks_purchased_prev_volumes_korean ?? 0) + (electronicBooksData.ebooks_purchased_add_volumes_korean ?? 0));
    const noncjk = electronicBooksData.ebooks_purchased_volumes_noncjk ??
      ((electronicBooksData.ebooks_purchased_prev_volumes_noncjk ?? 0) + (electronicBooksData.ebooks_purchased_add_volumes_noncjk ?? 0));

    // Use stored subtotal if available, otherwise sum the per-language totals
    const total = electronicBooksData.ebooks_purchased_volumes_subtotal ?? (chinese + japanese + korean + noncjk);

    return NextResponse.json({
      total,
      chinese,
      japanese,
      korean,
      noncjk,
      message: 'Purchased volumes fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching purchased volumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchased volumes', total: 0 },
      { status: 500 }
    );
  }
}
