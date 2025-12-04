import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const prisma = db;

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Get all Library_Year records with dates, grouped by year
    const libraryYears = await prisma.library_Year.findMany({
      where: {
        OR: [
          { opening_date: { not: null } },
          { closing_date: { not: null } }
        ]
      },
      select: {
        id: true,
        year: true,
        opening_date: true,
        closing_date: true,
        is_open_for_editing: true,
        library: true,
        updated_at: true
      },
      orderBy: [
        { year: 'desc' },
        { opening_date: 'asc' }
      ]
    });

    // Group by year and calculate session status
    const sessionsByYear = new Map<number, {
      year: number;
      opening_date: Date | null;
      closing_date: Date | null;
      status: 'pending' | 'active' | 'closed' | 'scheduled';
      total_libraries: number;
      open_libraries: number;
      closed_libraries: number;
    }>();

    for (const ly of libraryYears) {
      if (!sessionsByYear.has(ly.year)) {
        sessionsByYear.set(ly.year, {
          year: ly.year,
          opening_date: ly.opening_date,
          closing_date: ly.closing_date,
          status: 'pending',
          total_libraries: 0,
          open_libraries: 0,
          closed_libraries: 0
        });
      }

      const session = sessionsByYear.get(ly.year)!;
      session.total_libraries++;
      
      if (ly.is_open_for_editing) {
        session.open_libraries++;
      } else {
        session.closed_libraries++;
      }
    }

    // Convert to array and determine status for each session
    const sessions = Array.from(sessionsByYear.values()).map(session => {
      const openingDate = session.opening_date ? new Date(session.opening_date) : null;
      const closingDate = session.closing_date ? new Date(session.closing_date) : null;

      let status: 'pending' | 'active' | 'closed' | 'scheduled' = 'pending';
      
      if (openingDate && closingDate) {
        if (now < openingDate) {
          status = 'scheduled'; // Opening in the future
        } else if (now >= openingDate && now <= closingDate) {
          status = 'active'; // Currently open
        } else {
          status = 'closed'; // Past closing date
        }
      }

      return {
        ...session,
        status,
        days_until_open: openingDate && now < openingDate 
          ? Math.ceil((openingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        days_until_close: closingDate && now < closingDate
          ? Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null
      };
    });

    // Filter for relevant sessions (scheduled, active, or recently closed)
    const recentClosedCutoff = new Date();
    recentClosedCutoff.setDate(recentClosedCutoff.getDate() - 30); // Show closed sessions from last 30 days

    const relevantSessions = sessions.filter(s => 
      s.status === 'scheduled' || 
      s.status === 'active' ||
      (s.status === 'closed' && s.closing_date && new Date(s.closing_date) >= recentClosedCutoff)
    );

    return NextResponse.json({
      success: true,
      sessions: relevantSessions,
      total: relevantSessions.length
    });

  } catch (error) {
    console.error('Failed to fetch pending sessions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch pending sessions',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );}
}
