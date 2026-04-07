import { List, Mic } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { AppScreen } from '@/lib/types'

const tabs: { screen: AppScreen; label: string; icon: typeof Mic }[] = [
  { screen: 'record', label: 'Record', icon: Mic },
  { screen: 'history', label: 'History', icon: List },
]

export function BottomNav() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const resetCapture = useAppStore((s) => s.resetCapture)
  const isRecording = useAppStore((s) => s.isRecording)

  const handleNav = (target: AppScreen) => {
    // Block navigation while actively recording
    if (isRecording) return
    if (target === 'record') resetCapture()
    setScreen(target)
  }

  return (
    <nav
      className="safe-bottom flex items-center justify-around border-t"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      {tabs.map(({ screen: s, label, icon: Icon }) => {
        const active = screen === s || (screen === 'detail' && s === 'history')
        return (
          <button
            key={s}
            type="button"
            onClick={() => handleNav(s)}
            disabled={isRecording}
            className="flex flex-col items-center gap-1 px-6 py-1 transition-opacity"
            style={{ opacity: isRecording ? 0.3 : 1, pointerEvents: isRecording ? 'none' : 'auto' }}
          >
            <Icon
              size={22}
              color={active ? 'var(--color-accent)' : 'var(--color-text-muted)'}
            />
            <span
              className="text-xs"
              style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
