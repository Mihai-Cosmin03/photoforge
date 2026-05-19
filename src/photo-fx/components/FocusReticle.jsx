import { useState, useRef } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './FocusReticle.css'

export default function FocusReticle({ children, sound = true, label = 'AF-LOCK' }) {
  const [focused, setFocused] = useState(false)
  const lockedRef = useRef(false)
  const sfx = useShutterSound(sound)

  const handleEnter = () => {
    setFocused(true)
    if (!lockedRef.current) {
      lockedRef.current = true
      sfx.beep()
    }
  }

  const handleLeave = () => {
    setFocused(false)
    lockedRef.current = false
  }

  return (
    <div
      className={`pf-focus${focused ? ' is-locked' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      <span className="pf-focus__corner pf-focus__corner--tl" aria-hidden="true" />
      <span className="pf-focus__corner pf-focus__corner--tr" aria-hidden="true" />
      <span className="pf-focus__corner pf-focus__corner--bl" aria-hidden="true" />
      <span className="pf-focus__corner pf-focus__corner--br" aria-hidden="true" />
      <span className="pf-focus__label" aria-hidden="true">{label}</span>
    </div>
  )
}
