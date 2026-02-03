import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    const username = cookieStore.get('uinf')?.value;
    
    if (!sessionToken || !username) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'Missing authentication cookies' 
      }, { status: 401 });
    }

    // Get user from database with roles and library
    const user = await db.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      include: {
        User_Roles: {
          include: {
            Role: true
          }
        },
        User_Library: {
          include: {
            Library: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'User not found' 
      }, { status: 401 });
    }

    // Get expected values from database
    const expectedRoleIds = user.User_Roles?.map(ur => ur.Role.id.toString()) || [];
    const expectedLibraryId = user.User_Library?.[0]?.Library?.id?.toString() || '';

    // Get actual values from cookies (client-readable)
    const roleCookie = request.cookies.get('role')?.value;
    const libraryCookie = request.cookies.get('library')?.value;

    // Parse role cookie
    let actualRoleIds: string[] = [];
    if (roleCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(roleCookie));
        actualRoleIds = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        actualRoleIds = [roleCookie];
      }
    }

    // Validate roles match
    const rolesMatch = expectedRoleIds.length === actualRoleIds.length &&
      expectedRoleIds.every(role => actualRoleIds.includes(role));

    // Validate home library matches
    const libraryMatch = expectedLibraryId === libraryCookie;

    if (!rolesMatch) {
      console.error('[validate-session] ⚠️ Role mismatch detected!');
      console.error('[validate-session] Expected roles:', expectedRoleIds);
      console.error('[validate-session] Actual roles:', actualRoleIds);
      
      return NextResponse.json({ 
        valid: false, 
        reason: 'Role validation failed - possible cookie tampering',
        tampered: true
      }, { status: 403 });
    }

    if (!libraryMatch) {
      console.error('[validate-session] ⚠️ Library mismatch detected!');
      console.error('[validate-session] Expected library:', expectedLibraryId);
      console.error('[validate-session] Actual library:', libraryCookie);
      
      return NextResponse.json({ 
        valid: false, 
        reason: 'Library validation failed - possible cookie tampering',
        tampered: true
      }, { status: 403 });
    }

    return NextResponse.json({ 
      valid: true,
      roles: expectedRoleIds,
      homeLibrary: expectedLibraryId,
      username: user.username
    });

  } catch (error) {
    console.error('[validate-session] Error:', error);
    return NextResponse.json({ 
      valid: false, 
      reason: 'Validation error' 
    }, { status: 500 });
  }
}
