import { useCallback, useEffect, useRef } from 'react'
import { AudioMeter } from '@/components/AudioMeter'
import { RecordButton } from '@/components/RecordButton'
import { RecordingTimer } from '@/components/RecordingTimer'
import { TranscriptEditor } from '@/components/TranscriptEditor'
import { StatusBadge } from '@/components/StatusBadge'
import { uploadRecording } from '@/lib/api'
import { createAudioAnalyzer, type AudioAnalyzer } from '@/lib/audio-analyzer'
import { startRecording, type RecorderHandle } from '@/lib/recorder'
import { useAppStore } from '@/lib/store'

export function RecordScreen() {
  const recorderRef = useRef<RecorderHandle | null>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const levelRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const store = useAppStore()

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (levelRef.current) cancelAnimationFrame(levelRef.current)
    analyzerRef.current?.destroy()
    analyzerRef.current = null
    recorderRef.current = null
    timerRef.current = null
    levelRef.current = null

    // Release wake lock
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
  }, [])

  // Clean up on unmount
  useEffect(() => cleanup, [cleanup])

  const handleStart = useCallback(async () => {
    try {
      const handle = await startRecording()
      recorderRef.current = handle

      // Audio analyzer for level metering
      const analyzer = createAudioAnalyzer(handle.stream)
      analyzerRef.current = analyzer

      // Request wake lock to keep screen on (best-effort)
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // Wake Lock not available or denied; non-critical
        }
      }

      store.setIsRecording(true)
      store.setRecordingDuration(0)

      // Timer: tick every second
      timerRef.current = setInterval(() => {
        store.setRecordingDuration(useAppStore.getState().recordingDuration + 1)
      }, 1000)

      // Audio level: update via rAF
      const updateLevel = () => {
        if (analyzerRef.current) {
          store.setAudioLevel(analyzerRef.current.getLevel())
          levelRef.current = requestAnimationFrame(updateLevel)
        }
      }
      levelRef.current = requestAnimationFrame(updateLevel)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }, [store])

  const handleStop = useCallback(async () => {
    if (!recorderRef.current) return

    store.setIsRecording(false)
    const duration = useAppStore.getState().recordingDuration
    const blob = await recorderRef.current.stop()
    cleanup()

    store.setCurrentAudioBlob(blob)
    store.setProcessingStatus('uploading')

    try {
      store.setProcessingStatus('uploading')
      const recording = await uploadRecording(blob, duration)

      // The Worker processes transcription synchronously, so by the time
      // we get a response the transcript is ready (or errored)
      store.setCurrentRecording(recording)
      store.prependRecording(recording)
      store.setProcessingStatus(recording.status === 'error' ? 'error' : 'ready')
    } catch (err) {
      console.error('Upload failed:', err)
      store.setProcessingStatus('error')
    }
  }, [store, cleanup])

  const { processingStatus, currentRecording } = store

  return (
    <div className="flex flex-col items-center flex-1 px-4">
      {/* Recording UI */}
      {processingStatus === 'idle' && (
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <RecordingTimer />
          <RecordButton onStart={handleStart} onStop={handleStop} />
          <AudioMeter />
          {store.isRecording && (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Keep screen on while recording
            </p>
          )}
          {!store.isRecording && (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Tap to start recording
            </p>
          )}
        </div>
      )}

      {/* Processing state */}
      {(processingStatus === 'uploading' || processingStatus === 'transcribing') && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'transparent' }}
          />
          <StatusBadge status={processingStatus === 'uploading' ? 'uploading' : 'transcribing'} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {processingStatus === 'uploading' ? 'Uploading audio...' : 'Transcribing...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {processingStatus === 'error' && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p style={{ color: 'var(--color-accent)' }}>
            {currentRecording?.error_message ?? 'Something went wrong'}
          </p>
          <button
            type="button"
            onClick={() => store.resetCapture()}
            className="rounded-lg px-4 py-2 text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Transcript ready */}
      {processingStatus === 'ready' && currentRecording && (
        <div className="flex flex-col flex-1 w-full pt-6 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <button
              type="button"
              onClick={() => store.resetCapture()}
              className="text-sm rounded-lg px-3 py-1.5"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
              }}
            >
              New recording
            </button>
          </div>
          <TranscriptEditor recording={currentRecording} />
        </div>
      )}
    </div>
  )
}
