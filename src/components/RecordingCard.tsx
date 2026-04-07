import { Mic } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { Recording } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface Props {
  recording: Recording
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

export function RecordingCard({ recording }: Props) {
  const viewRecording = useAppStore((s) => s.viewRecording)

  const preview =
    recording.edited_transcript ?? recording.raw_transcript ?? 'Processing...'
  const title = recording.title ?? preview.slice(0, 60)

  return (
    <button
      type="button"
      onClick={() => viewRecording(recording.id)}
      className="w-full text-left rounded-lg p-4 transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 rounded-full p-2 mt-0.5"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <Mic size={16} color="var(--color-accent)" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-sm font-medium truncate"
              style={{ color: 'var(--color-text)' }}
            >
              {title}
            </span>
            <StatusBadge status={recording.status} />
          </div>

          <p
            className="text-sm line-clamp-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {preview}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>{formatDate(recording.created_at)}</span>
            {recording.duration_seconds && (
              <span>{formatDuration(recording.duration_seconds)}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
