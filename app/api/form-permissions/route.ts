// app/api/form-permissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkFormEditPermission } from '@/lib/formPermissions';

/**
 * GET - Check if current user can edit forms for a specific year
 * Query params: year (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    if (!yearParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: year' },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam);
    if (isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    // Get user roles from cookies
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('role')?.value;
    
    let userRoles: string[] = [];
    if (roleCookie) {
      try {
        userRoles = JSON.parse(roleCookie);
      } catch {
        userRoles = [roleCookie];
      }
    }

    // If no roles, user is not authenticated
    if (userRoles.length === 0) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check permissions
    const permission = await checkFormEditPermission(year, userRoles);

    return NextResponse.json({
      success: true,
      ...permission,
      userRoles,
      year
    });

  } catch (error) {
    console.error('Error checking form permissions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check form permissions',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
