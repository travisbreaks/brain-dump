import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { OfflineBanner } from '@/components/OfflineBanner'
import { SplashScreen } from '@/components/SplashScreen'
import { DetailScreen } from '@/pages/DetailScreen'
import { HistoryScreen } from '@/pages/HistoryScreen'
import { RecordScreen } from '@/pages/RecordScreen'
import { useAppStore } from '@/lib/store'

export function App() {
  const screen = useAppStore((s) => s.screen)
  const setIsOnline = useAppStore((s) => s.setIsOnline)
  const [showSplash, setShowSplash] = useState(true)
  const [showFullIcon, setShowFullIcon] = useState(false)

  // Track online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline])

  const dismissSplash = () => {
    setShowSplash(false)
  }

  if (showSplash) return <SplashScreen onDismiss={dismissSplash} />

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header
        className="flex items-center justify-center py-3 border-b flex-shrink-0"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowFullIcon(true)}
          className="flex items-center gap-2"
        >
          <img src="/brain-dump-icon.png" alt="" width={28} height={28} className="rounded-md" />
          <h1 className="text-base font-semibold tracking-wide">Brain Dump</h1>
        </button>
      </header>

      {/* Full-size icon overlay */}
      {showFullIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowFullIcon(false)}
          onKeyDown={() => {}}
          role="button"
          tabIndex={0}
        >
          <img
            src="/brain-dump-icon.png"
            alt="Brain Dump"
            className="rounded-2xl"
            style={{ width: '80vw', maxWidth: 400, boxShadow: '0 16px 64px rgba(0,0,0,0.3)' }}
          />
        </div>
      )}

      <OfflineBanner />

      {/* Content */}
      <main className="flex flex-col flex-1 overflow-y-auto">
        {screen === 'record' && <RecordScreen />}
        {screen === 'history' && <HistoryScreen />}
        {screen === 'detail' && <DetailScreen />}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}
