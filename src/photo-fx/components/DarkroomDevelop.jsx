import { useEffect } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './DarkroomDevelop.css'

export default function DarkroomDevelop({ children, sound = true, duration = 1600 }) {
  const sfx = useShutterSound(sound)
  useEffect(() => { sfx.film(0.2) }, [sfx])
  return (
    <div className="pf-dev" style={{ '--pf-dur': duration + 'ms' }}>
      <div className="pf-dev__inner">{children}</div>
      <div className="pf-dev__chem" aria-hidden />
    </div>
  )
}
