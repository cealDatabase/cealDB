import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function verifySessionTokenEdge(token: string): Promise<{ username: string } | null> {
  try {
    const secret = process.env.AUTH_SECRET || 'fallback-secret-change-in-production';
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    
    const username = payload.username as string;
    if (username && typeof username === 'string') {
      return { username };
    }
    return null;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Define route types first
  const isProtectedRoute = nextUrl.pathname.startsWith('/admin') || 
                          nextUrl.pathname.startsWith('/create');
  const isAuthRoute = nextUrl.pathname.startsWith('/signin') || 
                     nextUrl.pathname.startsWith('/signup') || 
                     nextUrl.pathname.startsWith('/forgot') ||
                     nextUrl.pathname.startsWith('/confirmed');
  const isProtectedApiRoute = nextUrl.pathname.startsWith('/api/admin') ||
                             nextUrl.pathname.startsWith('/api/create') ||
                             nextUrl.pathname.startsWith('/api/update') ||
                             nextUrl.pathname.startsWith('/api/delete');

  // Get cookies
  const sessionCookie = req.cookies.get('session');
  const userCookie = req.cookies.get('uinf');
  
  // Only perform authentication check if we have both cookies
  let isLoggedIn = false;
  if (sessionCookie && userCookie) {
    try {
      // Wait for proper JWT verification
      const tokenData = await verifySessionTokenEdge(sessionCookie.value);
      
      // Thorough verification - both token must be valid AND usernames must match
      if (tokenData && tokenData.username && userCookie.value) {
        // Decode URL-encoded cookie value to handle @ symbols
        const decodedCookieValue = decodeURIComponent(userCookie.value).toLowerCase();
        isLoggedIn = tokenData.username.toLowerCase() === decodedCookieValue;
        
        if (isLoggedIn) {
          console.log(`✅ Verified user: ${userCookie.value}`);
        }
      }
    } catch (error) {
      // JWT verification failed
      isLoggedIn = false;
    }
  }

  // Handle protected routes - only redirect if clearly unauthenticated
  if (isProtectedRoute && !isLoggedIn) {
    // Only redirect if we're sure there's no valid authentication
    if (!sessionCookie || !userCookie) {
      console.log(`🚫 No auth cookies, redirecting to signin`);
      return NextResponse.redirect(new URL('/signin', nextUrl));
    }
    // If cookies exist but verification failed, still redirect but let them try again
    console.log(`🚫 Auth verification failed, redirecting to signin`);
    return NextResponse.redirect(new URL('/signin', nextUrl));
  }

  // Handle auth routes - only redirect away if definitively logged in
  if (isAuthRoute && isLoggedIn && sessionCookie && userCookie) {
    console.log(`🔄 Already authenticated, redirecting to admin`);
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }

  // Handle protected API routes
  if (!isLoggedIn && isProtectedApiRoute) {
    return NextResponse.json(
      { 
        success: false, 
        errorType: 'UNAUTHORIZED',
        message: 'Authentication required.',
        hint: 'Please sign in to access this resource.'
      }, 
      { status: 401 }
    );
  }

  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  // matcher: ["/admin/:path*", "/signup/:path*", "/confirmed/:path*"],
  // matcher: ["/admin/:path*", "/confirmed/:path*"],
  ]
};
