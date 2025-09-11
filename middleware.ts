import { auth } from "@/auth";

export default auth((req) => {
  // req.auth contains the authenticated user information
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define protected routes
  const isProtectedRoute = nextUrl.pathname.startsWith('/admin') || 
                          nextUrl.pathname.startsWith('/create');

  // Define auth routes (login, signup, etc.)
  const isAuthRoute = nextUrl.pathname.startsWith('/signin') || 
                     nextUrl.pathname.startsWith('/signup') || 
                     nextUrl.pathname.startsWith('/forgot');

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL('/admin', nextUrl));
  }

  // Redirect unauthenticated users from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL('/signin', nextUrl));
  }

  // Allow access to all other routes
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
