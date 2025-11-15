/**
 * User Login API
 * POST /api/auth/login
 * 
 * Authenticates a user with email/username and password
 */

import {
  verifyPassword,
  createSession
} from '../../lib/auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be email or username

    // Validate input
    if (!identifier || !password) {
      return new Response(
        JSON.stringify({ error: 'Email/username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user by email or username
    const user = await env.DB.prepare(
      `SELECT id, email, username, password_hash FROM users WHERE email = ? OR username = ?`
    ).bind(identifier, identifier).first();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    const { token, expiresAt } = await createSession(env.DB, user.id);

    // Set cookie
    const cookieOptions = [
      `tarot_session=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${30 * 24 * 60 * 60}`, // 30 days
      'Secure'
    ].join('; ');

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user.id, email: user.email, username: user.username },
        token,
        expiresAt
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
