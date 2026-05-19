import { useState, useEffect, useRef } from 'react'
import './WelcomeEffect.css'

const STORAGE_KEY = 'pf-welcome-shown'
const EFFECTS = ['shutter', 'flash', 'film', 'bloom', 'light']
const DURATIONS = { shutter: 2200, flash: 3600, film: 2700, bloom: 2400, light: 4100 }

// ── Effect 1: Aperture Shutter ───────────────────────────────────────────
function Shutter() {
  const N = 8
  return (
    <div className="we-shutter we-shutter--open">
      <div className="we-iris">
        {Array.from({ length: N }, (_, i) => (
          <div
            key={i}
            className="we-blade"
            style={{ '--rot': `${i * (360 / N)}deg` }}
          />
        ))}
      </div>
      <div className="we-ring" />
      <div className="we-readout">f/1.4 · 1/250s · ISO 400</div>
    </div>
  )
}

// ── Effect 2: Flash + Polaroid Rain ─────────────────────────────────────
function Flash() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const captions = [
      'Bucharest, 2024', 'Cluj · golden hour', 'portrait study',
      'on location', 'analogue 35mm', 'behind the scenes',
      'natural light', 'studio work',
    ]
    for (let i = 0; i < 10; i++) {
      const pol = document.createElement('div')
      pol.className = 'we-polaroid'
      const hue = 260 + Math.random() * 40
      pol.innerHTML = `
        <div class="we-pol-img" style="background:linear-gradient(135deg,hsl(${hue},50%,30%),hsl(${hue + 30},60%,20%))"></div>
        <div class="we-pol-cap">${captions[i % captions.length]}</div>
      `
      const startX = 20 + Math.random() * 60
      const rot = (Math.random() - 0.5) * 60
      pol.style.left = startX + '%'
      pol.style.top = '-25%'
      pol.animate(
        [
          { transform: `translateY(-20vh) rotate(${rot * 0.3}deg) scale(.8)`, opacity: 0 },
          { transform: `translateY(30vh) rotate(${rot * 0.6}deg) scale(1)`, opacity: 1, offset: 0.3 },
          { transform: `translateY(130vh) rotate(${rot}deg) scale(1)`, opacity: 1 },
        ],
        {
          duration: 2200 + Math.random() * 800,
          delay: 200 + Math.random() * 800,
          easing: 'cubic-bezier(.3,.6,.4,1)',
          fill: 'forwards',
        }
      )
      container.appendChild(pol)
    }
  }, [])

  return (
    <>
      <div className="we-flash" />
      <div className="we-polaroids" ref={containerRef} />
    </>
  )
}

// ── Effect 3: Film Strip ─────────────────────────────────────────────────
function Film() {
  const words = ['See', 'the', 'world', 'through', 'a', 'lens', '.', '✦', '◉', 'photo', 'forge', '◈']
  return (
    <div className="we-filmreel">
      <div className="we-strip">
        {Array.from({ length: 24 }, (_, i) => {
          const hue = 240 + (i * 10) % 80
          return (
            <div
              key={i}
              className="we-frame"
              style={{ background: `linear-gradient(135deg,hsl(${hue},40%,20%),hsl(${hue + 20},50%,12%))` }}
            >
              <span>{words[i % words.length]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Effect 4: Aperture Bloom + Particles ────────────────────────────────
function Bloom() {
  const particlesRef = useRef(null)
  const N = 6

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('span')
      const ang = Math.random() * Math.PI * 2
      const dist = 40 + Math.random() * 60
      const dx = Math.cos(ang) * dist
      const dy = Math.sin(ang) * dist
      Object.assign(s.style, {
        position: 'absolute', left: '50%', top: '50%',
        width: '4px', height: '4px',
        background: '#c4b5fd', borderRadius: '50%',
        boxShadow: '0 0 10px #a78bfa',
      })
      s.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0)', opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.3}vmin),calc(-50% + ${dy * 0.3}vmin)) scale(1)`, opacity: 1, offset: 0.2 },
          { transform: `translate(calc(-50% + ${dx}vmin),calc(-50% + ${dy}vmin)) scale(0)`, opacity: 0 },
        ],
        { duration: 2000, delay: 200 + Math.random() * 600, easing: 'cubic-bezier(.2,.8,.4,1)', fill: 'forwards' }
      )
      container.appendChild(s)
    }
  }, [])

  return (
    <div className="we-bloom">
      <div className="we-ap">
        {Array.from({ length: N }, (_, i) => (
          <div
            key={i}
            className="we-ap-blade"
            style={{ transform: `translate(-50%,-50%) rotate(${i * (360 / N)}deg)` }}
          />
        ))}
      </div>
      <div className="we-particles" ref={particlesRef} />
    </div>
  )
}

// ── Effect 5: Light Painting ─────────────────────────────────────────────
function LightPaint() {
  const dotRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const path = document.querySelector('.we-lp-path')
    if (!dot || !path) return
    try {
      const len = path.getTotalLength()
      const startTime = performance.now()
      const tick = (now) => {
        const t = Math.min((now - startTime) / 2400, 1)
        const pt = path.getPointAtLength(t * len)
        const svg = path.closest('svg')
        const box = svg.getBoundingClientRect()
        dot.style.left = box.left + pt.x * (box.width / 800) + 'px'
        dot.style.top  = box.top  + pt.y * (box.height / 300) + 'px'
        if (t < 1 && document.body.contains(dot)) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    } catch (_) {}
  }, [])

  return (
    <div className="we-lightpaint">
      <svg className="we-lp-svg" viewBox="0 0 800 300">
        <defs>
          <linearGradient id="we-lpGrad" x1="0" x2="1">
            <stop offset="0"  stopColor="#c4b5fd" />
            <stop offset=".5" stopColor="#8B5CF6" />
            <stop offset="1"  stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path
          className="we-lp-draw we-lp-path"
          style={{ '--len': 1800 }}
          d="M 40 180 Q 60 90 120 100 T 180 140 Q 210 180 250 150 Q 280 130 260 100 Q 240 70 200 90
             M 300 170 Q 320 110 360 120 T 410 150
             M 450 100 Q 440 180 480 170 Q 520 160 510 110 Q 500 60 470 80 Q 440 100 470 160
             M 550 160 Q 570 90 610 100 T 660 150
             M 700 60 Q 690 180 730 170 Q 770 160 760 110"
        />
      </svg>
      <div className="we-lp-dot" ref={dotRef} />
      <div className="we-lp-caption">LONG EXPOSURE · 15S · F/8</div>
    </div>
  )
}

// ── Orchestrator ─────────────────────────────────────────────────────────
export default function WelcomeEffect() {
  const [effect, setEffect] = useState(null)
  const hasRun = useRef(false)

  useEffect(() => {
    // Guard against StrictMode double-invoke in development
    if (hasRun.current) return
    hasRun.current = true
    if (localStorage.getItem(STORAGE_KEY)) return
    setEffect('shutter')
    const timer = setTimeout(() => {
      setEffect(null)
      localStorage.setItem(STORAGE_KEY, '1')
    }, DURATIONS.shutter)
    return () => clearTimeout(timer)
  }, [])

  if (!effect) return null

  return (
    <div className="we-overlay" aria-hidden="true">
      {effect === 'shutter' && <Shutter />}
      {effect === 'flash'   && <Flash />}
      {effect === 'film'    && <Film />}
      {effect === 'bloom'   && <Bloom />}
      {effect === 'light'   && <LightPaint />}
    </div>
  )
}
