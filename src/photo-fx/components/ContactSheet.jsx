import { Children, useEffect, useState } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './ContactSheet.css'

export default function ContactSheet({ children, stagger = 80, sound = true }) {
  const [ready, setReady] = useState(false)
  const sfx = useShutterSound(sound)

  useEffect(() => {
    requestAnimationFrame(() => setReady(true))
    sfx.film(0.15)
  }, [sfx])

  return (
    <div className="pf-contact">
      {Children.toArray(children).map((child, i) => (
        <div
          key={i}
          className="pf-contact__cell"
          style={ready ? { animationDelay: `${i * stagger}ms` } : { opacity: 0 }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
