import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatIcon, CalendarIcon, ClipboardIcon, CameraIcon, BellIcon } from './Icons'
import './NotificationBell.css'

import { API_URL } from '../config.js'

const API = API_URL

const TYPE_ICONS = {
  message: <ChatIcon />,
  booking_request: <CalendarIcon />,
  booking_update: <ClipboardIcon />,
  review: '⭐',
  application: <CameraIcon />,
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell({ token }) {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)

  const fetchCount = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const { count } = await res.json()
        setCount(count)
      }
    } catch { /* ignore */ }
  }, [token])

  const fetchNotifications = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setNotifications(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [token])

  // Poll unread count every 30s
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(v => !v)
    if (!open) fetchNotifications()
  }

  const markAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setCount(0)
    } catch { /* ignore */ }
  }

  const handleClick = async (n) => {
    if (!n.read) {
      await fetch(`${API}/notifications/${n.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      setCount(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  if (!token) return null

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button className="notif-bell-btn" onClick={handleOpen} aria-label="Notifications">
        <BellIcon />
        {count > 0 && (
          <span className="notif-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="notif-dropdown-header">
              <span className="notif-dropdown-title">Notifications</span>
              {count > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
              )}
            </div>

            <div className="notif-list">
              {loading ? (
                <div className="notif-status">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="notif-status">No notifications yet.</div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    className={`notif-item ${n.read ? 'notif-item--read' : ''}`}
                    onClick={() => handleClick(n)}
                  >
                    <span className="notif-icon">{TYPE_ICONS[n.type] ?? <BellIcon />}</span>
                    <div className="notif-content">
                      <span className="notif-item-title">{n.title}</span>
                      {n.body && <span className="notif-body">{n.body}</span>}
                      <span className="notif-time">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.read && <span className="notif-dot" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
