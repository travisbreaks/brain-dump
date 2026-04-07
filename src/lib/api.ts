import type { Recording } from './types'

const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
    },
  })

  if (!res.ok) {
    // CF Access session expired
    if (res.status === 401 || res.status === 403) {
      throw new Error('Session expired. Please re-authenticate.')
    }
    const body = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${body}`)
  }

  return res.json()
}

export async function uploadRecording(
  audioBlob: Blob,
  durationSeconds: number,
): Promise<Recording> {
  const formData = new FormData()
  const ext = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('ogg') ? 'ogg' : 'mp4'
  formData.append('audio', audioBlob, `recording.${ext}`)
  formData.append('duration_seconds', String(Math.round(durationSeconds)))
  formData.append('audio_format', audioBlob.type || 'audio/webm')

  return request<Recording>('/recordings', {
    method: 'POST',
    body: formData,
  })
}

export async function listRecordings(limit = 50, offset = 0): Promise<Recording[]> {
  return request<Recording[]>(`/recordings?limit=${limit}&offset=${offset}`)
}

export async function getRecording(id: string): Promise<Recording> {
  return request<Recording>(`/recordings/${id}`)
}

export async function updateRecording(
  id: string,
  patch: { edited_transcript?: string; title?: string },
): Promise<Recording> {
  return request<Recording>(`/recordings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}
