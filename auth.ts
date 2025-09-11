import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { verifyPassword } from '@/lib/password';
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
        // Parse and validate credentials
        const parsedCredentials = z
          .object({ 
            email: z.string().email(), 
            password: z.string().min(1) 
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('❌ Invalid credentials format');
          return null;
        }

        const { email, password } = parsedCredentials.data;

        console.log(`🔐 Auth.js login attempt for: ${email}`);

        try {
          // Find user by email
          const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              password_hash: true,
              name: true,
              firstname: true,
              lastname: true,
              isactive: true,
              requires_password_reset: true,
              email_verified: true
            }
          });

          if (!user) {
            console.log(`❌ User not found: ${email}`);
            return null;
          }

          if (!user.isactive) {
            console.log(`❌ Inactive account: ${email}`);
            return null;
          }

          // Check if user needs password reset
          if (!user.password_hash || user.requires_password_reset) {
            console.log(`🔄 Password reset required for: ${email}`);
            // For Auth.js, we can't handle password reset flow here
            // This will be handled by a custom signin page
            return null;
          }

          // Verify password
          const passwordMatches = await verifyPassword(password, user.password_hash);

          if (!passwordMatches) {
            console.log(`❌ Invalid password for: ${email}`);
            return null;
          }

          // Update last login
          await db.user.update({
            where: { id: user.id },
            data: { lastlogin_at: new Date() }
          });

          console.log(`✅ Successful Auth.js login: ${email}`);

          // Return user object for Auth.js
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
