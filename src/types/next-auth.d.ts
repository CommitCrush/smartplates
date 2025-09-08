/**
 * NextAuth.js Type Extensions for SmartPlates
 * 
 * This file extends NextAuth types to include custom user properties.
 */

import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from '@/types/user';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      emailVerified: boolean;
    } & DefaultSession['user'];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    emailVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role: UserRole;
    emailVerified: boolean;
  }
}
