import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { PrismaAdapter } from '@auth/prisma-adapter';
import db from '@/lib/db';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'Enter your email address'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Enter your password'
        },
      },
      async authorize(credentials) {
        // Auth.js authorize function is only used for token validation
        // All password verification is handled by the custom signin API route
        // This function will only validate existing sessions
        
        const parsedCredentials = z
          .object({ 
            email: z.string().email(), 
            password: z.string().min(1) 
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email } = parsedCredentials.data;

        try {
          // Only find user for session validation - no password verification
          const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              firstname: true,
              lastname: true,
              isactive: true,
            }
          });

          if (!user || !user.isactive) {
            return null;
          }

          // Return user object for Auth.js session
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || 
                  (user.firstname && user.lastname 
                    ? `${user.firstname} ${user.lastname}`.trim()
                    : user.firstname || user.lastname || user.email),
            image: null,
          };

        } catch (error) {
          console.error('Auth.js authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});
