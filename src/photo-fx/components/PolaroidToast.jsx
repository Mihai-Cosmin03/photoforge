import { useState, useCallback } from 'react'
import { useShutterSound } from '../hooks/useShutterSound'
import './PolaroidToast.css'

let _id = 0

export function usePolaroidToast({ sound = true, duration = 4200 } = {}) {
  const [items, setItems] = useState([])
  const sfx = useShutterSound(sound)

  const show = useCallback(({ title = '', body = '', color = '#8B5CF6', icon = null } = {}) => {
    const id = ++_id
    sfx.shutter()
    setItems(p => [...p, { id, title, body, color, icon, duration }])
    setTimeout(() => setItems(p => p.filter(x => x.id !== id)), duration + 500)
  }, [sfx, duration])

  function Toasts() {
    return (
      <div className="pf-toasts" aria-live="polite">
        {items.map(item => (
          <div
            key={item.id}
            className="pf-toast"
            style={{ '--pf-toast-dur': item.duration + 'ms' }}
          >
            <div
              className="pf-toast__img"
              style={{ background: `linear-gradient(135deg, ${item.color}, #4c1d95)` }}
            >
              {item.icon && <span className="pf-toast__icon">{item.icon}</span>}
            </div>
            <div className="pf-toast__text">
              {item.title && <div className="pf-toast__title">{item.title}</div>}
              {item.body  && <div className="pf-toast__body">{item.body}</div>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return { show, Toasts }
}

export default usePolaroidToast
