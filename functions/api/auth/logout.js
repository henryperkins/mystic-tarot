/**
 * User Logout API
 * POST /api/auth/logout
 * 
 * Invalidates the user's session
 */

import {
  extractToken,
  deleteSession
} from '../../lib/auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const token = extractToken(request);

    if (token) {
      await deleteSession(env.DB, token);
    }

    // Clear cookie
    const cookieOptions = [
      'tarot_session=',
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0',
      'Secure'
    ].join('; ');

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
