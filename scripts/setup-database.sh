#!/bin/bash

# Database Setup Script for Mystic Tarot
# This script creates and initializes the D1 database for persistent journal storage

echo "Setting up Mystic Tarot D1 Database..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI not found. Please install it first:"
    echo "  npm install -g wrangler"
    exit 1
fi

# Create the D1 database
echo ""
echo "Step 1: Creating D1 database..."
echo "Run this command:"
echo "  wrangler d1 create mystic-tarot-db"
echo ""
echo "After running the command, copy the database_id from the output"
echo "and update it in wrangler.toml under [[d1_databases]] section."
echo ""
read -p "Press Enter after you've updated wrangler.toml..."

# Apply migrations
echo ""
echo "Step 2: Applying database migrations..."
echo "Run this command:"
echo "  wrangler d1 execute mystic-tarot-db --local --file=./migrations/0001_initial_schema.sql"
echo ""
echo "For production, run:"
echo "  wrangler d1 execute mystic-tarot-db --remote --file=./migrations/0001_initial_schema.sql"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Setup complete! Your database is ready."
echo ""
echo "Next steps:"
echo "1. Test locally with: npm run dev"
echo "2. Deploy to production with: npm run deploy"
echo ""
echo "Note: The app will work without authentication (using localStorage)"
echo "but users can sign in to sync their readings across devices."
