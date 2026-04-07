import { handleRecordings } from './routes/recordings'

export interface Env {
  DB: D1Database
  AUDIO_BUCKET: R2Bucket
  AI: Ai
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // API routes
    if (url.pathname.startsWith('/api/')) {
      // CORS for local dev
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: corsHeaders(),
        })
      }

      // Extract user email from CF Access JWT (or fallback for local dev)
      const userEmail = getUserEmail(request)

      let response: Response
      try {
        if (url.pathname.startsWith('/api/recordings')) {
          response = await handleRecordings(request, env, url, userEmail)
        } else {
          response = new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal error'
        console.error('API error:', message)
        response = new Response(JSON.stringify({ error: message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Add CORS headers to all API responses
      for (const [key, value] of Object.entries(corsHeaders())) {
        response.headers.set(key, value)
      }
      return response
    }

    // For non-API routes, the static assets (from `assets` config in wrangler.toml)
    // are served automatically by the Workers runtime.
    // This fallback handles any requests that don't match static assets.
    return new Response('Not found', { status: 404 })
  },
}

function getUserEmail(request: Request): string {
  // In production, CF Access sets this header with a JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion')
  if (jwt) {
    try {
      // Decode the JWT payload (middle segment)
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      return payload.email ?? 'unknown@local'
    } catch {
      return 'unknown@local'
    }
  }
  // Local development fallback
  return 'dev@local'
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
