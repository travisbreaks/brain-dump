import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { TranscriptEditor } from '@/components/TranscriptEditor'
import { StatusBadge } from '@/components/StatusBadge'
import { getRecording } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { Recording } from '@/lib/types'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

export function DetailScreen() {
  const selectedId = useAppStore((s) => s.selectedRecordingId)
  const setScreen = useAppStore((s) => s.setScreen)
  const [recording, setRecording] = useState<Recording | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    getRecording(selectedId)
      .then(setRecording)
      .catch(() => setRecording(null))
      .finally(() => setLoading(false))
  }, [selectedId])

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!recording) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-2">
        <p style={{ color: 'var(--color-text-muted)' }}>Recording not found</p>
        <button
          type="button"
          onClick={() => setScreen('history')}
          className="text-sm"
          style={{ color: 'var(--color-accent)' }}
        >
          Back to history
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-4 overflow-y-auto">
      {/* Header */}
      <button
        type="button"
        onClick={() => setScreen('history')}
        className="flex items-center gap-2 mb-4 self-start"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      {/* Metadata */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate(recording.created_at)}
        </span>
        {recording.duration_seconds && (
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {formatDuration(recording.duration_seconds)}
          </span>
        )}
        <StatusBadge status={recording.status} />
      </div>

      {/* Transcript */}
      {recording.status === 'ready' && <TranscriptEditor recording={recording} />}

      {recording.status !== 'ready' && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {recording.status === 'error'
            ? recording.error_message ?? 'Transcription failed'
            : 'Still processing...'}
        </p>
      )}
    </div>
  )
}
