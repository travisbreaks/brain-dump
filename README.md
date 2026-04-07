# brain-dump

Voice capture and transcription PWA. Record on your phone, read the transcript on any device.

Record a voice memo, get an instant transcript powered by Cloudflare Workers AI (Whisper v3 Turbo), edit it inline, and access it from any device via the History tab. No app store, no ecosystem lock-in. Works on iPhone, Android, and desktop browsers.

## How It Works

1. Open the app on your phone (or any device with a browser)
2. Tap the mic button to start recording
3. Talk as long as you want (brain dump style, no auto-cutoff)
4. Tap stop
5. Transcript appears in seconds
6. Edit if needed, copy to clipboard
7. Open the **same URL on any other device** to see all your transcripts in the History tab

That last part is the key: record on your iPhone, read/copy the transcript on your Windows PC. No Apple ecosystem required.

## What You Need

- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org/) 20+
- ~5 minutes

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/brain-dump.git
cd brain-dump

# 2. Install dependencies
npm install

# 3. Install the Wrangler CLI (Cloudflare's deploy tool) if you don't have it
npm install -g wrangler

# 4. Log in to your Cloudflare account
npx wrangler login
# This opens a browser tab. Approve the permissions and you're authenticated.

# 5. Create the D1 database (stores your transcripts)
npx wrangler d1 create brain-dump-db
# This prints a database_id. Copy it.

# 6. Paste your database_id into wrangler.toml
# Open wrangler.toml and replace YOUR_D1_DATABASE_ID with the ID you just copied.

# 7. Create the R2 bucket (stores your audio files)
npx wrangler r2 bucket create brain-dump-audio

# 8. Set up the database tables
npx wrangler d1 migrations apply brain-dump-db --remote

# 9. Build and deploy
npm run build
npx wrangler deploy
```

Your app is now live at `https://brain-dump.<your-subdomain>.workers.dev`. Open it on your phone and desktop.

## Installing as a Phone App (PWA)

**iPhone (Safari only):**
1. Open the URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down, tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the three-dot menu
3. Tap "Install app" or "Add to Home Screen"

Once installed, it opens full-screen like a native app with its own icon.

## Architecture

Everything runs on Cloudflare. One project, one deploy command.

```
Phone/Desktop (PWA)
  |
  v
Cloudflare Worker (API + static assets)
  |-- POST /api/recordings    (upload audio)
  |-- GET  /api/recordings    (list transcripts)
  |-- GET  /api/recordings/:id (single transcript)
  |-- PATCH /api/recordings/:id (edit transcript)
  |
  +-- R2 bucket (audio files, zero bandwidth cost)
  +-- D1 database (transcripts, metadata)
  +-- Workers AI (Whisper v3 Turbo transcription)
```

**Key files:**
- `src/` - React frontend (what you see in the browser)
- `src/worker/` - Cloudflare Worker backend (API that handles uploads and transcription)
- `src/lib/recorder.ts` - MediaRecorder wrapper (handles Safari vs Chrome audio formats)
- `src/worker/routes/recordings.ts` - All API logic (upload to R2, call Whisper, store in D1)
- `wrangler.toml` - Cloudflare config (database, bucket, and AI bindings)
- `migrations/001_init.sql` - Database schema

## Costs

| What | Free Tier |
|------|-----------|
| Transcription (Whisper AI) | ~217 minutes/day |
| Database (D1) | 5M reads + 100K writes/day |
| Audio storage (R2) | 10 GB |
| Bandwidth | Unlimited (zero egress) |
| Workers requests | 100K/day |

For personal use, **the free tier covers it**. You'd need to record 3.5+ hours per day to hit the transcription limit. The $5/mo paid Workers plan unlocks higher limits if you ever need them.

## Local Development

```bash
npm run dev              # Frontend on http://localhost:5190
npx wrangler dev         # API on http://localhost:8787
```

The frontend hot-reloads via Vite. The API runs locally via Wrangler with real D1/R2/AI bindings.

## Custom Domain (Optional)

If you have a domain on Cloudflare:
1. Uncomment the `[[routes]]` section in `wrangler.toml`
2. Replace `yourdomain.com` with your domain
3. Run `npx wrangler deploy`

Cloudflare handles DNS and SSL automatically.

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS v4, Zustand, vite-plugin-pwa
- **Backend**: Cloudflare Worker (TypeScript)
- **Transcription**: Cloudflare Workers AI (Whisper v3 Turbo with VAD filter)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Audio Storage**: Cloudflare R2 (S3-compatible, zero egress fees)

## Known Limitations

- **iPhone**: must keep the screen on while recording (iOS PWA limitation)
- **iPhone**: mic permission is re-requested each time you open the app
- **Recordings over ~25 min**: may hit the Whisper file size limit (chunking is a future addition)
- **No auth**: anyone with the URL can use it. For private use, add [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) (free for up to 50 users, email-based login, zero code changes)

## License

MIT
