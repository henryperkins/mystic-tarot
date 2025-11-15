/**
 * User Registration API
 * POST /api/auth/register
 * 
 * Creates a new user account with email, username, and password
 */

import {
  hashPassword,
  generateId,
  createSession,
  isValidEmail,
  isValidUsername,
  validatePassword
} from '../../lib/auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validate input
    if (!email || !username || !password) {
      return new Response(
        JSON.stringify({ error: 'Email, username, and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUsername(username)) {
      return new Response(
        JSON.stringify({ error: 'Username must be 3-20 alphanumeric characters or underscores' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
      `SELECT id FROM users WHERE email = ? OR username = ?`
    ).bind(email, username).first();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email or username already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    const now = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
      `INSERT INTO users (id, email, username, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(userId, email, username, passwordHash, now, now).run();

    // Create session
    const { token, expiresAt } = await createSession(env.DB, userId);

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
        user: { id: userId, email, username },
        token,
        expiresAt
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
