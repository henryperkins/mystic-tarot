# Mystic Tarot - Quick Start

## 🚀 Local Development

### 1. Setup Secrets

```bash
# Copy template
cp .dev.vars.example .dev.vars

# Edit with your Azure OpenAI credentials
nano .dev.vars
```

### 2. Build & Run

```bash
npm install
npm run build
npm run dev
```

### 3. Test

```bash
# Health check
curl http://localhost:8788/api/tarot-reading
```

---

## 🌍 Production Deployment

### 1. Setup Secrets

```bash
# Interactive setup
./scripts/setup-secrets.sh

# Or manually:
echo "https://your-resource.openai.azure.com" | \
  wrangler pages secret put AZURE_OPENAI_ENDPOINT --project-name=mystic-tarot

echo "your-api-key" | \
  wrangler pages secret put AZURE_OPENAI_API_KEY --project-name=mystic-tarot

echo "gpt-5-mini" | \
  wrangler pages secret put AZURE_OPENAI_GPT5_MODEL --project-name=mystic-tarot
```

### 2. Deploy

```bash
npm run build
npm run deploy
```

### 3. Verify

```bash
# Health check
curl https://mystic-tarot.pages.dev/api/tarot-reading

# Live logs
wrangler pages deployment tail --project-name=mystic-tarot
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `public/_routes.json` | Routes config (only `/api/*` invokes Functions) |
| `.dev.vars` | Local development secrets (DO NOT COMMIT!) |
| `wrangler.toml` | Cloudflare Pages configuration |
| `functions/api/tarot-reading.js` | Main API endpoint |

---

## 🔍 Common Commands

```bash
# List secrets
wrangler pages secret list --project-name=mystic-tarot

# Delete secret
wrangler pages secret delete SECRET_NAME --project-name=mystic-tarot

# View logs
wrangler pages deployment tail --project-name=mystic-tarot

# Build project
npm run build

# Deploy
npm run deploy
```

---

## 📚 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup instructions, troubleshooting, and best practices.
