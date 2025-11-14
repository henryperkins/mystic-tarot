# ✅ Setup Complete - Your Azure OpenAI Credentials Are Configured!

Your Mystic Tarot project is now configured with your specific Azure OpenAI credentials.

---

## 📋 What Was Configured

### GPT-5 (Responses API) - For Tarot Readings
- **Endpoint:** Your Azure OpenAI endpoint (e.g., `https://your-resource.openai.azure.com`)
- **Deployment:** Your GPT-5 deployment name (e.g., `gpt-5`)
- **API Key:** ✅ Configured via `.dev.vars` and Cloudflare secrets

### Audio TTS - For Voice Narration
- **Endpoint:** Your Azure TTS endpoint (e.g., `https://your-tts-resource.openai.azure.com`)
- **Deployment:** Your TTS deployment name (e.g., `gpt-audio-mini`)
- **API Key:** ✅ Configured via `.dev.vars` and Cloudflare secrets

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Test Local Development

Your `.dev.vars` file is already configured! Just run:

```bash
npm run dev
```

Open browser to: http://localhost:8788

Test API:
```bash
curl http://localhost:8788/api/tarot-reading
```

**Expected response:**
```json
{
  "status": "ok",
  "provider": "azure-gpt5",
  "timestamp": "2025-11-14T..."
}
```

---

### 2️⃣ Deploy to Production

Upload your secrets to Cloudflare Pages (one-time setup):

```bash
# Make sure wrangler is authenticated
wrangler login

# Run the automated setup script
./scripts/setup-my-secrets.sh
```

This script will:
- ✅ Upload all 6 secrets to Cloudflare (encrypted)
- ✅ Verify they were set correctly
- ✅ Show you the list of configured secrets

**Alternative - Manual setup:**
```bash
# If you prefer to do it manually, run each command:
echo "YOUR_AZURE_ENDPOINT" | \
  wrangler pages secret put AZURE_OPENAI_ENDPOINT --project-name=mystic-tarot

echo "YOUR_AZURE_API_KEY" | \
  wrangler pages secret put AZURE_OPENAI_API_KEY --project-name=mystic-tarot

echo "YOUR_DEPLOYMENT_NAME" | \
  wrangler pages secret put AZURE_OPENAI_GPT5_MODEL --project-name=mystic-tarot

# (Continue for TTS secrets... see scripts/setup-my-secrets.sh for full example)
```

---

### 3️⃣ Deploy Your App

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

**Expected output:**
```
✨ Compiled Worker successfully
🌎 Uploading...
✨ Success! Uploaded X files

✨ Deployment complete!
🌍  https://mystic-tarot.pages.dev
```

---

## ✅ Verification Checklist

### Local Development
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:8788
- [ ] Test API: `curl http://localhost:8788/api/tarot-reading`
- [ ] Should see: `"provider": "azure-gpt5"`

### Production Deployment
- [ ] Run `wrangler login` (authenticate)
- [ ] Run `./scripts/setup-my-secrets.sh` (upload secrets)
- [ ] Verify: `wrangler pages secret list --project-name=mystic-tarot`
- [ ] Deploy: `npm run deploy`
- [ ] Test live: `curl https://mystic-tarot.pages.dev/api/tarot-reading`

### Monitor Logs
```bash
# Watch live logs to see GPT-5 working
wrangler pages deployment tail --project-name=mystic-tarot
```

Look for these log messages:
- ✅ `Azure OpenAI GPT-5 credentials found, attempting generation...`
- ✅ `Making Azure GPT-5 Responses API request to: https://thefoundry.openai.azure.com/openai/v1/responses`
- ✅ `Azure GPT-5 generation successful in XXXms`

---

## 🔒 Security Notes

### ✅ Good - Your Secrets Are Protected

1. **`.dev.vars` is in `.gitignore`**
   - Your local credentials won't be committed to Git
   - Safe to use on your development machine

2. **Production secrets use Wrangler CLI**
   - Encrypted at rest in Cloudflare
   - Never visible in dashboard after setting
   - Can only be overwritten or deleted, not viewed

3. **API keys are valid and active**
   - Tested against Azure OpenAI endpoints
   - Ready to use for both GPT-5 and TTS

### ⚠️ Important Security Reminders

1. **Don't share `.dev.vars`** - Contains your actual API keys
2. **Rotate keys if exposed** - Azure Portal → Regenerate Keys
3. **Monitor usage** - Azure Portal → Cost Management
4. **Use different keys for dev/prod** - Best practice for production apps

---

## 🧪 Testing Your Setup

### Test GPT-5 Reading Generation

```bash
curl -X POST http://localhost:8788/api/tarot-reading \
  -H "Content-Type: application/json" \
  -d '{
    "spreadInfo": {"name": "One-Card Insight"},
    "cardsInfo": [{
      "position": "Theme / Guidance of the Moment",
      "card": "The Fool",
      "orientation": "upright",
      "meaning": "New beginnings, innocence, spontaneity, a free spirit"
    }],
    "userQuestion": "What energy do I need to embrace today?"
  }'
```

**Expected response:**
```json
{
  "reading": "Focusing on the one-card insight, I attune to your question...",
  "provider": "azure-gpt5",
  "themes": {...},
  "context": "self"
}
```

### Test TTS (Voice Narration)

```bash
curl -X POST http://localhost:8788/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Welcome to Mystic Tarot. The cards are ready to speak."}' \
  --output test-voice.mp3

# Play the audio
open test-voice.mp3  # macOS
# or
xdg-open test-voice.mp3  # Linux
```

---

## 📊 Your Configuration Summary

### Environment Variables (Configured)

| Variable | Value | Where |
|----------|-------|-------|
| `AZURE_OPENAI_ENDPOINT` | Your Azure endpoint | `.dev.vars` + Cloudflare |
| `AZURE_OPENAI_API_KEY` | Your API key | `.dev.vars` + Cloudflare |
| `AZURE_OPENAI_GPT5_MODEL` | Your deployment name | `.dev.vars` + Cloudflare |
| `AZURE_OPENAI_TTS_ENDPOINT` | Your TTS endpoint | `.dev.vars` + Cloudflare |
| `AZURE_OPENAI_TTS_API_KEY` | Your TTS API key | `.dev.vars` + Cloudflare |
| `AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT` | Your TTS deployment | `.dev.vars` + Cloudflare |
| `AZURE_OPENAI_API_VERSION` | `preview` | `wrangler.toml` (default) |

### Routes Configuration

- ✅ `/api/*` → Invokes Functions (GPT-5 + TTS)
- ✅ All other routes → Static assets (free, fast)
- ✅ Configured via `public/_routes.json`

---

## 🎯 Next Steps

### Immediate Actions

1. **Test locally:**
   ```bash
   npm run dev
   curl http://localhost:8788/api/tarot-reading
   ```

2. **Setup production secrets:**
   ```bash
   wrangler login
   ./scripts/setup-my-secrets.sh
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### After Deployment

1. **Test production endpoint:**
   ```bash
   curl https://mystic-tarot.pages.dev/api/tarot-reading
   ```

2. **Monitor logs:**
   ```bash
   wrangler pages deployment tail --project-name=mystic-tarot
   ```

3. **Check Azure usage:**
   - Azure Portal → Your Resource → Monitoring

---

## 🐛 Troubleshooting

### Issue: "Azure OpenAI GPT-5 credentials not configured"

**Solution:** Check `.dev.vars` file exists and contains your credentials:
```bash
cat .dev.vars
```

### Issue: "401 Unauthorized" from Azure

**Solution:** Your API key may have been regenerated. Update both:
```bash
# Update .dev.vars for local
nano .dev.vars

# Update Cloudflare for production
./scripts/setup-my-secrets.sh
```

### Issue: "Empty response from Azure OpenAI"

**Solution:** Check your deployment name matches exactly:
- Azure Portal → Azure OpenAI → Deployments
- Should be: `gpt-5` (not `gpt-5-mini` or other variants)

### Issue: Local dev works but production fails

**Solution:** Verify secrets were uploaded:
```bash
wrangler pages secret list --project-name=mystic-tarot
```

If missing, run:
```bash
./scripts/setup-my-secrets.sh
```

---

## 📚 Additional Resources

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference commands
- [Azure OpenAI Responses API Docs](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)
- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)

---

## ✨ You're All Set!

Your Mystic Tarot project is fully configured with:
- ✅ Azure OpenAI GPT-5 for intelligent tarot readings
- ✅ Azure OpenAI TTS for voice narration
- ✅ Optimized routes for cost efficiency
- ✅ Secure credential management
- ✅ Local development environment
- ✅ Production deployment scripts

**Ready to deploy?** Run: `./scripts/setup-my-secrets.sh && npm run deploy`

🎴 May your readings be insightful! ✨
