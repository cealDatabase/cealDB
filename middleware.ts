import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyJWTToken(token: string): Promise<{ username: string } | null> {
  try {
    const secret = process.env.AUTH_SECRET || 'fallback-secret-change-in-production';
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    
    const username = payload.username as string;
    if (username && typeof username === 'string') {
      return { username };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || 
                          request.nextUrl.pathname.startsWith('/create');
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/signin') || 
                     request.nextUrl.pathname.startsWith('/signup') || 
                     request.nextUrl.pathname.startsWith('/forgot') ||
                     request.nextUrl.pathname.startsWith('/confirmed');

  const isProtectedApiRoute = request.nextUrl.pathname.startsWith('/api/admin') ||
                             request.nextUrl.pathname.startsWith('/api/create') ||
                             request.nextUrl.pathname.startsWith('/api/update') ||
                             request.nextUrl.pathname.startsWith('/api/delete');

  // Get cookies using official Next.js middleware API
  const sessionCookie = request.cookies.get('session');
  const userCookie = request.cookies.get('uinf');
  
  console.log(`🔍 MIDDLEWARE: ${request.nextUrl.pathname}`);
  console.log(`🍪 Session: ${!!sessionCookie}, User: ${!!userCookie}`);
  
  // Check authentication
  let isAuthenticated = false;
  
  if (sessionCookie && userCookie) {
    try {
      const tokenData = await verifyJWTToken(sessionCookie.value);
      
      if (tokenData && tokenData.username) {
        // Handle URL-encoded cookie values
        const decodedUserCookie = decodeURIComponent(userCookie.value).toLowerCase();
        const tokenUsername = tokenData.username.toLowerCase();
        
        isAuthenticated = tokenUsername === decodedUserCookie;
        
        if (isAuthenticated) {
          console.log(`✅ Authenticated: ${decodedUserCookie}`);
        }
      }
    } catch (error) {
      isAuthenticated = false;
    }
  }

  // Redirect logic using official Next.js patterns
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`🚫 Redirecting unauthenticated user to signin`);
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    console.log(`🔄 Redirecting authenticated user to admin`);
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Handle protected API routes
  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unauthorized',
        message: 'Authentication required'
      }, 
      { status: 401 }
    );
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/create/:path*',
    // Auth routes  
    '/signin',
    '/signup',
    '/forgot',
    '/confirmed',
    // Protected API routes
    '/api/admin/:path*',
    '/api/create/:path*',
    '/api/update/:path*',
    '/api/delete/:path*',
  ]
};
