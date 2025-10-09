/**
 * Auth helper for API routes
 * This provides the auth() function to get the current user session
 */
import { getContext } from 'hono/context-storage';
import { getToken } from '@auth/core/jwt';

/**
 * Get the current authenticated user session
 * @returns {Promise<{user: {id: string, email: string, name: string, image: string}, expires: string} | null>}
 */
export async function auth() {
  try {
    const c = getContext();
    const token = await getToken({
      req: c.req.raw,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https://') || false,
    });

    if (token) {
      return {
        user: {
          id: token.sub,
          email: token.email,
          name: token.name,
          image: token.picture,
        },
        expires: new Date(token.exp * 1000).toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
