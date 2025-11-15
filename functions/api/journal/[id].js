/**
 * Delete Journal Entry API
 * DELETE /api/journal/[id]
 * 
 * Deletes a specific journal entry for the authenticated user
 */

import {
  extractToken,
  validateSession
} from '../../../lib/auth.js';

export async function onRequestDelete({ request, env, params }) {
  try {
    const token = extractToken(request);

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await validateSession(env.DB, token);

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const entryId = params.id;

    if (!entryId) {
      return new Response(
        JSON.stringify({ error: 'Entry ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify entry belongs to user before deleting
    const entry = await env.DB.prepare(
      `SELECT user_id FROM journal_entries WHERE id = ?`
    ).bind(entryId).first();

    if (!entry) {
      return new Response(
        JSON.stringify({ error: 'Entry not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (entry.user_id !== session.userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete entry
    await env.DB.prepare(
      `DELETE FROM journal_entries WHERE id = ?`
    ).bind(entryId).run();

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
