// app/api/admin/form-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET - Get current form status for a specific year
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Get total count of Library_Year records for this year
    const totalLibraries = await prisma.library_Year.count({
      where: { year }
    });

    // Get count of open libraries
    const openLibraries = await prisma.library_Year.count({
      where: { 
        year,
        is_open_for_editing: true
      }
    });

    // Get count of closed libraries
    const closedLibraries = await prisma.library_Year.count({
      where: { 
        year,
        is_open_for_editing: false
      }
    });

    // Get most recent update timestamp
    const recentUpdate = await prisma.library_Year.findFirst({
      where: { year },
      orderBy: { updated_at: 'desc' },
      select: { updated_at: true }
    });

    return NextResponse.json({
      year,
      totalLibraries,
      openLibraries,
      closedLibraries,
      lastUpdated: recentUpdate?.updated_at 
        ? new Date(recentUpdate.updated_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
          })
        : 'Never'
    });

  } catch (error) {
    console.error('Failed to fetch form status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
