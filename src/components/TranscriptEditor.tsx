import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ClipboardCopy, RotateCcw } from 'lucide-react'
import { updateRecording } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { Recording } from '@/lib/types'

interface Props {
  recording: Recording
}

export function TranscriptEditor({ recording }: Props) {
  const [text, setText] = useState(recording.edited_transcript ?? recording.raw_transcript ?? '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const updateRec = useAppStore((s) => s.updateRecording)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync if recording changes externally (e.g., transcription completes)
  useEffect(() => {
    const newText = recording.edited_transcript ?? recording.raw_transcript ?? ''
    setText(newText)
  }, [recording.edited_transcript, recording.raw_transcript])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [text])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const updated = await updateRecording(recording.id, { edited_transcript: text })
      updateRec(recording.id, updated)
    } catch {
      // Silently fail for now; the text is still in the textarea
    } finally {
      setSaving(false)
    }
  }, [recording.id, text, updateRec])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  const handleRevert = useCallback(() => {
    setText(recording.raw_transcript ?? '')
  }, [recording.raw_transcript])

  const hasEdits = text !== (recording.raw_transcript ?? '')

  const copyButton = (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      style={{
        backgroundColor: copied ? 'var(--color-success)' : 'var(--color-surface)',
        color: copied ? '#fff' : 'var(--color-text)',
        border: '1px solid var(--color-border)',
      }}
    >
      {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Copy button at top */}
      <div className="flex items-center">
        {copyButton}
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none rounded-lg p-4 text-base leading-relaxed outline-none"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          minHeight: 120,
        }}
        placeholder="Transcript will appear here..."
      />

      {/* Bottom actions: copy + edit controls */}
      <div className="flex items-center gap-2">
        {copyButton}

        {hasEdits && (
          <>
            <button
              type="button"
              onClick={handleRevert}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <RotateCcw size={16} />
              Revert
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ml-auto"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Check size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
