import { useEffect, useRef, useState } from 'react'

interface Props {
  onDismiss: () => void
}

export function SplashScreen({ onDismiss }: Props) {
  const [ready, setReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 200
    const H = 240
    canvas.width = W
    canvas.height = H

    const path: { x: number; y: number }[] = []
    const cx = W / 2
    const baseY = H - 30

    // Drop from nozzle
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      path.push({ x: cx, y: 20 + t * (baseY - 20) })
    }

    // Serpentine layers
    const layers = [
      { y: baseY, width: 70 },
      { y: baseY - 22, width: 62 },
      { y: baseY - 42, width: 50 },
      { y: baseY - 60, width: 36 },
      { y: baseY - 74, width: 20 },
    ]

    let goingRight = true

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li]
      const nextLayer = layers[li + 1]
      const halfW = layer.width / 2

      const steps = 25
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = goingRight
          ? cx - halfW + t * layer.width
          : cx + halfW - t * layer.width
        path.push({ x, y: layer.y })
      }

      if (nextLayer) {
        const endX = goingRight ? cx + halfW : cx - halfW
        const nextHalfW = nextLayer.width / 2
        const nextStartX = goingRight ? cx + nextHalfW : cx - nextHalfW
        const curveSteps = 12
        for (let i = 1; i <= curveSteps; i++) {
          const t = i / curveSteps
          const x = endX + (nextStartX - endX) * t
          const y = layer.y + (nextLayer.y - layer.y) * t
          const bulge = Math.sin(t * Math.PI) * 8 * (goingRight ? 1 : -1)
          path.push({ x: x + bulge, y })
        }
      }

      goingRight = !goingRight
    }

    // Top swirl
    const topLayer = layers[layers.length - 1]
    const tipSteps = 15
    const tipStartX = goingRight ? cx - topLayer.width / 2 : cx + topLayer.width / 2
    for (let i = 1; i <= tipSteps; i++) {
      const t = i / tipSteps
      const angle = t * Math.PI * 1.2
      const radius = (1 - t) * 12
      const x = tipStartX + (cx - tipStartX) * t + Math.cos(angle) * radius
      const y = topLayer.y - t * 22
      path.push({ x, y })
    }

    const totalPoints = path.length
    const duration = 2800
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress < 0.15
        ? (progress / 0.15) * 0.1
        : 0.1 + ((progress - 0.15) / 0.85) * 0.9
      const pointsToShow = Math.floor(eased * totalPoints)

      ctx.clearRect(0, 0, W, H)

      if (pointsToShow < 2) {
        if (progress < 1) requestAnimationFrame(tick)
        return
      }

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const coilDone = pointsToShow / totalPoints > 0.3
      const nozzleFade = coilDone ? Math.max(0, 1 - (pointsToShow / totalPoints - 0.3) / 0.15) : 1

      for (let i = 1; i < pointsToShow; i++) {
        const p0 = path[i - 1]
        const p1 = path[i]
        const t = i / totalPoints

        if (t < 0.1 && nozzleFade <= 0) continue

        let thickness: number
        if (t < 0.1) {
          thickness = 6
          ctx.globalAlpha = nozzleFade
        } else if (t >= 0.1) {
          ctx.globalAlpha = 1
        }
        if (t > 0.9) {
          thickness = 18 * (1 - (t - 0.9) / 0.1)
        } else {
          thickness = 22 - (t - 0.1) * 8
        }

        const darkFactor = 0.85 + t * 0.15
        const r = Math.floor(139 * darkFactor)
        const g = Math.floor(90 * darkFactor)
        const b = Math.floor(43 * darkFactor)
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
        ctx.lineWidth = thickness

        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
      }

      // Face
      if (pointsToShow > totalPoints * 0.85) {
        const faceAlpha = Math.min(1, (pointsToShow / totalPoints - 0.85) / 0.15)
        ctx.globalAlpha = faceAlpha

        const eyeY = baseY - 58
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.ellipse(cx - 14, eyeY, 7, 8, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(cx + 14, eyeY, 7, 8, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#3d2314'
        ctx.beginPath()
        ctx.ellipse(cx - 13, eyeY + 1, 4, 5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(cx + 15, eyeY + 1, 4, 5, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(cx - 15, eyeY - 2, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx + 13, eyeY - 2, 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = '#3d2314'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(cx, eyeY + 14, 10, 0.1 * Math.PI, 0.9 * Math.PI)
        ctx.stroke()

        ctx.globalAlpha = 1
      }

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setReady(true)
      }
    }
    requestAnimationFrame(tick)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 18px,
            rgba(180, 210, 230, 0.25) 18px,
            rgba(180, 210, 230, 0.25) 19px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 18px,
            rgba(180, 210, 230, 0.25) 18px,
            rgba(180, 210, 230, 0.25) 19px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 298px,
            #b0c8d8 298px,
            #b0c8d8 303px
          ),
          var(--color-bg)
        `,
      }}
    >
      {/* Fixed layout: logo, button slot, poop - nothing moves */}
      <div className="flex flex-col items-center" style={{ gap: 16 }}>
        {/* Brain icon */}
        <img
          src="/brain-dump-icon.png"
          alt="Brain Dump"
          width={120}
          height={120}
          className="rounded-2xl"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        />

        {/* Button slot - fixed height so nothing shifts */}
        <div className="flex items-center justify-center" style={{ height: 48 }}>
          {ready ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full px-8 py-3 text-base font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                boxShadow: '0 4px 16px var(--color-accent-glow)',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            >
              Let it out
            </button>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Preparing to drop the load...
            </p>
          )}
        </div>

        {/* Animated poop */}
        <canvas
          ref={canvasRef}
          width={200}
          height={240}
          style={{ width: 160, height: 192 }}
        />
      </div>
    </div>
  )
}
