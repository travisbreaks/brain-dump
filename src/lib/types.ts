export interface Recording {
  id: string
  user_email: string
  title: string | null
  duration_seconds: number | null
  audio_format: string
  audio_r2_key: string | null
  audio_size_bytes: number | null
  raw_transcript: string | null
  edited_transcript: string | null
  status: RecordingStatus
  error_message: string | null
  created_at: string
  updated_at: string
}

export type RecordingStatus = 'uploading' | 'transcribing' | 'ready' | 'error'

export type AppScreen = 'record' | 'history' | 'detail'

export interface PendingUpload {
  id: string
  audioBlob: Blob
  audioFormat: string
  durationSeconds: number
  createdAt: string
}
