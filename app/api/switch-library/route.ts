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
    
    // Update the library cookie
    cookieStore.set('library', libraryId.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`[switch-library] ✅ Switched to library ID: ${libraryId}`);

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
