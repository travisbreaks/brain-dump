import type { RecordingStatus } from '@/lib/types'

const config: Record<RecordingStatus, { label: string; color: string; bg: string }> = {
  uploading: { label: 'Uploading', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
  transcribing: { label: 'Transcribing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  ready: { label: 'Ready', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  error: { label: 'Error', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
}

interface Props {
  status: RecordingStatus
}

export function StatusBadge({ status }: Props) {
  const c = config[status]
  if (status === 'ready') return null

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      {c.label}
    </span>
  )
}
