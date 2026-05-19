import { useEffect, useRef, useState } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './SelfTimer.css'

export default function SelfTimer({ show, seconds = 3, onComplete, sound = true }) {
  const [n, setN] = useState(seconds)
  const sfx = useShutterSound(sound)
  // Keep onComplete in a ref so the interval closure always calls the latest
  // version without needing it in the useEffect dependency array.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!show) { setN(seconds); return }
    setN(seconds)
    let cur = seconds
    sfx.tick()
    const id = setInterval(() => {
      cur -= 1
      setN(cur)
      if (cur > 0) sfx.tick()
      else { sfx.shutter(); clearInterval(id); setTimeout(() => onCompleteRef.current?.(), 350) }
    }, 1000)
    return () => clearInterval(id)
  // sfx is now stable (useMemo in useShutterSound); onComplete handled via ref
  }, [show, seconds, sfx])

  if (!show) return null

  return (
    <div className="pf-timer" aria-live="assertive">
      <div className="pf-timer__ring">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" className="pf-timer__bg" />
          <circle cx="50" cy="50" r="46" className="pf-timer__fg" key={n} />
        </svg>
        <div className="pf-timer__num" key={n}>{n > 0 ? n : '●'}</div>
      </div>
      <div className="pf-timer__label">{n > 0 ? 'SELF-TIMER' : 'CAPTURE'}</div>
    </div>
  )
}
