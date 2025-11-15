/**
 * Journal API
 * Handles CRUD operations for journal entries
 * 
 * GET /api/journal - List all entries for authenticated user
 * POST /api/journal - Create a new journal entry
 */

import {
  extractToken,
  validateSession,
  generateId
} from '../../lib/auth.js';

/**
 * GET - List journal entries for authenticated user
 */
export async function onRequestGet({ request, env }) {
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

    // Get journal entries
    const entries = await env.DB.prepare(
      `SELECT 
        id, deck_mode, deck_version, timestamp, spread_name, question, 
        cards, reflections, personal_reading, themes, context, created_at
       FROM journal_entries 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 100`
    ).bind(session.userId).all();

    // Parse JSON fields
    const parsedEntries = entries.results.map(entry => ({
      ...entry,
      cards: JSON.parse(entry.cards || '[]'),
      reflections: entry.reflections ? JSON.parse(entry.reflections) : null,
      themes: entry.themes ? JSON.parse(entry.themes) : null,
      ts: new Date(entry.timestamp * 1000).toISOString(),
      spread: entry.spread_name
    }));

    return new Response(
      JSON.stringify({ entries: parsedEntries }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Get journal entries error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST - Create a new journal entry
 */
export async function onRequestPost({ request, env }) {
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

    const body = await request.json();
    const {
      deckMode,
      deckVersion,
      spread,
      question,
      cards,
      reflections,
      personalReading,
      themes,
      context
    } = body;

    // Validate required fields
    if (!spread || !cards || !Array.isArray(cards)) {
      return new Response(
        JSON.stringify({ error: 'Spread and cards are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create entry
    const entryId = generateId();
    const timestamp = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
      `INSERT INTO journal_entries 
       (id, user_id, deck_mode, deck_version, timestamp, spread_name, question, 
        cards, reflections, personal_reading, themes, context) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      entryId,
      session.userId,
      deckMode || 'majors',
      deckVersion || '1.0.0',
      timestamp,
      spread,
      question || '',
      JSON.stringify(cards),
      reflections ? JSON.stringify(reflections) : null,
      personalReading || null,
      themes ? JSON.stringify(themes) : null,
      context || null
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        entry: {
          id: entryId,
          timestamp,
          spread,
          question,
          cards
        }
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Create journal entry error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
