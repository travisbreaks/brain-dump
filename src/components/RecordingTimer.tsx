import { useAppStore } from '@/lib/store'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function RecordingTimer() {
  const duration = useAppStore((s) => s.recordingDuration)
  const isRecording = useAppStore((s) => s.isRecording)

  return (
    <div
      className="text-4xl font-mono tracking-wider"
      style={{ color: isRecording ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
    >
      {formatTime(duration)}
    </div>
  )
}
