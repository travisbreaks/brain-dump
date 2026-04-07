import { useEffect, useState } from 'react'
import { RecordingCard } from '@/components/RecordingCard'
import { listRecordings } from '@/lib/api'
import { useAppStore } from '@/lib/store'

export function HistoryScreen() {
  const recordings = useAppStore((s) => s.recordings)
  const setRecordings = useAppStore((s) => s.setRecordings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    listRecordings()
      .then((data) => {
        if (!cancelled) {
          setRecordings(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [setRecordings])

  return (
    <div className="flex flex-col flex-1 px-4 pt-6">
      <h2 className="text-lg font-semibold mb-4">History</h2>

      {loading && recordings.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading...
        </p>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent)' }}>
          {error}
        </p>
      )}

      {!loading && !error && recordings.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No recordings yet. Tap Record to start.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {recordings.map((r) => (
          <RecordingCard key={r.id} recording={r} />
        ))}
      </div>
    </div>
  )
}
