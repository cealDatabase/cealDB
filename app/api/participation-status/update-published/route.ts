import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

const prisma = db;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('uinf')?.value;
    const roleData = cookieStore.get('role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let isSuperAdmin = false;
    if (roleData) {
      try {
        const roles = JSON.parse(decodeURIComponent(roleData));
        isSuperAdmin = Array.isArray(roles) && roles.includes('1');
      } catch {
        isSuperAdmin = roleData === '1';
      }
    }

    if (!isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only Super Admins can update published status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    const updatePromises = updates.map(async ({ libraryYearId, published }) => {
      // Update the Entry_Status record associated with this Library_Year
      return prisma.entry_Status.update({
        where: { libraryyear: libraryYearId },
        data: { espublished: published }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updates.length} institution(s)`
    });

  } catch (error) {
    console.error('Error updating published status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update published status'
      },
      { status: 500 }
    );
  }
}
