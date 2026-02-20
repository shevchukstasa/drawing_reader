# Drawing Parser — Lava Stone Spec Extractor

AI-powered blueprint analyzer for lava stone product manufacturing. Upload a drawing (PDF, JPG, PNG) and get structured product specifications.

## Features

- Extracts product type, shape, dimensions, glaze info, quantities
- Auto-converts mm → cm
- Checks against standard catalog (sizes, colors, finishes)
- Confidence indicators per field
- Questions for manager when data is unclear
- Multi-language support (EN, ID, JP, etc.)
- Supports Claude Sonnet and GPT-4o

---

## Deploy to Vercel (Recommended — 5 minutes)

### Step 1: Push to GitHub

```bash
# Create a new repo on GitHub, then:
cd drawing-parser
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/drawing-parser.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Select your `drawing-parser` repo
4. Framework: **Next.js** (auto-detected)
5. Click **"Deploy"**

### Step 3: Add Environment Variables

In Vercel dashboard → Your project → **Settings** → **Environment Variables**:

| Key | Value | Required |
|-----|-------|----------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Yes (for Claude) |
| `OPENAI_API_KEY` | `sk-...` | Optional (for GPT-4o) |
| `DEFAULT_PROVIDER` | `anthropic` | Optional |

Click **"Redeploy"** after adding variables.

### Done!

Your app is live at `https://drawing-parser-xxxxx.vercel.app`

---

## Deploy to Google Cloud Run (Alternative)

### Step 1: Create Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 2: Build and Deploy

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/drawing-parser

# Deploy
gcloud run deploy drawing-parser \
  --image gcr.io/YOUR_PROJECT_ID/drawing-parser \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "ANTHROPIC_API_KEY=sk-ant-...,DEFAULT_PROVIDER=anthropic" \
  --memory 512Mi \
  --timeout 120
```

---

## Local Development

```bash
# Install
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with your API keys

# Run
npm run dev

# Open http://localhost:3000
```

---

## Project Structure

```
drawing-parser/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js    ← Server-side API (AI calls)
│   ├── layout.js           ← HTML layout
│   └── page.js             ← Main UI (client component)
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## Security

- API keys are stored **server-side only** (in env variables)
- No keys are ever sent to the browser
- Files are processed in memory, not stored
