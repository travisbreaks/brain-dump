# brain-dump

Voice capture + transcription PWA. Record on phone, read anywhere.

## Stack
- **Frontend**: React 19 + Vite + TailwindCSS v4 + Zustand + vite-plugin-pwa
- **Backend**: Cloudflare Worker (static assets + API in single deploy)
- **Transcription**: CF Workers AI Whisper v3 Turbo (with VAD filter)
- **Storage**: R2 (audio files) + D1 (transcripts/metadata)

## Dev Commands
```bash
npm install              # install dependencies
npm run dev              # Vite dev server on :5190
npx wrangler dev         # Worker + D1/R2/AI locally on :8787
npm run build            # tsc + vite build
npm run deploy           # build + wrangler deploy
npm run db:migrate       # apply D1 migrations to remote
```

## Architecture
- `src/` - React frontend (components, pages, lib)
- `src/worker/` - Cloudflare Worker backend (API routes)
- `migrations/` - D1 SQL migrations
- `wrangler.toml` - Worker config (D1, R2, AI bindings)

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/recordings | Upload audio + transcribe |
| GET | /api/recordings | List recordings |
| GET | /api/recordings/:id | Get single recording |
| PATCH | /api/recordings/:id | Update transcript/title |

## Key Details
- Whisper expects base64-encoded audio (not raw bytes)
- VAD filter (`vad_filter: true`) prevents hallucination loops on trailing silence
- Audio meter uses RMS time-domain analysis for responsive level display
- MediaRecorder format auto-detection (webm for Chrome, mp4 for Safari)
- Bottom nav disabled during active recording to prevent state corruption
- `raw_transcript` is immutable; `edited_transcript` is the user-editable copy
