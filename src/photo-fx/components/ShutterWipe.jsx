import { useEffect } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './ShutterWipe.css'

const N = 8

export default function ShutterWipe({ show, onComplete, sound = true }) {
  const sfx = useShutterSound(sound)

  useEffect(() => {
    if (!show) return
    sfx.shutter()
    const t = setTimeout(() => onComplete?.(), 1800)
    return () => clearTimeout(t)
  }, [show, sfx, onComplete])

  if (!show) return null

  return (
    <div className="pf-shutter" role="presentation" aria-hidden="true">
      <div className="pf-shutter__iris">
        {Array.from({ length: N }, (_, i) => (
          <div
            key={i}
            className="pf-shutter__blade"
            style={{ '--rot': `${i * (360 / N)}deg` }}
          />
        ))}
      </div>
      <div className="pf-shutter__ring" />
      <div className="pf-shutter__readout">f/1.4 · 1/250s · ISO 400</div>
    </div>
  )
}
