# Authentication & Journal Persistence Setup

This document describes the new authentication and persistent journal features added to Mystic Tarot.

## Overview

The journal feature now supports:
- **User authentication** with email/username and password
- **Persistent storage** using Cloudflare D1 database
- **Cross-device sync** for authenticated users
- **Backward compatibility** with localStorage for unauthenticated users

## Architecture

### Backend (Cloudflare Pages Functions)

#### Authentication Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `GET /api/auth/me` - Get current user info

#### Journal Endpoints

- `GET /api/journal` - List all entries for authenticated user
- `POST /api/journal` - Create new journal entry
- `DELETE /api/journal/[id]` - Delete specific entry

### Frontend (React)

#### New Components

- `AuthContext` - Authentication state management
- `AuthModal` - Login/signup UI
- `useJournal` hook - Journal CRUD operations

#### Updated Components

- `Journal.jsx` - Now shows auth status and uses API
- `TarotReading.jsx` - Uses journal hook for saving

## Database Schema

### Users Table
```sql
- id (TEXT PRIMARY KEY)
- email (TEXT UNIQUE)
- username (TEXT UNIQUE)
- password_hash (TEXT)
- created_at (INTEGER)
- updated_at (INTEGER)
```

### Journal Entries Table
```sql
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- deck_mode (TEXT)
- deck_version (TEXT)
- timestamp (INTEGER)
- spread_name (TEXT)
- question (TEXT)
- cards (TEXT JSON)
- reflections (TEXT JSON)
- personal_reading (TEXT)
- themes (TEXT JSON)
- context (TEXT)
- created_at (INTEGER)
```

### Sessions Table
```sql
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- token (TEXT UNIQUE)
- expires_at (INTEGER)
- created_at (INTEGER)
```

## Setup Instructions

### 1. Create D1 Database

```bash
# Create the database
wrangler d1 create mystic-tarot-db

# Copy the database_id from output and update wrangler.toml
```

Update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "mystic-tarot-db"
database_id = "your-database-id-here"  # Replace with actual ID
```

### 2. Run Database Migrations

```bash
# For local development
wrangler d1 execute mystic-tarot-db --local --file=./migrations/0001_initial_schema.sql

# For production
wrangler d1 execute mystic-tarot-db --remote --file=./migrations/0001_initial_schema.sql
```

### 3. Test Locally

```bash
npm run dev
```

The app will work immediately with localStorage. To test authentication:
1. Click "Sign In to Save Across Devices" in the journal
2. Create an account
3. Save a reading
4. Verify it appears in the journal

### 4. Deploy to Production

```bash
npm run build
npm run deploy
```

## Security Features

- Passwords are hashed using SHA-256 (Note: Consider upgrading to bcrypt for production)
- Session tokens are secure random strings (32 bytes)
- Sessions expire after 30 days
- HTTP-only cookies prevent XSS attacks
- All auth endpoints validate input and prevent SQL injection

## User Experience

### For Unauthenticated Users
- Journal entries save to localStorage
- Limited to 100 entries
- Only accessible from the same browser/device
- No account required

### For Authenticated Users
- Journal entries save to D1 database
- Accessible from any device
- Persist across browser clears
- Can delete individual entries

### Migration Path
When a user signs in for the first time, their localStorage entries remain accessible. The app could be enhanced to migrate these entries to the database automatically.

## API Usage Examples

### Register a New User
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'mystictarot',
    password: 'securepassword123'
  })
});
```

### Save a Journal Entry
```javascript
const response = await fetch('/api/journal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    spread: 'Three-Card Story',
    question: 'What should I focus on today?',
    cards: [
      { position: 'Past', name: 'The Fool', number: 0, orientation: 'Upright' },
      { position: 'Present', name: 'The Magician', number: 1, orientation: 'Upright' },
      { position: 'Future', name: 'The High Priestess', number: 2, orientation: 'Reversed' }
    ],
    personalReading: 'Your reading narrative...',
    themes: { /* theme data */ },
    context: 'self'
  })
});
```

## Future Enhancements

Potential improvements for the future:
1. **Password reset** via email
2. **Social login** (Google, GitHub, etc.)
3. **Entry sharing** with unique URLs
4. **Export** journal as PDF or JSON
5. **Search and filter** entries by date, spread, or cards
6. **Tags** for organizing readings
7. **Migrate localStorage** entries automatically on sign-in
8. **Rate limiting** to prevent abuse
9. **Email notifications** for saved readings
10. **Stronger password hashing** (bcrypt or argon2)

## Troubleshooting

### Database Errors
If you see "DB is not defined" errors:
1. Verify wrangler.toml has the correct database_id
2. Run migrations as shown above
3. Restart your dev server

### Authentication Issues
If login doesn't work:
1. Check browser console for errors
2. Verify database tables exist
3. Clear cookies and try again

### LocalStorage Fallback
The app gracefully falls back to localStorage if:
- User is not authenticated
- Database is unavailable
- API requests fail

This ensures the app remains functional even if authentication/database has issues.

## Testing

To test the authentication flow:
1. Start dev server: `npm run dev`
2. Navigate to journal page
3. Click "Sign In to Save Across Devices"
4. Register a new account
5. Go back and save a reading
6. Verify it appears in the journal
7. Open in a new incognito window and sign in
8. Verify the reading is there

## Monitoring

Consider adding:
- Analytics for registration/login rates
- Error tracking for failed API calls
- Usage metrics for journal saves
- Performance monitoring for database queries
