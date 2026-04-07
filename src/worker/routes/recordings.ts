import type { Env } from '../index'

export async function handleRecordings(
  request: Request,
  env: Env,
  url: URL,
  userEmail: string,
): Promise<Response> {
  const path = url.pathname.replace('/api/recordings', '')
  const method = request.method

  // POST /api/recordings - upload + transcribe
  if (method === 'POST' && path === '') {
    return handleCreate(request, env, userEmail)
  }

  // GET /api/recordings - list
  if (method === 'GET' && path === '') {
    return handleList(env, url, userEmail)
  }

  // GET /api/recordings/:id
  const idMatch = path.match(/^\/([a-f0-9-]+)$/)
  if (method === 'GET' && idMatch) {
    return handleGet(env, idMatch[1], userEmail)
  }

  // PATCH /api/recordings/:id
  if (method === 'PATCH' && idMatch) {
    return handleUpdate(request, env, idMatch[1], userEmail)
  }

  return json({ error: 'Not found' }, 404)
}

async function handleCreate(
  request: Request,
  env: Env,
  userEmail: string,
): Promise<Response> {
  const formData = await request.formData()
  const audioFile = formData.get('audio') as File | null
  const durationStr = formData.get('duration_seconds') as string | null
  const audioFormat = (formData.get('audio_format') as string) || 'audio/webm'

  if (!audioFile) {
    return json({ error: 'Missing audio file' }, 400)
  }

  const id = crypto.randomUUID()
  const durationSeconds = durationStr ? parseInt(durationStr, 10) : null
  const ext = audioFormat.includes('webm') ? 'webm' : audioFormat.includes('ogg') ? 'ogg' : 'mp4'
  const emailHash = await hashEmail(userEmail)
  const r2Key = `brain-dump/${emailHash}/${id}.${ext}`

  // Insert initial row
  await env.DB.prepare(
    `INSERT INTO recordings (id, user_email, duration_seconds, audio_format, audio_r2_key, audio_size_bytes, status)
     VALUES (?, ?, ?, ?, ?, ?, 'uploading')`,
  )
    .bind(id, userEmail, durationSeconds, audioFormat, r2Key, audioFile.size)
    .run()

  // Upload audio to R2
  const audioBytes = await audioFile.arrayBuffer()
  await env.AUDIO_BUCKET.put(r2Key, audioBytes, {
    httpMetadata: { contentType: audioFormat },
  })

  // Update status
  await env.DB.prepare(`UPDATE recordings SET status = 'transcribing' WHERE id = ?`)
    .bind(id)
    .run()

  // Transcribe via Workers AI Whisper
  let rawTranscript = ''
  let status = 'ready'
  let errorMessage: string | null = null

  try {
    // Whisper v3 Turbo expects base64-encoded audio
    // vad_filter prevents hallucination loops on trailing silence
    const base64Audio = arrayBufferToBase64(audioBytes)
    const result = (await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
      audio: base64Audio,
      vad_filter: true,
    })) as { text?: string }

    rawTranscript = result.text ?? ''
  } catch (err) {
    status = 'error'
    errorMessage = err instanceof Error ? err.message : 'Transcription failed'
  }

  // Auto-generate title from first ~60 chars of transcript
  const title = rawTranscript
    ? rawTranscript.slice(0, 60) + (rawTranscript.length > 60 ? '...' : '')
    : null

  // Update with transcript
  await env.DB.prepare(
    `UPDATE recordings
     SET raw_transcript = ?, edited_transcript = ?, title = ?, status = ?, error_message = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(rawTranscript, rawTranscript, title, status, errorMessage, id)
    .run()

  // Return the full recording
  const recording = await env.DB.prepare('SELECT * FROM recordings WHERE id = ?')
    .bind(id)
    .first()

  return json(recording, 201)
}

async function handleList(
  env: Env,
  url: URL,
  userEmail: string,
): Promise<Response> {
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100)
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)

  const { results } = await env.DB.prepare(
    `SELECT * FROM recordings WHERE user_email = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(userEmail, limit, offset)
    .all()

  return json(results)
}

async function handleGet(
  env: Env,
  id: string,
  userEmail: string,
): Promise<Response> {
  const recording = await env.DB.prepare(
    'SELECT * FROM recordings WHERE id = ? AND user_email = ?',
  )
    .bind(id, userEmail)
    .first()

  if (!recording) return json({ error: 'Not found' }, 404)
  return json(recording)
}

async function handleUpdate(
  request: Request,
  env: Env,
  id: string,
  userEmail: string,
): Promise<Response> {
  const body = (await request.json()) as {
    edited_transcript?: string
    title?: string
  }

  // Verify ownership
  const existing = await env.DB.prepare(
    'SELECT id FROM recordings WHERE id = ? AND user_email = ?',
  )
    .bind(id, userEmail)
    .first()

  if (!existing) return json({ error: 'Not found' }, 404)

  const updates: string[] = []
  const values: (string | null)[] = []

  if (body.edited_transcript !== undefined) {
    updates.push('edited_transcript = ?')
    values.push(body.edited_transcript)
  }
  if (body.title !== undefined) {
    updates.push('title = ?')
    values.push(body.title)
  }

  if (updates.length === 0) {
    return json({ error: 'No fields to update' }, 400)
  }

  updates.push("updated_at = datetime('now')")
  values.push(id)

  await env.DB.prepare(
    `UPDATE recordings SET ${updates.join(', ')} WHERE id = ?`,
  )
    .bind(...values)
    .run()

  const recording = await env.DB.prepare('SELECT * FROM recordings WHERE id = ?')
    .bind(id)
    .first()

  return json(recording)
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(email)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
