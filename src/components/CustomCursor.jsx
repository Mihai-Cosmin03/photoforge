import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import './CustomCursor.css'

const BLADE_COUNT = 6
const RADIUS      = 10

function ApertureBlades({ open }) {
  const blades = Array.from({ length: BLADE_COUNT }, (_, i) => {
    const angle  = (i / BLADE_COUNT) * Math.PI * 2
    const spread = open ? RADIUS : 4
    return (
      <line
        key={i}
        x1={20 + Math.cos(angle) * 4}
        y1={20 + Math.sin(angle) * 4}
        x2={20 + Math.cos(angle) * spread}
        y2={20 + Math.sin(angle) * spread}
        stroke="currentColor"
        strokeWidth={open ? '1.5' : '2.5'}
        strokeLinecap="round"
      />
    )
  })
  return blades
}

export default function CustomCursor() {
  const [open,    setOpen]    = useState(false)
  const [visible, setVisible] = useState(false)
  const [clicked, setClicked] = useState(false)

  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)

  // Smooth spring follow
  const x = useSpring(rawX, { stiffness: 500, damping: 40, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 500, damping: 40, mass: 0.4 })

  useEffect(() => {
    const onMove = (e) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onLeave  = () => setVisible(false)
    const onEnter  = () => setVisible(true)

    const onClick  = () => {
      setClicked(true)
      setTimeout(() => setClicked(false), 250)
    }

    // Open aperture on interactive elements
    const onMouseOver = (e) => {
      const target = e.target
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor-open]')
      const isImage       = target.closest('img, [data-cursor-image], .blur-img-wrap, .portfolio-card')
      setOpen(!!(isInteractive || isImage))
    }

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('click',      onClick)
    document.addEventListener('mouseover',  onMouseOver)

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('click',      onClick)
      document.removeEventListener('mouseover',  onMouseOver)
    }
  }, [visible, rawX, rawY])

  return (
    <motion.div
      className="custom-cursor"
      style={{ x, y, opacity: visible ? 1 : 0 }}
      animate={{
        scale:  clicked ? 0.65 : 1,
        rotate: open    ? 30   : 0,
      }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        {/* Outer ring */}
        <circle
          cx="20" cy="20"
          r={open ? 14 : 9}
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          style={{ transition: 'r 0.22s ease' }}
        />
        {/* Aperture blades */}
        <motion.g animate={{ opacity: 1 }}>
          <ApertureBlades open={open} />
        </motion.g>
        {/* Center dot */}
        <circle
          cx="20" cy="20" r="1.8"
          fill="currentColor"
          opacity={open ? 0.5 : 1}
        />
      </svg>
    </motion.div>
  )
}
