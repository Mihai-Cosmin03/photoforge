import { useEffect } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './FlashCut.css'

export default function FlashCut({ show, onComplete, sound = true }) {
  const sfx = useShutterSound(sound)
  useEffect(() => {
    if (!show) return
    sfx.flash()
    const t = setTimeout(() => onComplete?.(), 450)
    return () => clearTimeout(t)
  }, [show, sfx, onComplete])

  if (!show) return null
  return <div className="pf-flash" aria-hidden="true" />
}
