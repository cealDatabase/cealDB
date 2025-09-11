import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { 
      auth: any; 
      request: { nextUrl: URL } 
    }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCreate = nextUrl.pathname.startsWith('/create');
      const isOnAuth = nextUrl.pathname.startsWith('/auth') || 
                       nextUrl.pathname.startsWith('/signin') || 
                       nextUrl.pathname.startsWith('/signup');

      if (isOnAdmin || isOnCreate) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL('/admin', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
