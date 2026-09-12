import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, requireRoles, canAccessLibrary } from '@/lib/auth';

// Roles allowed to view another institution via the institution switcher:
// 1 = Super Admin, 3 = E-Resource Editor, 4 = Assistant Admin.
// Members (role 2) stay scoped to their own library.
const SWITCHER_ROLES = [1, 3, 4];

export async function POST(request: NextRequest) {
  try {
    // This endpoint used to perform no checks at all: it wrote whatever library
    // id it was given into `observe_library`, for any caller, signed in or not.
    // The pages that read that cookie treat it as the effective institution, so
    // an unauthenticated request could point the session at any library.
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to switch institutions.' },
        { status: 401 }
      );
    }

    const { libraryId } = await request.json();

    if (!libraryId || isNaN(Number(libraryId))) {
      return NextResponse.json(
        { error: 'Invalid library ID' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Get user's home library
    const homeLibrary = cookieStore.get('library')?.value;

    // If switching to home library, clear observe_library
    if (homeLibrary && libraryId.toString() === homeLibrary) {
      cookieStore.delete('observe_library');
      console.log(`[switch-library] ✅ Returned to home library ID: ${libraryId}`);
    } else {
      // Viewing an institution that is not your own requires a cross-library
      // role, and the target must be one this account may act on.
      const allowed =
        (await requireRoles(...SWITCHER_ROLES)) &&
        (await canAccessLibrary(Number(libraryId)));

      if (!allowed) {
        console.warn(`[switch-library] ⛔ user ${userId} denied switch to library ${libraryId}`);
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You are not authorized to view data for this institution.',
          },
          { status: 403 }
        );
      }

      // Set observe_library for viewing other institution.
      // httpOnly: client components read this through the server actions in
      // lib/cookieActions.ts, never via document.cookie — so there is no reason
      // to leave it readable, or writable, from the browser.
      cookieStore.set('observe_library', libraryId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      console.log(`[switch-library] ✅ Set observe_library to: ${libraryId}`);
    }

    return NextResponse.json({
      success: true,
      libraryId: Number(libraryId)
    });

  } catch (error) {
    console.error('[switch-library] Error:', error);
    return NextResponse.json(
      { error: 'Failed to switch library' },
      { status: 500 }
    );
  }
}
