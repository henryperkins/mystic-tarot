# Mystic Tarot - Deployment Guide

Complete guide for configuring Cloudflare Pages Functions with proper bindings, routes, and environment variables.

## Table of Contents

1. [Overview](#overview)
2. [Routes Configuration](#routes-configuration)
3. [Local Development Setup](#local-development-setup)
4. [Production Secrets Setup](#production-secrets-setup)
5. [Deployment](#deployment)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses:
- **Cloudflare Pages** for hosting
- **Pages Functions** for serverless API routes (`/api/*`)
- **Azure OpenAI GPT-5** (via Responses API) for tarot reading generation
- **Azure OpenAI TTS** for text-to-speech (optional)

### Architecture

```
┌─────────────────────────────────────┐
│  Cloudflare Pages                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Static Assets (React SPA)     │ │
│  │ - HTML, CSS, JS               │ │
│  │ - Images, sounds              │ │
│  │ - Unlimited free requests     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Pages Functions               │ │
│  │ /api/tarot-reading.js         │ │
│  │ /api/tts.js                   │ │
│  │ - Only invoked for /api/*     │ │
│  │ - Uses Azure OpenAI via env   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Routes Configuration

### `public/_routes.json`

This file optimizes Functions invocation to **only `/api/*` routes**, keeping static asset requests free and fast.

**Why this matters:**
- ✅ Static assets (HTML, CSS, JS, images) are served without invoking Functions
- ✅ Unlimited free static requests
- ✅ Lower latency (no Function cold starts)
- ✅ Lower costs (Functions only charge for `/api/*` invocations)

**Current configuration:**

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": [
    "/assets/*",
    "/sounds/*",
    "/*.js",
    "/*.css",
    "/*.ico",
    "/*.png",
    "/*.jpg",
    "/*.svg",
    "/*.woff",
    "/*.woff2",
    "/*.ttf"
  ]
}
```

**How it works:**
- When Vite builds, this file is copied to `dist/_routes.json`
- Cloudflare Pages reads it during deployment
- Only requests matching `/api/*` invoke your Functions
- All other requests serve static assets directly

---

## Local Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create `.dev.vars` File

Copy the example and fill in your values:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your Azure OpenAI credentials:

```bash
# .dev.vars - DO NOT COMMIT THIS FILE!

# Azure OpenAI Configuration for GPT-5 (Responses API)
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE-NAME.openai.azure.com
AZURE_OPENAI_API_KEY=sk-your-azure-key-here
AZURE_OPENAI_GPT5_MODEL=gpt-5-mini

# Azure OpenAI TTS Configuration (optional)
AZURE_OPENAI_TTS_ENDPOINT=https://YOUR-RESOURCE-NAME.openai.azure.com
AZURE_OPENAI_TTS_API_KEY=sk-your-azure-key-here
AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT=tts-1-hd
```

### Step 3: Run Local Development

```bash
# Build the frontend
npm run build

# Start local development server
npm run dev
# or
npx wrangler pages dev dist
```

The dev server will:
- Serve your static assets from `dist/`
- Run Functions locally with secrets from `.dev.vars`
- Hot-reload on changes

**Test locally:**

```bash
# Health check
curl http://localhost:8788/api/tarot-reading

# Expected response:
# {"status":"ok","provider":"azure-gpt5","timestamp":"..."}
```

---

## Production Secrets Setup

**⚠️ NEVER commit secrets to Git!** Use Wrangler CLI to securely upload encrypted secrets.

### Option 1: Automated Setup (Recommended)

Run the interactive setup script:

```bash
./scripts/setup-secrets.sh
```

This script will:
1. Prompt for each secret value
2. Upload encrypted secrets to Cloudflare
3. Verify setup completion

### Option 2: Manual Setup

Set secrets individually using `wrangler pages secret put`:

```bash
# Set Azure OpenAI endpoint
echo "https://your-resource.openai.azure.com" | \
  wrangler pages secret put AZURE_OPENAI_ENDPOINT --project-name=mystic-tarot

# Set Azure OpenAI API key
echo "your-api-key" | \
  wrangler pages secret put AZURE_OPENAI_API_KEY --project-name=mystic-tarot

# Set GPT-5 model deployment name
echo "gpt-5-mini" | \
  wrangler pages secret put AZURE_OPENAI_GPT5_MODEL --project-name=mystic-tarot

# (Optional) TTS endpoint
echo "https://your-resource.openai.azure.com" | \
  wrangler pages secret put AZURE_OPENAI_TTS_ENDPOINT --project-name=mystic-tarot

# (Optional) TTS API key
echo "your-api-key" | \
  wrangler pages secret put AZURE_OPENAI_TTS_API_KEY --project-name=mystic-tarot

# (Optional) TTS deployment name
echo "tts-1-hd" | \
  wrangler pages secret put AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT --project-name=mystic-tarot
```

### Verify Secrets

List configured secrets (values are encrypted and cannot be viewed):

```bash
wrangler pages secret list --project-name=mystic-tarot
```

**Expected output:**

```
┌──────────────────────────────────────┐
│ Name                                 │
├──────────────────────────────────────┤
│ AZURE_OPENAI_API_KEY                 │
│ AZURE_OPENAI_ENDPOINT                │
│ AZURE_OPENAI_GPT5_MODEL              │
│ AZURE_OPENAI_TTS_API_KEY             │
│ AZURE_OPENAI_TTS_ENDPOINT            │
│ AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOY… │
└──────────────────────────────────────┘
```

### Delete a Secret (if needed)

```bash
wrangler pages secret delete AZURE_OPENAI_API_KEY --project-name=mystic-tarot
```

---

## Deployment

### Prerequisites

1. ✅ Wrangler installed: `npm install -g wrangler`
2. ✅ Authenticated: `wrangler login`
3. ✅ Secrets configured (see above)
4. ✅ Project built: `npm run build`

### Deploy to Cloudflare Pages

```bash
# Deploy via npm script
npm run deploy

# Or deploy directly with wrangler
wrangler pages deploy dist --project-name=mystic-tarot
```

**Deployment output:**

```
✨ Compiled Worker successfully
🌎 Uploading...
✨ Success! Uploaded 42 files (3.2 sec)

✨ Deployment complete!
🌍  https://mystic-tarot.pages.dev
🌍  https://abc123def.mystic-tarot.pages.dev
```

### Alternative: Git Integration (Auto-deploy)

Connect your GitHub/GitLab repository in Cloudflare dashboard:

1. Go to **Workers & Pages** → **mystic-tarot**
2. **Settings** → **Builds & deployments** → **Connect repository**
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Every `git push` to `main` triggers automatic deployment

---

## Verification

### 1. Health Check

```bash
curl https://mystic-tarot.pages.dev/api/tarot-reading
```

**Expected response:**

```json
{
  "status": "ok",
  "provider": "azure-gpt5",
  "timestamp": "2025-11-14T12:34:56.789Z"
}
```

### 2. Live Logs

Monitor real-time logs with `wrangler tail`:

```bash
wrangler pages deployment tail --project-name=mystic-tarot
```

Look for:
- ✅ `Azure OpenAI GPT-5 credentials found, attempting generation...`
- ✅ `Making Azure GPT-5 Responses API request to: https://...openai.azure.com/openai/v1/responses?api-version=preview`
- ✅ `Azure GPT-5 generation successful in XXXms`

### 3. Test Full Reading

```bash
curl -X POST https://mystic-tarot.pages.dev/api/tarot-reading \
  -H "Content-Type: application/json" \
  -d '{
    "spreadInfo": {"name": "One-Card Insight"},
    "cardsInfo": [{
      "position": "Card 1",
      "card": "The Fool",
      "orientation": "upright",
      "meaning": "New beginnings, innocence, spontaneity"
    }],
    "userQuestion": "What do I need to know today?"
  }'
```

**Expected response:**

```json
{
  "reading": "Focusing on the one-card insight...",
  "provider": "azure-gpt5",
  "themes": {...},
  "context": "self",
  "spreadAnalysis": {...}
}
```

---

## Troubleshooting

### Issue: "Empty response from Azure OpenAI GPT-5 Responses API"

**Cause:** Wrong API endpoint format or API version.

**Fix:**
- Ensure endpoint is: `https://YOUR-RESOURCE.openai.azure.com/openai/v1/responses?api-version=preview`
- Check `AZURE_OPENAI_API_VERSION` in `wrangler.toml` is set to `"preview"`
- Verify model deployment name matches Azure Portal exactly

### Issue: "Azure OpenAI GPT-5 credentials not configured"

**Cause:** Missing environment variables.

**Fix:**
- **Local:** Check `.dev.vars` exists and has all required variables
- **Production:** Run `wrangler pages secret list --project-name=mystic-tarot` to verify secrets

### Issue: Functions invoked on static asset requests

**Cause:** Missing or incorrect `_routes.json` configuration.

**Fix:**
- Verify `public/_routes.json` exists
- Check `dist/_routes.json` after build
- Ensure Vite copies it during build (it should automatically)

### Issue: "401 Unauthorized" from Azure OpenAI

**Cause:** Invalid or expired API key.

**Fix:**
- Regenerate API key in Azure Portal
- Update secret: `wrangler pages secret put AZURE_OPENAI_API_KEY --project-name=mystic-tarot`
- Redeploy: `npm run deploy`

### Issue: "404 Not Found" on `/api/*` routes

**Cause:** Functions not deployed or routing issue.

**Fix:**
- Verify `functions/api/` directory exists in your deployment
- Check deployment logs for errors
- Ensure `wrangler.toml` has correct `pages_build_output_dir = "dist"`

### Debug Mode

Enable verbose logging:

```bash
# Local development
WRANGLER_LOG=debug npx wrangler pages dev dist

# Deployment
WRANGLER_LOG=debug wrangler pages deploy dist --project-name=mystic-tarot
```

---

## Environment Variables Reference

### Required for GPT-5 (Responses API)

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `sk-...` |
| `AZURE_OPENAI_GPT5_MODEL` | GPT-5 deployment name | `gpt-5-mini`, `gpt-5-pro`, `gpt-5` |

### Optional (TTS)

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_TTS_ENDPOINT` | TTS resource endpoint (can be same) | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_TTS_API_KEY` | TTS API key (can be same) | `sk-...` |
| `AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT` | TTS deployment name | `tts-1-hd`, `gpt-4o-mini-tts` |

### Pre-configured in `wrangler.toml`

| Variable | Default | Description |
|----------|---------|-------------|
| `AZURE_OPENAI_API_VERSION` | `"preview"` | API version for Responses API (v1 format) |
| `AZURE_OPENAI_GPT_AUDIO_MINI_FORMAT` | `"mp3"` | TTS output format |

---

## Security Best Practices

1. ✅ **Never commit secrets to Git**
   - `.dev.vars` and `.env.local` are in `.gitignore`
   - Use Wrangler CLI for production secrets

2. ✅ **Rotate API keys regularly**
   - Azure Portal → Keys → Regenerate
   - Update secrets via Wrangler

3. ✅ **Use separate resources for dev/prod**
   - Different Azure OpenAI resources
   - Different API keys
   - Prevents prod impact during testing

4. ✅ **Monitor usage and costs**
   - Azure Portal → Cost Management
   - Cloudflare Dashboard → Analytics

---

## Additional Resources

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Azure OpenAI Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)
- [Azure OpenAI GPT-5 Models](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/models)

---

**Questions or issues?** Check [Troubleshooting](#troubleshooting) or open an issue on GitHub.
