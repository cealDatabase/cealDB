// app/api/admin/survey-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { logUserAction } from '@/lib/auditLogger';

const prisma = new PrismaClient();

/**
 * Get user info from cookies (server-side)
 */
async function getUserFromCookies() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role')?.value;
  
  if (!roleCookie) {
    return null;
  }

  try {
    let userRoles: string[] = [];
    try {
      userRoles = JSON.parse(roleCookie);
    } catch {
      userRoles = [roleCookie];
    }

    return {
      userRoles
    };
  } catch {
    return null;
  }
}

/**
 * GET - Retrieve all survey sessions or a specific one
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('year');

    if (academicYear) {
      // Get specific session by year
      const session = await prisma.surveySession.findUnique({
        where: {
          academicYear: parseInt(academicYear)
        }
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(session);
    }

    // Get all sessions, ordered by year descending
    const sessions = await prisma.surveySession.findMany({
      orderBy: {
        academicYear: 'desc'
      }
    });

    return NextResponse.json(sessions);

  } catch (error) {
    console.error('Failed to fetch survey sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey sessions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST - Create a new survey session schedule
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromCookies();
    if (!user || !user.userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { academicYear, openingDate, closingDate } = body;

    // Validate required fields
    if (!academicYear || !openingDate || !closingDate) {
      return NextResponse.json(
        { error: 'Missing required fields: academicYear, openingDate, closingDate' },
        { status: 400 }
      );
    }

    // Validate that closing date is after opening date
    const openDate = new Date(openingDate);
    const closeDate = new Date(closingDate);
    
    if (closeDate <= openDate) {
      return NextResponse.json(
        { error: 'Closing date must be after opening date' },
        { status: 400 }
      );
    }

    // Check if session already exists for this year
    const existingSession = await prisma.surveySession.findUnique({
      where: { academicYear: parseInt(academicYear) }
    });

    if (existingSession) {
      return NextResponse.json(
        { error: `A session schedule already exists for year ${academicYear}` },
        { status: 409 }
      );
    }

    // Create the session
    const session = await prisma.surveySession.create({
      data: {
        academicYear: parseInt(academicYear),
        openingDate: openDate,
        closingDate: closeDate,
        isOpen: false,
        notifiedOnOpen: false,
        notifiedOnClose: false
      }
    });

    // Log the action
    await logUserAction(
      'CREATE',
      'SurveySession',
      session.id.toString(),
      null,
      {
        academicYear: session.academicYear,
        openingDate: session.openingDate.toISOString(),
        closingDate: session.closingDate.toISOString()
      },
      true,
      undefined,
      request
    );

    console.log(`✅ Created survey session for year ${academicYear}`);

    return NextResponse.json({
      success: true,
      session,
      message: `Survey session created for year ${academicYear}. Forms will automatically open and close on the scheduled dates.`
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create survey session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create survey session',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT - Update an existing survey session
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromCookies();
    if (!user || !user.userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { academicYear, openingDate, closingDate } = body;

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Missing required field: academicYear' },
        { status: 400 }
      );
    }

    // Get existing session
    const existingSession = await prisma.surveySession.findUnique({
      where: { academicYear: parseInt(academicYear) }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: `Session not found for year ${academicYear}` },
        { status: 404 }
      );
    }

    // Validate dates if provided
    if (openingDate && closingDate) {
      const openDate = new Date(openingDate);
      const closeDate = new Date(closingDate);
      
      if (closeDate <= openDate) {
        return NextResponse.json(
          { error: 'Closing date must be after opening date' },
          { status: 400 }
        );
      }
    }

    // Update the session
    const updateData: any = {};
    if (openingDate) updateData.openingDate = new Date(openingDate);
    if (closingDate) updateData.closingDate = new Date(closingDate);

    const updatedSession = await prisma.surveySession.update({
      where: { academicYear: parseInt(academicYear) },
      data: updateData
    });

    // Log the action
    await logUserAction(
      'UPDATE',
      'SurveySession',
      updatedSession.id.toString(),
      existingSession,
      updatedSession,
      true,
      undefined,
      request
    );

    console.log(`✅ Updated survey session for year ${academicYear}`);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: `Survey session updated for year ${academicYear}`
    });

  } catch (error) {
    console.error('Failed to update survey session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update survey session',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE - Remove a survey session
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromCookies();
    if (!user || !user.userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('year');

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Missing required parameter: year' },
        { status: 400 }
      );
    }

    // Get existing session for logging
    const existingSession = await prisma.surveySession.findUnique({
      where: { academicYear: parseInt(academicYear) }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: `Session not found for year ${academicYear}` },
        { status: 404 }
      );
    }

    // Delete the session
    await prisma.surveySession.delete({
      where: { academicYear: parseInt(academicYear) }
    });

    // Log the action
    await logUserAction(
      'DELETE',
      'SurveySession',
      existingSession.id.toString(),
      existingSession,
      null,
      true,
      undefined,
      request
    );

    console.log(`✅ Deleted survey session for year ${academicYear}`);

    return NextResponse.json({
      success: true,
      message: `Survey session deleted for year ${academicYear}`
    });

  } catch (error) {
    console.error('Failed to delete survey session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete survey session',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
