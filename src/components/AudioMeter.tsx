import { useAppStore } from '@/lib/store'

export function AudioMeter() {
  const audioLevel = useAppStore((s) => s.audioLevel)
  const isRecording = useAppStore((s) => s.isRecording)

  if (!isRecording) return null

  // 12 bars for the level meter
  const bars = 12
  const activeBars = Math.round(audioLevel * bars)

  return (
    <div className="flex items-end gap-1 h-8" aria-label="Audio level">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all"
          style={{
            height: `${20 + (i / bars) * 80}%`,
            backgroundColor:
              i < activeBars ? 'var(--color-accent)' : 'var(--color-border)',
            opacity: i < activeBars ? 1 : 0.4,
            transition: 'background-color 0.1s ease-out',
          }}
        />
      ))}
    </div>
  )
}
