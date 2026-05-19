import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

const PARTICLE_COUNT = 160

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

// ── Dark: violet galaxy particles ────────────────────────────────────────────
function makeGalaxyParticles() {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x:     randomBetween(0, 1),
    y:     randomBetween(0, 1),
    z:     randomBetween(0.2, 1),
    speed: randomBetween(0.00006, 0.00018),
    sway:  randomBetween(-0.0002, 0.0002),
    phase: randomBetween(0, Math.PI * 2),
    r:     randomBetween(1, 3.5),
  }))
}

function drawGalaxy(ctx, particles, W, H, t, mx, my) {
  for (const p of particles) {
    p.y -= p.speed
    p.x += p.sway * Math.sin(t * 0.012 + p.phase)
    if (p.y < -0.02) p.y = 1.02
    if (p.x < -0.02) p.x = 1.02
    if (p.x >  1.02) p.x = -0.02

    const px     = (p.x + mx * 0.025 * p.z) * W
    const py     = (p.y + my * 0.015 * p.z) * H
    const radius = p.r * p.z
    const hue    = 255 + p.z * 20
    const light  = 60  + p.z * 25
    const alpha  = 0.15 + p.z * 0.55

    ctx.beginPath()
    ctx.arc(px, py, radius, 0, Math.PI * 2)
    const grd = ctx.createRadialGradient(px, py, 0, px, py, radius * 2.5)
    grd.addColorStop(0, `hsla(${hue}, 80%, ${light}%, ${alpha})`)
    grd.addColorStop(1, `hsla(${hue}, 80%, ${light}%, 0)`)
    ctx.fillStyle = grd
    ctx.fill()
  }
}

// ── Paper: floating organic paper-petal shapes ────────────────────────────────
// Three flavors: cream (large/dominant), warm beige (medium), dusty blush (small/accent)

// flavor 0 = cream white  | flavor 1 = warm beige  | flavor 2 = dusty terracotta blush
const PAPER_FILLS = [
  // [inner-r, inner-g, inner-b,  outer-r, outer-g, outer-b,  stroke-r, stroke-g, stroke-b]
  [252, 249, 243,   232, 226, 212,   148, 112, 44],  // cream
  [245, 238, 222,   225, 215, 195,   138, 100, 38],  // warm beige
  [248, 232, 224,   228, 208, 196,   176,  88, 56],  // dusty blush/terracotta
]

function drawOrganicPaper(ctx, cx, cy, size, angle, phase, alpha, flavor) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  const n   = 8
  const pts = []
  for (let i = 0; i < n; i++) {
    const a   = (i / n) * Math.PI * 2
    const mod = 1 + 0.30 * Math.sin(a * 2.1 + phase) + 0.15 * Math.sin(a * 3.8 + phase * 0.55)
    const r   = size * mod
    pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.50])
  }

  ctx.beginPath()
  const m0x = (pts[n - 1][0] + pts[0][0]) / 2
  const m0y = (pts[n - 1][1] + pts[0][1]) / 2
  ctx.moveTo(m0x, m0y)
  for (let i = 0; i < n; i++) {
    const curr = pts[i]
    const next = pts[(i + 1) % n]
    ctx.quadraticCurveTo(curr[0], curr[1], (curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2)
  }
  ctx.closePath()

  const [ir, ig, ib, or_, og, ob, sr, sg, sb] = PAPER_FILLS[flavor]
  const grd = ctx.createRadialGradient(0, -size * 0.18, 0, 0, 0, size * 1.1)
  grd.addColorStop(0,   `rgba(${ir}, ${ig}, ${ib}, ${alpha})`)
  grd.addColorStop(0.55,`rgba(${ir - 12}, ${ig - 14}, ${ib - 18}, ${alpha * 0.88})`)
  grd.addColorStop(1,   `rgba(${or_}, ${og}, ${ob}, ${alpha * 0.55})`)
  ctx.fillStyle = grd
  ctx.fill()

  // Gold/terracotta outline — the signature detail, slightly thicker for visibility
  ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${alpha * 0.65})`
  ctx.lineWidth   = flavor === 2 ? 0.9 : 0.75
  ctx.stroke()

  ctx.restore()
}

function makePaperParticles() {
  const shapes = []

  // Layer 1: large cream shapes — slow, dominant (14 pieces)
  for (let i = 0; i < 14; i++) {
    shapes.push({
      x: randomBetween(0, 1), y: randomBetween(0, 1),
      z: randomBetween(0.5, 1),
      speedY: randomBetween(-0.00005, 0.00005),
      speedX: randomBetween(-0.00003, 0.00003),
      sway:   randomBetween(0.00005, 0.00012),
      phase:  randomBetween(0, Math.PI * 2),
      spin:   randomBetween(-0.0025, 0.0025),
      angle:  randomBetween(0, Math.PI * 2),
      size:   randomBetween(48, 85),
      flavor: 0,
    })
  }

  // Layer 2: medium warm beige — slightly faster (14 pieces)
  for (let i = 0; i < 14; i++) {
    shapes.push({
      x: randomBetween(0, 1), y: randomBetween(0, 1),
      z: randomBetween(0.3, 0.8),
      speedY: randomBetween(-0.00008, 0.00008),
      speedX: randomBetween(-0.00005, 0.00005),
      sway:   randomBetween(0.00008, 0.00018),
      phase:  randomBetween(0, Math.PI * 2),
      spin:   randomBetween(-0.004, 0.004),
      angle:  randomBetween(0, Math.PI * 2),
      size:   randomBetween(22, 48),
      flavor: 1,
    })
  }

  // Layer 3: small dusty-blush accents — most lively (10 pieces)
  for (let i = 0; i < 10; i++) {
    shapes.push({
      x: randomBetween(0, 1), y: randomBetween(0, 1),
      z: randomBetween(0.4, 0.9),
      speedY: randomBetween(-0.00012, 0.00012),
      speedX: randomBetween(-0.00007, 0.00007),
      sway:   randomBetween(0.00012, 0.00025),
      phase:  randomBetween(0, Math.PI * 2),
      spin:   randomBetween(-0.006, 0.006),
      angle:  randomBetween(0, Math.PI * 2),
      size:   randomBetween(12, 28),
      flavor: 2,
    })
  }

  return shapes
}

function drawPaperPieces(ctx, particles, W, H, t, mx, my) {
  // Draw large first (back), then small (front)
  const sorted = [...particles].sort((a, b) => b.size * b.z - a.size * a.z)

  for (const p of sorted) {
    p.y += p.speedY
    p.x += p.speedX + p.sway * Math.sin(t * 0.005 + p.phase)
    p.angle += p.spin

    if (p.y < -0.14) p.y = 1.14
    if (p.y >  1.14) p.y = -0.14
    if (p.x < -0.14) p.x = 1.14
    if (p.x >  1.14) p.x = -0.14

    const px    = (p.x + mx * 0.012 * p.z) * W
    const py    = (p.y + my * 0.008 * p.z) * H
    const size  = p.size * p.z
    const alpha = p.flavor === 2
      ? 0.30 + p.z * 0.42          // blush pieces: more visible
      : 0.22 + p.z * 0.40

    drawOrganicPaper(ctx, px, py, size, p.angle, p.phase + t * 0.0025, alpha, p.flavor)
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroCanvas() {
  const { theme } = useTheme()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let mx = 0, my = 0
    const onMouseMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Build particles based on theme
    const particles = theme === 'paper'
      ? makePaperParticles()
      : makeGalaxyParticles()

    let raf
    let t = 0

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      t += 1

      if (theme === 'paper') {
        drawPaperPieces(ctx, particles, W, H, t, mx, my)
      } else {
        drawGalaxy(ctx, particles, W, H, t, mx, my)
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [theme])  // re-init particles when theme changes

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
