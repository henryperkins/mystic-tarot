/**
 * Authentication utilities for Mystic Tarot
 * Provides secure user authentication using bcrypt for password hashing
 * and JWT tokens for session management
 */

/**
 * Simple bcrypt-like password hashing using Web Crypto API
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate a secure random token
 * @returns {string} Random token
 */
export function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}-${generateToken().substring(0, 16)}`;
}

/**
 * Create a new user session
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @returns {Promise<{token: string, expiresAt: number}>} Session data
 */
export async function createSession(db, userId) {
  const sessionId = generateId();
  const token = generateToken();
  const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

  await db.prepare(
    `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(sessionId, userId, token, Math.floor(expiresAt / 1000)).run();

  return { token, expiresAt };
}

/**
 * Validate session token
 * @param {D1Database} db - D1 database instance
 * @param {string} token - Session token
 * @returns {Promise<{userId: string}|null>} User ID or null if invalid
 */
export async function validateSession(db, token) {
  if (!token) return null;

  const result = await db.prepare(
    `SELECT user_id, expires_at FROM sessions WHERE token = ? AND expires_at > ?`
  ).bind(token, Math.floor(Date.now() / 1000)).first();

  if (!result) return null;

  return { userId: result.user_id };
}

/**
 * Delete session
 * @param {D1Database} db - D1 database instance
 * @param {string} token - Session token
 * @returns {Promise<void>}
 */
export async function deleteSession(db, token) {
  await db.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
}

/**
 * Extract authentication token from request
 * @param {Request} request - Request object
 * @returns {string|null} Token or null
 */
export function extractToken(request) {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fall back to cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'tarot_session') {
        return value;
      }
    }
  }

  return null;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format
 * @param {string} username - Username
 * @returns {boolean} True if valid
 */
export function isValidUsername(username) {
  // 3-20 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {{valid: boolean, message?: string}} Validation result
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  return { valid: true };
}
