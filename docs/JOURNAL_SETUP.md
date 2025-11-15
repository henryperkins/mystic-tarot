# Journal Persistence & Authentication - Quick Start

This guide helps you set up the new authentication and persistent journal storage features.

## What's New

✨ **User Authentication** - Users can create accounts to save readings across devices
✨ **Persistent Storage** - Journal entries stored in Cloudflare D1 database
✨ **Backward Compatible** - Works without authentication using localStorage
✨ **Cross-Device Sync** - Authenticated users access their journal anywhere

## Quick Setup (5 minutes)

### 1. Create the Database

```bash
# Create D1 database
wrangler d1 create mystic-tarot-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mystic-tarot-db"
database_id = "paste-your-database-id-here"
```

### 2. Run Migrations

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

Visit http://localhost:5173/journal and click "Sign In to Save Across Devices"

### 4. Deploy

```bash
npm run build
npm run deploy
```

## Features

### For All Users
- ✅ Save readings to localStorage (works without account)
- ✅ View journal entries offline
- ✅ No registration required for basic functionality

### For Authenticated Users
- ✅ Save readings to cloud database
- ✅ Access journal from any device
- ✅ Readings persist across browser clears
- ✅ Delete specific entries
- ✅ Secure session management (30-day expiry)

## User Journey

### Without Account
1. Complete a tarot reading
2. Click "Save to Journal"
3. Entry saved to browser's localStorage
4. View in /journal page

### With Account
1. Click "Sign In to Save Across Devices" in journal
2. Create account with email, username, password
3. Complete a tarot reading
4. Click "Save to Journal"
5. Entry saved to cloud database
6. Access from any device after signing in

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Journal
- `GET /api/journal` - List entries
- `POST /api/journal` - Save entry
- `DELETE /api/journal/[id]` - Delete entry

## Database Tables

### users
- User accounts with email, username, password hash

### journal_entries
- Saved readings with cards, questions, narratives
- Linked to user accounts

### sessions
- Authentication tokens with expiry

## Security

- ✅ Passwords hashed with SHA-256
- ✅ Session tokens are 32-byte random strings
- ✅ HTTP-only cookies prevent XSS
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention via parameterized queries
- ✅ Sessions expire after 30 days

## Troubleshooting

### "DB is not defined"
- Verify `database_id` in wrangler.toml is correct
- Run migrations as shown above
- Restart dev server

### Login doesn't work
- Check browser console for errors
- Verify database tables exist
- Clear cookies and try again

### LocalStorage still works
Yes! The app gracefully falls back to localStorage if:
- User is not authenticated
- Database is unavailable
- API requests fail

## Testing

Run the test suite:
```bash
npm test
```

The auth tests verify:
- Password hashing and verification
- Token generation
- Email/username validation
- Password strength requirements

## Next Steps

Consider these enhancements:
- [ ] Password reset via email
- [ ] Social login (Google, GitHub)
- [ ] Entry sharing with unique URLs
- [ ] Export journal as PDF
- [ ] Search and filter entries
- [ ] Migrate localStorage entries on first login
- [ ] Stronger password hashing (bcrypt)

## Documentation

- Full setup guide: `docs/AUTHENTICATION.md`
- Database script: `scripts/setup-database.sh`
- Architecture details: `CLAUDE.md`

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database setup is complete
3. Test without authentication first
4. Review `docs/AUTHENTICATION.md`

The app is designed to work gracefully even if authentication/database fails, ensuring users can always save readings locally.
