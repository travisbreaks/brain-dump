import { WifiOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline)

  if (isOnline) return null

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm"
      style={{
        backgroundColor: 'rgba(234, 179, 8, 0.15)',
        color: 'var(--color-warning)',
      }}
    >
      <WifiOff size={14} />
      <span>Offline. Recording requires connectivity.</span>
    </div>
  )
}
