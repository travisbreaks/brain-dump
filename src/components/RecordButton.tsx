import { Mic, Square } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Props {
  onStart: () => void
  onStop: () => void
}

export function RecordButton({ onStart, onStop }: Props) {
  const isRecording = useAppStore((s) => s.isRecording)
  const audioLevel = useAppStore((s) => s.audioLevel)

  const handleClick = () => {
    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }

  // Scale the glow ring based on audio level during recording
  const glowScale = isRecording ? 1 + audioLevel * 0.6 : 1
  const glowOpacity = isRecording ? 0.3 + audioLevel * 0.5 : 0

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex items-center justify-center"
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {/* Glow ring */}
      <div
        className="absolute rounded-full transition-transform"
        style={{
          width: 140,
          height: 140,
          background: `radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
          transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
        }}
      />

      {/* Main button */}
      <div
        className="relative z-10 flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 96,
          height: 96,
          backgroundColor: isRecording ? 'var(--color-accent)' : 'var(--color-surface)',
          border: `3px solid ${isRecording ? 'var(--color-accent)' : 'var(--color-border)'}`,
        }}
      >
        {isRecording ? (
          <Square size={32} fill="white" color="white" />
        ) : (
          <Mic size={36} color="var(--color-accent)" />
        )}
      </div>
    </button>
  )
}
