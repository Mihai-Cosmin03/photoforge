import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyPhotographerProfile, applyAsPhotographer } from '../services/profileService'
import './PhotographerApplication.css'

const SPECIALTIES = [
  'wedding', 'portraits', 'fashion', 'concerts',
  'events', 'commercial', 'travel', 'lifestyle',
]

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function PhotographerApplication() {
  const { user, token } = useAuth()
  const toast = useToast()

  const [profile, setProfile]           = useState(undefined) // undefined = loading
  const [submitting, setSubmitting]     = useState(false)
  const [showForm, setShowForm]         = useState(false)

  // Form state
  const [city, setCity]                 = useState('')
  const [bio, setBio]                   = useState('')
  const [experience, setExperience]     = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState([])

  useEffect(() => {
    if (!token) { setProfile(null); return }
    getMyPhotographerProfile(token).then(setProfile).catch(() => setProfile(null))
  }, [token])

  const toggleSpec = (s) =>
    setSelectedSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!city.trim())              return toast.error('City is required.')
    if (!bio.trim())               return toast.error('Bio is required.')
    if (!experience || +experience < 1) return toast.error('Enter valid years of experience.')
    if (selectedSpecs.length === 0) return toast.error('Select at least one specialty.')

    setSubmitting(true)
    try {
      const result = await applyAsPhotographer(token, {
        name:        user.name,
        slug:        slugify(user.name) + '-' + Date.now().toString(36),
        city:        city.trim(),
        bio:         bio.trim(),
        experience:  +experience,
        specialties: selectedSpecs,
      })
      setProfile(result)
      setShowForm(false)
      toast.success('Application submitted! We\'ll review it shortly.')
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (profile === undefined) return null

  // ── Already applied or approved ─────────────────────────────────────
  if (profile) {
    const isApproved = profile.status === 'approved'
    return (
      <motion.div
        className={`ph-app-status ph-app-status--${profile.status}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="ph-app-status__icon">
          {isApproved ? '✓' : '⏳'}
        </div>
        <div className="ph-app-status__text">
          <h3 className="ph-app-status__title">
            {isApproved ? 'Verified Photographer' : 'Application Under Review'}
          </h3>
          <p className="ph-app-status__desc">
            {isApproved
              ? 'Your profile is live on the platform. Clients can discover your work.'
              : 'Your application has been submitted. Our team will review it soon.'}
          </p>
          {isApproved && (
            <Link
              to={`/photographers/${profile.slug}`}
              className="btn-primary"
              style={{ display: 'inline-flex', marginTop: 'var(--space-3)' }}
            >
              View My Profile →
            </Link>
          )}
        </div>
      </motion.div>
    )
  }

  // ── No application yet ───────────────────────────────────────────────
  return (
    <div className="ph-app-section">
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="cta"
            className="ph-app-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="ph-app-cta__icon">📷</div>
            <h3 className="ph-app-cta__title">Are you a photographer?</h3>
            <p className="ph-app-cta__desc">
              Join our platform as a verified photographer. Showcase your portfolio,
              get discovered by clients, and allow them to use your photos for premium print materials.
            </p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Apply as Photographer
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="ph-app-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="ph-app-form__title">Photographer Application</h3>

            <div className="ph-app-form__field">
              <label className="ph-app-form__label">Full Name</label>
              <input
                className="ph-app-form__input ph-app-form__input--readonly"
                value={user.name}
                readOnly
              />
            </div>

            <div className="ph-app-form__field">
              <label className="ph-app-form__label">City *</label>
              <input
                className="ph-app-form__input"
                placeholder="e.g. București"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="ph-app-form__field">
              <label className="ph-app-form__label">Years of Experience *</label>
              <input
                className="ph-app-form__input"
                type="number"
                min="1"
                max="50"
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className="ph-app-form__field">
              <label className="ph-app-form__label">Bio *</label>
              <textarea
                className="ph-app-form__textarea"
                placeholder="Tell us about your style, experience and what makes your work unique…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="ph-app-form__field">
              <label className="ph-app-form__label">Specialties * (select all that apply)</label>
              <div className="ph-app-specs">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`ph-app-spec-pill ${selectedSpecs.includes(s) ? 'ph-app-spec-pill--active' : ''}`}
                    onClick={() => toggleSpec(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="ph-app-form__actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
