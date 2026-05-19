import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './Toast.css'

const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, { type = 'info', duration = 3500 } = {}) => {
      const id = ++_id
      setToasts((prev) => [...prev, { id, message, type, duration }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  // Convenience wrappers
  toast.success = (msg, opts) => toast(msg, { type: 'success', ...opts })
  toast.error   = (msg, opts) => toast(msg, { type: 'error',   duration: 5000, ...opts })
  toast.info    = (msg, opts) => toast(msg, { type: 'info',    ...opts })
  toast.warning = (msg, opts) => toast(msg, { type: 'warning', ...opts })

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="toast-viewport" aria-live="polite" aria-label="Notifications">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                exit={{    opacity: 0, y: -12, scale: 0.94, transition: { duration: 0.2,  ease: [0.4, 0, 1, 1] } }}
                className={`toast toast--${t.type}`}
                role="alert"
              >
                <span className="toast__icon">{ICONS[t.type]}</span>
                <span className="toast__message">{t.message}</span>
                <button
                  className="toast__close"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
                <div className="toast__progress-track">
                  <div
                    className="toast__progress-fill"
                    style={{ animationDuration: `${t.duration}ms` }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
