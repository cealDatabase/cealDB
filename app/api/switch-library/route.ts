import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
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
      // Set observe_library for viewing other institution
      cookieStore.set('observe_library', libraryId.toString(), {
        httpOnly: false,
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
