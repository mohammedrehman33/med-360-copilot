# 🚢 Deployment Guide — Med 360 Copilot

This guide covers three deployment options for Med 360 Copilot.

---

## Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js apps. Zero-config deployment.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/med-360-copilot)

### Manual Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables
vercel env add ANTHROPIC_API_KEY
# or
vercel env add OPENAI_API_KEY
# or
vercel env add GOOGLE_API_KEY
```

### Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add at least one AI provider key:

| Variable | Required |
|----------|----------|
| `ANTHROPIC_API_KEY` | At least one AI key |
| `OPENAI_API_KEY` | At least one AI key |
| `GOOGLE_API_KEY` | At least one AI key |

---

## Option 2: Docker

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  med360:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    restart: unless-stopped
```

### Build & Run

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f med360

# Stop
docker-compose down
```

> **Note:** Add `output: "standalone"` to your `next.config.ts` for Docker builds.

---

## Option 3: Railway

Railway offers quick PaaS deployment with automatic builds.

### Steps

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select the `med-360-copilot` repository
4. Railway auto-detects Next.js and configures the build
5. Go to **Variables** tab and add your AI provider key(s):
   - `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_API_KEY`
6. Click **Deploy** — Railway assigns a public URL automatically

### Railway CLI (Alternative)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set GOOGLE_API_KEY=your-key-here
```

---

## 🆓 No Claude API Key? Use Gemini for Free

If you don't have an Anthropic or OpenAI API key, you can get started with Google Gemini's free tier:

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key and set it as `GOOGLE_API_KEY` in your environment
5. The app will automatically use Gemini as the AI backend

Gemini's free tier is generous and great for development and small-scale usage.

---

## Production Checklist

- [ ] Set at least one AI provider API key
- [ ] Enable HTTPS (handled automatically by Vercel/Railway)
- [ ] Set `NODE_ENV=production`
- [ ] Review rate limiting for API routes
- [ ] Test all AI features with your chosen provider
