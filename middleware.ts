import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime compatible session verification using jose library
import { jwtVerify } from 'jose';

// Console logger for middleware debugging (Edge Runtime compatible)
function logMiddlewareDebug(step: string, data: any) {
  const timestamp = new Date().toISOString();
  console.log(`🔧 MIDDLEWARE_DEBUG [${timestamp}] ${step}:`, JSON.stringify(data));
}

async function verifySessionTokenEdge(token: string): Promise<{ username: string } | null> {
  try {
    const secret = process.env.AUTH_SECRET || 'fallback-secret-change-in-production';
    console.log(`🔑 Using AUTH_SECRET: ${secret ? '[SET]' : '[NOT SET]'}`);
    
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    
    console.log(`🎯 JWT payload:`, payload);
    
    // Check if payload has required fields
    if (payload.username && typeof payload.username === 'string') {
      return {
        username: payload.username as string
      };
    }
    
    console.log(`❌ Invalid payload structure`);
    return null;
  } catch (error) {
    console.error('🚨 Token verification error:', error);
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Enhanced cookie debugging for production environments
  const allCookies = req.cookies.getAll();
  const sessionCookie = req.cookies.get('session');
  const userCookie = req.cookies.get('uinf');
  
  const requestInfo = {
    path: nextUrl.pathname,
    hasSessionCookie: !!sessionCookie,
    hasUserCookie: !!userCookie,
    sessionValue: sessionCookie ? sessionCookie.value.substring(0, 20) + '...' : null,
    userValue: userCookie ? userCookie.value : null,
    totalCookies: allCookies.length,
    cookieNames: allCookies.map(c => c.name)
  };
  
  logMiddlewareDebug('REQUEST_START', requestInfo);
  
  console.log(`🔍 MIDDLEWARE: ${nextUrl.pathname}`);
  console.log(`🍪 Total cookies received: ${allCookies.length}`);
  console.log(`🍪 Cookie names: ${allCookies.map(c => c.name).join(', ')}`);
  console.log(`🍪 Session cookie exists: ${!!sessionCookie}`);
  console.log(`🍪 User cookie exists: ${!!userCookie}`);
  
  let isLoggedIn = false;
  
  if (sessionCookie && userCookie) {
    try {
      // Verify the session token using Edge Runtime compatible function
      const tokenData = await verifySessionTokenEdge(sessionCookie.value);
      isLoggedIn = !!tokenData && tokenData.username.toLowerCase() === userCookie.value;
      
      const authResult = {
        hasTokenData: !!tokenData,
        tokenUsername: tokenData?.username,
        cookieUsername: userCookie.value,
        usernamesMatch: tokenData?.username?.toLowerCase() === userCookie.value,
        finalIsLoggedIn: isLoggedIn
      };
      
      logMiddlewareDebug('AUTH_CHECK', authResult);
      
      console.log(`🔐 Token verification result: ${!!tokenData}`);
      console.log(`👤 Username match: ${tokenData?.username} === ${userCookie.value} = ${tokenData?.username?.toLowerCase() === userCookie.value}`);
      console.log(`✅ Is logged in: ${isLoggedIn}`);
    } catch (error) {
      // Invalid token, consider not logged in
      logMiddlewareDebug('AUTH_ERROR', { error: error instanceof Error ? error.message : String(error) });
      console.log(`❌ Token verification error:`, error);
      isLoggedIn = false;
    }
  } else {
    logMiddlewareDebug('NO_COOKIES', { sessionExists: !!sessionCookie, userExists: !!userCookie });
  }

  // Define protected routes
  const isProtectedRoute = nextUrl.pathname.startsWith('/admin') || 
                          nextUrl.pathname.startsWith('/create');

  // Define auth routes (login, signup, etc.)
  const isAuthRoute = nextUrl.pathname.startsWith('/signin') || 
                     nextUrl.pathname.startsWith('/signup') || 
                     nextUrl.pathname.startsWith('/forgot') ||
                     nextUrl.pathname.startsWith('/confirmed');

  // Define API routes that should be protected
  const isProtectedApiRoute = nextUrl.pathname.startsWith('/api/admin') ||
                             nextUrl.pathname.startsWith('/api/create') ||
                             nextUrl.pathname.startsWith('/api/update') ||
                             nextUrl.pathname.startsWith('/api/delete');

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    logMiddlewareDebug('REDIRECT_AUTH_TO_ADMIN', { from: nextUrl.pathname, to: '/admin' });
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }

  // Redirect unauthenticated users from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    logMiddlewareDebug('REDIRECT_UNAUTH_TO_SIGNIN', { from: nextUrl.pathname, to: '/signin' });
    return NextResponse.redirect(new URL('/signin', nextUrl));
  }

  // Log when allowing access
  logMiddlewareDebug('ALLOW_ACCESS', { 
    path: nextUrl.pathname, 
    isLoggedIn, 
    isProtectedRoute, 
    isAuthRoute 
  });

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
