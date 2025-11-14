# Deployment Status - Mystic Tarot

**Date:** 2025-11-14
**Status:** ✅ Partially Working - Functions deployed, Secrets configured, APIs need debugging

---

## ✅ What's Working

### 1. Functions Deployed Successfully
- ✅ Pages Functions are deployed and accessible
- ✅ `/api/tarot-reading` endpoint responds (HTTP 200, JSON)
- ✅ `/api/tts` endpoint responds (HTTP 200, JSON)
- ✅ Routes configuration working correctly (`_routes.json`)

### 2. Secrets Configured
- ✅ All 6 secrets set in both **production** and **preview** environments:
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_GPT5_MODEL`
  - `AZURE_OPENAI_TTS_ENDPOINT`
  - `AZURE_OPENAI_TTS_API_KEY`
  - `AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT`

### 3. Health Checks Pass
- ✅ GPT-5 health: `{"status":"ok","provider":"azure-gpt5"}`
- ✅ TTS health: `{"status":"ok","provider":"azure-openai"}`
- **This confirms secrets ARE accessible in the Functions**

---

## ⚠️ What Needs Fixing

### Issue 1: GPT-5 Falls Back to Local
**Observed Behavior:**
- Health check shows `"provider":"azure-gpt5"` ✅
- Actual reading generation returns `"provider":"local"` ❌
- Reading IS generated, but using local composer instead of Azure GPT-5

**Likely Cause:**
- Azure API call is failing silently
- Code catches error and falls back to local (functions/api/tarot-reading.js:114-119)
- Need to check actual error from Azure API

**Investigation Needed:**
```bash
# Check live logs during a reading generation:
wrangler pages deployment tail --project-name=mystic-tarot --environment=production

# Then make a POST request and watch for errors
```

### Issue 2: TTS Falls Back to Local Waveform
**Observed Behavior:**
- Health check shows `"provider":"azure-openai"` ✅
- Actual TTS request returns fallback WAV audio ❌
- Audio IS generated, but using local sine wave instead of Azure TTS

**Likely Cause:**
- Similar to GPT-5: Azure TTS API call failing
- Code catches error and falls back to `generateFallbackWaveform` (functions/api/tts.js:90-96)

**Investigation Needed:**
- Same as GPT-5 - check logs for actual API error

---

## 🔍 Debugging Steps

### Step 1: Monitor Live Logs

```bash
# In one terminal, tail logs:
wrangler pages deployment tail --project-name=mystic-tarot --environment=production --format=pretty

# In another terminal, make test requests:
curl -X POST https://master.mystic-tarot.pages.dev/api/tarot-reading \
  -H "Content-Type: application/json" \
  -d '{
    "spreadInfo": {"name": "One-Card Insight"},
    "cardsInfo": [{
      "position": "Card 1",
      "card": "The Fool",
      "orientation": "upright",
      "meaning": "New beginnings"
    }],
    "userQuestion": "Test"
  }'
```

### Step 2: Check Azure Portal

1. **Verify deployments exist:**
   - Azure Portal → Azure OpenAI → Your Resource → Deployments
   - Confirm `gpt-5` deployment exists
   - Confirm `gpt-audio-mini` deployment exists

2. **Verify API keys are valid:**
   - Regenerate if needed
   - Update secrets if regenerated

3. **Check quotas and rate limits:**
   - Azure Portal → Azure OpenAI → Quotas
   - Make sure you're not hitting limits

### Step 3: Test Endpoints Directly

**Test GPT-5 Responses API:**
```bash
curl -X POST https://thefoundry.openai.azure.com/openai/v1/responses?api-version=preview \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "instructions": "You are a helpful assistant",
    "input": "Hello, world!",
    "max_output_tokens": 100
  }'
```

**Test TTS API:**
```bash
curl -X POST https://hperk-mhsylcwu-centralus.openai.azure.com/openai/deployments/gpt-audio-mini/audio/speech?api-version=2025-04-01-preview \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Welcome to Mystic Tarot",
    "model": "gpt-audio-mini",
    "voice": "nova"
  }' \
  --output test.mp3
```

---

## 🛠️ Potential Fixes

### Fix 1: API Version Mismatch

The Responses API might need a different API version. Try:
- Current: `preview`
- Alternatives: `2024-12-01-preview`, `2024-10-01-preview`

Update in `wrangler.toml`:
```toml
[vars]
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"
```

### Fix 2: Endpoint Format

Double-check endpoint formats:
- GPT-5: `https://thefoundry.openai.azure.com` (no path!)
- TTS: `https://hperk-mhsylcwu-centralus.openai.azure.com` (no path!)

### Fix 3: Deployment Names

Verify deployment names match EXACTLY:
```bash
# In Azure Portal, check:
- GPT-5 deployment name (not model name)
- TTS deployment name (not model name)

# Update secrets if different:
wrangler pages secret put AZURE_OPENAI_GPT5_MODEL --project-name=mystic-tarot
wrangler pages secret put AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT --project-name=mystic-tarot
```

### Fix 4: CORS / Network Issues

If running from Cloudflare Workers, there might be network restrictions. Check:
- Azure Portal → Networking → Firewall
- Make sure Cloudflare IPs aren't blocked

---

## 📝 Current Deployment URLs

- **Production:** https://mystic-tarot.pages.dev
- **Master Branch:** https://master.mystic-tarot.pages.dev
- **Latest:** https://a8c50246.mystic-tarot.pages.dev

---

## 🎯 Next Steps

1. **Priority 1:** Check logs during actual API calls
   - Run `wrangler pages deployment tail` while making requests
   - Look for error messages from Azure APIs

2. **Priority 2:** Test Azure endpoints directly
   - Use curl to test GPT-5 Responses API
   - Use curl to test TTS API
   - Verify credentials and deployment names

3. **Priority 3:** Update based on findings
   - Fix API versions if needed
   - Fix deployment names if needed
   - Update error handling to log more details

---

## 🔐 Secrets Verification

To list all configured secrets:
```bash
# Production
wrangler pages secret list --project-name=mystic-tarot

# Preview
wrangler pages secret list --project-name=mystic-tarot --env=preview
```

To update a secret:
```bash
echo "new-value" | wrangler pages secret put SECRET_NAME --project-name=mystic-tarot
```

---

## 📊 Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Functions Deployment | ✅ Working | Both endpoints respond correctly |
| Secrets Configuration | ✅ Working | All 6 secrets accessible in env |
| Routes Optimization | ✅ Working | Only /api/* invokes Functions |
| GPT-5 API Integration | ⚠️ Fallback | Health check OK, actual calls fail |
| TTS API Integration | ⚠️ Fallback | Health check OK, actual calls fail |

**Overall Status:** Infrastructure is correct, API calls need debugging.

The good news: Everything is deployed correctly! The issue is likely a small configuration detail in the Azure API calls themselves (API version, deployment name, or endpoint format).
