import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import './CameraAnimation.css'

// Light rays that shoot out from lens on shutter click
function LightRay({ angle, delay }) {
  return (
    <motion.line
      x1="160" y1="155"
      x2={160 + Math.cos((angle * Math.PI) / 180) * 80}
      y2={155 + Math.sin((angle * Math.PI) / 180) * 80}
      stroke="rgba(167,139,250,0.7)"
      strokeWidth="1.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 0], opacity: [0, 0.8, 0] }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    />
  )
}

export default function CameraAnimation() {
  const [shooting, setShooting] = useState(false)
  const [rays, setRays]         = useState([])
  const lensControls            = useAnimation()
  const shutterControls         = useAnimation()
  const bodyControls            = useAnimation()

  const shoot = async () => {
    if (shooting) return
    setShooting(true)

    // Shutter button press
    await shutterControls.start({ y: 2, transition: { duration: 0.06 } })
    shutterControls.start({ y: 0, transition: { duration: 0.12 } })

    // Body micro-recoil
    bodyControls.start({
      rotate: [-1, 0],
      y: [2, 0],
      transition: { duration: 0.3, ease: 'easeOut' },
    })

    // Lens aperture pulse
    await lensControls.start({
      scale: [1, 0.88, 1.04, 1],
      transition: { duration: 0.35, ease: 'easeInOut' },
    })

    // Shoot light rays
    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
    setRays(angles.map((a, i) => ({ angle: a, delay: i * 0.02, id: Date.now() + i })))
    setTimeout(() => setRays([]), 700)

    setTimeout(() => setShooting(false), 800)
  }


  return (
    <div className="cam-wrap" onClick={shoot} title="Click to shoot!">

      {/* Floating bob animation */}
      <motion.div
        className="cam-bob"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div animate={bodyControls}>
          <svg
            viewBox="0 0 320 230"
            className="cam-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Camera body gradient */}
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2d2b3d" />
                <stop offset="100%" stopColor="#1a1826" />
              </linearGradient>
              {/* Grip texture */}
              <linearGradient id="gripGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#141320" />
                <stop offset="100%" stopColor="#1f1d2e" />
              </linearGradient>
              {/* Lens outer */}
              <radialGradient id="lensOuter" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#2a2840" />
                <stop offset="100%" stopColor="#0f0e1a" />
              </radialGradient>
              {/* Lens glass */}
              <radialGradient id="lensGlass" cx="35%" cy="35%" r="60%">
                <stop offset="0%"   stopColor="#7c6fcd" stopOpacity="0.9" />
                <stop offset="40%"  stopColor="#3d3580" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#080714" stopOpacity="1" />
              </radialGradient>
              {/* Lens reflection */}
              <radialGradient id="lensReflect" cx="30%" cy="28%" r="45%">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.5)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              {/* Accent glow */}
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Camera body ── */}
            <rect x="40" y="80" width="240" height="130" rx="14" ry="14"
              fill="url(#bodyGrad)"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />

            {/* Grip (left bump) */}
            <rect x="30" y="88" width="32" height="114" rx="10" ry="10"
              fill="url(#gripGrad)"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />

            {/* Top plate */}
            <rect x="60" y="68" width="200" height="18" rx="6" ry="6"
              fill="#252336"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />

            {/* Mode dial */}
            <circle cx="240" cy="72" r="12" fill="#1a1826" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="240" cy="72" r="7"  fill="#2a2840" />
            <line x1="240" y1="64" x2="240" y2="68" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />

            {/* Hot shoe */}
            <rect x="155" y="63" width="50" height="8" rx="2"
              fill="#1a1826"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />

            {/* Shutter button */}
            <motion.g animate={shutterControls}>
              <circle cx="100" cy="71" r="9" fill="#3d3b50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="100" cy="71" r="5" fill="#a78bfa" filter="url(#glow)" />
            </motion.g>

            {/* Top controls */}
            <circle cx="270" cy="76" r="5" fill="#1e1c2e" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <circle cx="258" cy="76" r="4" fill="#1e1c2e" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* LCD screen on back (decorative) */}
            <rect x="180" y="100" width="80" height="55" rx="4"
              fill="#080714"
              stroke="rgba(139,92,246,0.2)"
              strokeWidth="1"
            />
            <rect x="183" y="103" width="74" height="49" rx="3" fill="#0d0c1e" />
            {/* Screen content: tiny photo grid */}
            {[0,1,2,3].map(i => (
              <rect key={i}
                x={185 + (i % 2) * 37}
                y={105 + Math.floor(i / 2) * 24}
                width="34" height="22" rx="2"
                fill={['#1a0f2e','#0f1a2e','#1a1a0f','#2e0f1a'][i]}
                opacity="0.8"
              />
            ))}

            {/* Camera strap lugs */}
            <rect x="42" y="90" width="8" height="14" rx="3" fill="#141320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <rect x="270" y="90" width="8" height="14" rx="3" fill="#141320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* AF assist lamp */}
            <circle cx="66" cy="100" r="4" fill="#ff6b35" opacity="0.6" filter="url(#glow)" />

            {/* ── Lens barrel ── */}
            {/* Outer mount ring */}
            <circle cx="160" cy="155" r="72" fill="#141220" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

            {/* Barrel rings */}
            <circle cx="160" cy="155" r="66" fill="#0f0e1a" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

            {/* Focus ring (rotating tick marks) */}
            <motion.g
              style={{ transformOrigin: '160px 155px' }}
              animate={{ rotate: shooting ? [0, 8, 0] : 360 }}
              transition={shooting
                ? { duration: 0.4, ease: 'easeInOut' }
                : { duration: 20, repeat: Infinity, ease: 'linear' }
              }
            >
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * Math.PI * 2
                const r1 = 60, r2 = 65
                return (
                  <line key={i}
                    x1={160 + Math.cos(a) * r1}
                    y1={155 + Math.sin(a) * r1}
                    x2={160 + Math.cos(a) * r2}
                    y2={155 + Math.sin(a) * r2}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={i % 4 === 0 ? 1.5 : 0.75}
                  />
                )
              })}
            </motion.g>

            {/* Zoom ring */}
            <circle cx="160" cy="155" r="56" fill="#110f20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

            {/* Lens front element */}
            <motion.g animate={lensControls} style={{ transformOrigin: '160px 155px' }}>
              {/* Main glass */}
              <circle cx="160" cy="155" r="48" fill="url(#lensOuter)" />
              <circle cx="160" cy="155" r="44" fill="url(#lensGlass)" />

              {/* Inner lens elements */}
              <circle cx="160" cy="155" r="36"
                fill="none"
                stroke="rgba(100,80,200,0.3)"
                strokeWidth="1"
              />
              <circle cx="160" cy="155" r="28"
                fill="#06050f"
                stroke="rgba(80,60,180,0.25)"
                strokeWidth="1"
              />
              <circle cx="160" cy="155" r="18"
                fill="#030210"
              />

              {/* Aperture blades (simplified) */}
              {Array.from({ length: 6 }, (_, i) => {
                const a = (i / 6) * Math.PI * 2
                return (
                  <line key={i}
                    x1={160 + Math.cos(a) * 10}
                    y1={155 + Math.sin(a) * 10}
                    x2={160 + Math.cos(a) * 18}
                    y2={155 + Math.sin(a) * 18}
                    stroke="rgba(60,40,120,0.6)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )
              })}

              {/* Glass reflection */}
              <circle cx="160" cy="155" r="44" fill="url(#lensReflect)" />

              {/* Center glow dot */}
              <motion.circle
                cx="160" cy="155" r="6"
                fill="#a78bfa"
                filter="url(#softGlow)"
                style={{ transformOrigin: '160px 155px' }}
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.83, 1.17, 0.83] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Lens coating sheen */}
              <ellipse cx="148" cy="143" rx="10" ry="6"
                fill="rgba(120,100,255,0.12)"
                transform="rotate(-30,148,143)"
              />
            </motion.g>

            {/* ── Light rays (on shoot) ── */}
            <g filter="url(#softGlow)">
              {rays.map(r => (
                <LightRay key={r.id} angle={r.angle} delay={r.delay} />
              ))}
            </g>

            {/* Brand text on lens */}
            <text
              x="160" y="215"
              textAnchor="middle"
              fill="rgba(255,255,255,0.18)"
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="2"
            >
              PHOTOFORGE
            </text>
          </svg>
        </motion.div>
      </motion.div>

      <p className="cam-hint">click to shoot</p>
    </div>
  )
}
