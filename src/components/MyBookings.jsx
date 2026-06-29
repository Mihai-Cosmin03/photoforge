import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { PhoneIcon, DeviceIcon, ClockIcon, CalendarIcon, PinIcon } from './Icons'
import './MyBookings.css'

import { API_URL } from '../config.js'

const API = API_URL

const STATUS_LABELS = { pending: 'Pending', accepted: 'Accepted', rejected: 'Declined' }
const STATUS_CLASS  = { pending: 'booking-badge--pending', accepted: 'booking-badge--accepted', rejected: 'booking-badge--rejected' }

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyBookings({ token, isPhotographer }) {
  const toast = useToast()
  const [tab, setTab] = useState('mine')
  const [bookings, setBookings] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [notes, setNotes] = useState({})          // { [bookingId]: noteText }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const headers = { Authorization: `Bearer ${token}` }
    const fetches = [fetch(`${API}/bookings/mine`, { headers }).then(r => r.ok ? r.json() : [])]
    if (isPhotographer) {
      fetches.push(fetch(`${API}/bookings/requests`, { headers }).then(r => r.ok ? r.json() : []))
    }
    Promise.all(fetches).then(([mine, reqs = []]) => {
      setBookings(mine)
      setRequests(reqs)
    }).catch(() => toast.error('Failed to load bookings.')).finally(() => setLoading(false))
  }, [token, isPhotographer])

  const updateStatus = async (id, status) => {
    setActing(id)
    const note = notes[id] || ''
    try {
      const res = await fetch(`${API}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note }),
      })
      if (!res.ok) throw new Error()
      setRequests(prev => prev.map(b => b.id === id ? { ...b, status, photographerNote: note } : b))
      setNotes(prev => { const n = { ...prev }; delete n[id]; return n })
      toast.success(`Booking ${status === 'accepted' ? 'accepted' : 'declined'}.`)
    } catch { toast.error('Failed to update booking.') }
    finally { setActing(null) }
  }

  const list = tab === 'mine' ? bookings : requests

  return (
    <div className="my-bookings">
      {isPhotographer && (
        <div className="my-bookings-tabs">
          <button className={`my-bookings-tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
            My Requests ({bookings.length})
          </button>
          <button className={`my-bookings-tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
            Incoming Requests ({requests.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="my-bookings-list">
          {[1,2].map(i => <div key={i} className="skeleton my-booking-skeleton" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>{tab === 'mine' ? 'Visit a photographer and click "Book Session" to get started.' : 'No booking requests received yet.'}</p>
        </div>
      ) : (
        <div className="my-bookings-list">
          {list.map(b => (
            <div key={b.id} className="my-booking-card">
              <div className="my-booking-main">
                <div className="my-booking-who">
                  {tab === 'mine' ? (
                    <Link to={`/photographers/${b.photographer?.slug}`} className="my-booking-name">
                      {b.photographer?.name ?? 'Photographer'}
                    </Link>
                  ) : (
                    <span className="my-booking-name">{b.user?.name ?? 'Client'}</span>
                  )}
                  <span className={`my-booking-type ${b.type === 'consultation' ? 'my-booking-type--call' : ''}`}>
                    {b.type === 'consultation' ? <><PhoneIcon /> Intro Call</> : b.type}
                  </span>
                </div>
                {b.type === 'consultation' ? (
                  <div className="my-booking-details">
                    {b.consultationPlatform && <span><DeviceIcon /> {b.consultationPlatform}</span>}
                    {b.preferredTime && <span><ClockIcon /> {b.preferredTime}</span>}
                    {b.date && <span><CalendarIcon /> {formatDate(b.date)}</span>}
                  </div>
                ) : (
                  <div className="my-booking-details">
                    <span><CalendarIcon /> {formatDate(b.date)}</span>
                    {b.location && <span><PinIcon /> {b.location}</span>}
                  </div>
                )}
                {b.message && <p className="my-booking-message">"{b.message}"</p>}
                {/* Show photographer's reply note on the client side */}
                {tab === 'mine' && b.photographerNote && (
                  <p className="my-booking-note">
                    <span className="my-booking-note__label">Photographer's reply:</span>
                    {b.photographerNote}
                  </p>
                )}
              </div>
              <div className="my-booking-status-wrap">
                <span className={`booking-badge ${STATUS_CLASS[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
                {tab === 'requests' && b.status === 'pending' && (
                  <div className="my-booking-respond">
                    <textarea
                      className="my-booking-note-input"
                      placeholder="Optional message to client (reason, details…)"
                      rows={2}
                      value={notes[b.id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [b.id]: e.target.value }))}
                    />
                    <div className="my-booking-actions">
                      <button
                        className="btn-primary btn-sm"
                        disabled={acting === b.id}
                        onClick={() => updateStatus(b.id, 'accepted')}
                      >✓ Accept</button>
                      <button
                        className="btn-ghost btn-sm"
                        disabled={acting === b.id}
                        onClick={() => updateStatus(b.id, 'rejected')}
                      >✕ Decline</button>
                    </div>
                  </div>
                )}
                {/* Show note sent with the decision */}
                {tab === 'requests' && b.status !== 'pending' && b.photographerNote && (
                  <p className="my-booking-note my-booking-note--sent">
                    <span className="my-booking-note__label">Your reply:</span>
                    {b.photographerNote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
