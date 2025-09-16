import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime compatible session verification
async function verifySessionTokenEdge(token: string): Promise<{ username: string } | null> {
  try {
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      return null;
    }
    
    // Use Web Crypto API (Edge Runtime compatible)
    const secret = process.env.AUTH_SECRET || 'default-secret-key';
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // Decode the signature from base64url
    const expectedSignature = new Uint8Array(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    const isValid = await crypto.subtle.verify('HMAC', key, expectedSignature, data);
    
    if (!isValid) {
      return null;
    }
    
    // Decode payload
    const decodedPayload = JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map(char => char.charCodeAt(0))
        )
      )
    );
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      username: decodedPayload.username
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Check for authentication via session cookie
  const sessionCookie = req.cookies.get('session');
  const userCookie = req.cookies.get('uinf');
  
  let isLoggedIn = false;
  
  if (sessionCookie && userCookie) {
    try {
      // Verify the session token using Edge Runtime compatible function
      const tokenData = await verifySessionTokenEdge(sessionCookie.value);
      isLoggedIn = !!tokenData && tokenData.username === userCookie.value;
    } catch (error) {
      // Invalid token, consider not logged in
      isLoggedIn = false;
    }
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
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }

  // Redirect unauthenticated users from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', nextUrl));
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
  ],
};
