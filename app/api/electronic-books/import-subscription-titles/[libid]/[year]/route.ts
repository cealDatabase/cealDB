import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // Query the subscription database to get e-book titles by language
    // This would aggregate from your e-book subscription database
    // Adjust the query based on your actual database structure
    
    // Example aggregation (adjust based on actual schema):
    // const subscriptionData = await prisma.eBook_Subscription.groupBy({
    //   by: ['language'],
    //   where: {
    //     libraryId: libraryId,
    //     year: year,
    //     type: 'subscription'
    //   },
    //   _count: {
    //     title: true
    //   }
    // });

    // For now, returning mock data structure
    // Replace with actual query logic
    const chinese = 0; // subscriptionData.find(d => d.language === 'chinese')?._count.title || 0
    const japanese = 0; // subscriptionData.find(d => d.language === 'japanese')?._count.title || 0
    const korean = 0; // subscriptionData.find(d => d.language === 'korean')?._count.title || 0
    const noncjk = 0; // subscriptionData.find(d => d.language === 'noncjk')?._count.title || 0

    return NextResponse.json({
      chinese,
      japanese,
      korean,
      noncjk,
      total: chinese + japanese + korean + noncjk,
      message: 'Subscription titles fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching subscription titles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription titles' },
      { status: 500 }
    );
  }
}
