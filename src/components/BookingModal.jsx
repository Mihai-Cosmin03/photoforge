import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import SelfTimer from '../photo-fx/components/SelfTimer'
import './BookingModal.css'

import { API_URL } from '../config.js'

const API = API_URL

const SESSION_TYPES = ['Portrait', 'Wedding', 'Event', 'Fashion', 'Newborn', 'Commercial', 'Other']
const PLATFORMS = ['Google Meet', 'Zoom', 'WhatsApp', 'Phone Call']
const TIME_PREFS = ['Morning (9:00–12:00)', 'Afternoon (12:00–17:00)', 'Evening (17:00–20:00)', 'Flexible']

const today = () => new Date().toISOString().split('T')[0]

export default function BookingModal({ photographer, token, onClose, onSuccess, initialType = 'Portrait' }) {
  const toast = useToast()
  const isConsultation = initialType === 'consultation'

  const [packages, setPackages]     = useState([])
  const [form, setForm] = useState({
    date: '',
    location: '',
    type: initialType,
    packageId: '',
    consultationPlatform: 'Google Meet',
    preferredTime: 'Flexible',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown]   = useState(false)

  // Fetch photographer's packages
  useEffect(() => {
    if (isConsultation) return
    fetch(`${API}/photographers/${photographer.slug}/packages`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setPackages(Array.isArray(data) ? data : []))
      .catch(() => null)
  }, [photographer.slug, isConsultation])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedPkg = packages.find(p => p.id === Number(form.packageId))

  const doSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = isConsultation
        ? {
            type: 'consultation',
            date: form.date || null,
            consultationPlatform: form.consultationPlatform,
            preferredTime: form.preferredTime,
            message: form.message,
          }
        : {
            type: form.type,
            date: form.date,
            location: form.location,
            packageId: form.packageId ? Number(form.packageId) : null,
            message: form.message,
          }

      const res = await fetch(`${API}/bookings/${photographer.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      onSuccess?.()
      onClose()
    } catch {
      toast.error('Failed to send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isConsultation && !form.date) {
      toast.warning('Please pick a date.')
      return
    }
    setCountdown(true)
  }

  return createPortal(
    <>
      <SelfTimer show={countdown} seconds={3} onComplete={() => { setCountdown(false); doSubmit() }} />
      <AnimatePresence>
        <motion.div
          className="booking-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="booking-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <button className="booking-close" onClick={onClose} aria-label="Close">×</button>

            <div className="booking-header">
              {photographer.avatar && (
                <img src={photographer.avatar} alt={photographer.name} className="booking-avatar" />
              )}
              <div>
                <span className="booking-eyebrow">
                  {isConsultation ? 'Request an Intro Call' : 'Book a Session'}
                </span>
                <h2 className="booking-title">with {photographer.name}</h2>
                <span className="booking-city">{photographer.city}</span>
              </div>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>

              {/* ── CONSULTATION FLOW ──────────────────────── */}
              {isConsultation ? (
                <>
                  <div className="booking-consultation-intro">
                    Schedule a quick 15–30 min call to discuss your project, ask questions, and see if it's a good fit — before committing to a full session.
                  </div>

                  <div className="booking-form-grid">
                    <div className="booking-field">
                      <label className="booking-label">Preferred platform</label>
                      <div className="booking-platform-grid">
                        {PLATFORMS.map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`booking-platform-btn ${form.consultationPlatform === p ? 'booking-platform-btn--active' : ''}`}
                            onClick={() => set('consultationPlatform', p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="booking-field">
                      <label className="booking-label">Preferred time</label>
                      <select
                        className="booking-input"
                        value={form.preferredTime}
                        onChange={e => set('preferredTime', e.target.value)}
                      >
                        {TIME_PREFS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="booking-field">
                    <label className="booking-label">
                      Preferred date <span className="booking-label-hint">(optional)</span>
                    </label>
                    <input type="date" className="booking-input" min={today()}
                      value={form.date} onChange={e => set('date', e.target.value)} />
                  </div>
                </>
              ) : (
                /* ── SESSION BOOKING FLOW ────────────────── */
                <>
                  {/* Package selector */}
                  {packages.length > 0 && (
                    <div className="booking-field">
                      <label className="booking-label">Package <span className="booking-label-hint">(optional)</span></label>
                      <div className="booking-pkg-list">
                        <button
                          type="button"
                          className={`booking-pkg-opt ${!form.packageId ? 'booking-pkg-opt--active' : ''}`}
                          onClick={() => set('packageId', '')}
                        >
                          <span className="booking-pkg-opt__name">No package</span>
                          <span className="booking-pkg-opt__sub">I'll discuss later</span>
                        </button>
                        {packages.map(pkg => (
                          <button
                            key={pkg.id}
                            type="button"
                            className={`booking-pkg-opt ${Number(form.packageId) === pkg.id ? 'booking-pkg-opt--active' : ''}`}
                            onClick={() => set('packageId', pkg.id)}
                          >
                            <span className="booking-pkg-opt__name">{pkg.name}</span>
                            <span className="booking-pkg-opt__sub">
                              {Number(pkg.price).toLocaleString()} {pkg.currency}
                              {pkg.duration ? ` · ${pkg.duration}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                      {selectedPkg && (
                        <div className="booking-pkg-selected">
                          Selected: <strong>{selectedPkg.name}</strong> —{' '}
                          {Number(selectedPkg.price).toLocaleString()} {selectedPkg.currency}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="booking-form-grid">
                    <div className="booking-field">
                      <label className="booking-label">Date *</label>
                      <input type="date" className="booking-input" min={today()}
                        value={form.date} onChange={e => set('date', e.target.value)} required />
                    </div>
                    <div className="booking-field">
                      <label className="booking-label">Session Type</label>
                      <select className="booking-input" value={form.type}
                        onChange={e => set('type', e.target.value)}>
                        {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="booking-field">
                    <label className="booking-label">Location</label>
                    <input type="text" className="booking-input"
                      placeholder="e.g. Cluj-Napoca, Parcul Central"
                      value={form.location} onChange={e => set('location', e.target.value)} />
                  </div>
                </>
              )}

              {/* Message — shared by both flows */}
              <div className="booking-field">
                <label className="booking-label">
                  Message <span className="booking-label-hint">(optional)</span>
                </label>
                <textarea className="booking-input" rows={3}
                  placeholder={isConsultation
                    ? "Briefly describe your project or what you'd like to discuss…"
                    : 'Tell the photographer about your vision…'}
                  value={form.message} onChange={e => set('message', e.target.value)} />
              </div>

              <div className="booking-actions">
                <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Sending…' : isConsultation ? 'Request Call' : 'Send Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  )
}
