/**
 * NextAuth.js API Route Handler
 * 
 * This handles all authentication requests for Google OAuth.
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
