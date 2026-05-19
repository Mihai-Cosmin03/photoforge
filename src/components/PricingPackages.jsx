import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import './PricingPackages.css'

import { API_URL } from '../config.js'

const API = API_URL
const CURRENCIES = ['RON', 'EUR', 'USD']
const DURATIONS = ['30 min', '1h', '2h', '3h', 'Half day', 'Full day']

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

function toArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  return val.split(',').map(s => s.trim()).filter(Boolean)
}

function PackageCard({ pkg, isOwner, onDelete, onEdit, index }) {
  const features = toArray(pkg.features)
  const coverImages = toArray(pkg.coverImages)

  return (
    <motion.div
      key={pkg.id}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      className={`pkg-card ${pkg.highlighted ? 'pkg-card--highlighted' : ''}`}
    >
      {pkg.highlighted && (
        <div className="pkg-card__badge">⭐ Most Popular</div>
      )}

      {/* Sample images strip */}
      {coverImages.length > 0 && (
        <div className="pkg-card__images">
          {coverImages.slice(0, 3).map((url, i) => (
            <img key={i} src={url} alt="" className="pkg-card__sample-img" />
          ))}
          {coverImages.length > 3 && (
            <div className="pkg-card__images-more">+{coverImages.length - 3}</div>
          )}
        </div>
      )}

      <div className="pkg-card__header">
        <h3 className="pkg-card__name">{pkg.name}</h3>
        {isOwner && (
          <div className="pkg-card__actions">
            <button className="pkg-card__edit-btn" onClick={() => onEdit(pkg)}>Edit</button>
            <button className="pkg-card__delete-btn" onClick={() => onDelete(pkg.id)}>✕</button>
          </div>
        )}
      </div>

      <div className="pkg-card__price-block">
        <span className="pkg-card__price">{Number(pkg.price).toLocaleString()}</span>
        <span className="pkg-card__currency">{pkg.currency}</span>
      </div>

      {(pkg.duration || pkg.maxPhotos) && (
        <div className="pkg-card__chips">
          {pkg.duration && <span className="pkg-chip">🕐 {pkg.duration}</span>}
          {pkg.maxPhotos > 0 && <span className="pkg-chip">📷 Up to {pkg.maxPhotos} photos</span>}
        </div>
      )}

      {pkg.description && <p className="pkg-card__desc">{pkg.description}</p>}

      {features.length > 0 && (
        <ul className="pkg-card__features">
          {features.map((feat, i) => (
            <li key={i} className="pkg-card__feature">
              <span className="pkg-card__feature-bullet" aria-hidden="true">✓</span>
              {feat}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

const EMPTY_FORM = {
  name: '', price: '', currency: 'RON', description: '',
  features: '', duration: '', maxPhotos: '', highlighted: false, coverImages: '',
}

function buildFormFromPkg(pkg) {
  return {
    name: pkg.name || '',
    price: pkg.price?.toString() || '',
    currency: pkg.currency || 'RON',
    description: pkg.description || '',
    features: toArray(pkg.features).join('\n'),
    duration: pkg.duration || '',
    maxPhotos: pkg.maxPhotos?.toString() || '',
    highlighted: pkg.highlighted || false,
    coverImages: toArray(pkg.coverImages).join('\n'),
  }
}

function PackageForm({ initial = EMPTY_FORM, submitLabel, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleField = (e) => {
    const { name, value, type, checked } = e.target
    set(name, type === 'checkbox' ? checked : value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form className="pricing__form" onSubmit={handleSubmit} noValidate>
      <div className="pricing__form-row pricing__form-row--2col">
        <div className="pricing__field">
          <label className="pricing__label" htmlFor="pkg-name">Package name *</label>
          <input id="pkg-name" name="name" type="text" className="pricing__input"
            placeholder="e.g. Gold Package" value={form.name} onChange={handleField} disabled={submitting} />
        </div>
        <div className="pricing__field">
          <label className="pricing__label" htmlFor="pkg-price">Price *</label>
          <div className="pricing__price-row">
            <input id="pkg-price" name="price" type="number" min="0" step="any" className="pricing__input"
              placeholder="500" value={form.price} onChange={handleField} disabled={submitting} />
            <select name="currency" className="pricing__select" value={form.currency}
              onChange={handleField} disabled={submitting} aria-label="Currency">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="pricing__form-row pricing__form-row--2col">
        <div className="pricing__field">
          <label className="pricing__label" htmlFor="pkg-duration">Duration</label>
          <select id="pkg-duration" name="duration" className="pricing__select pricing__select--full"
            value={form.duration} onChange={handleField} disabled={submitting}>
            <option value="">— Select duration —</option>
            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="pricing__field">
          <label className="pricing__label" htmlFor="pkg-maxphotos">Max edited photos</label>
          <input id="pkg-maxphotos" name="maxPhotos" type="number" min="0" className="pricing__input"
            placeholder="e.g. 30" value={form.maxPhotos} onChange={handleField} disabled={submitting} />
        </div>
      </div>

      <div className="pricing__field">
        <label className="pricing__label" htmlFor="pkg-desc">Short description</label>
        <input id="pkg-desc" name="description" type="text" className="pricing__input"
          placeholder="What's included in a sentence" value={form.description}
          onChange={handleField} disabled={submitting} />
      </div>

      <div className="pricing__field">
        <label className="pricing__label" htmlFor="pkg-features">
          Features <span className="pricing__label-hint">(one per line)</span>
        </label>
        <textarea id="pkg-features" name="features" className="pricing__textarea"
          placeholder={"2-hour session\nEdited digital files\nOnline gallery"}
          rows={4} value={form.features} onChange={handleField} disabled={submitting} />
      </div>

      <div className="pricing__field">
        <label className="pricing__label" htmlFor="pkg-images">
          Sample image URLs <span className="pricing__label-hint">(one per line — paste from your portfolios)</span>
        </label>
        <textarea id="pkg-images" name="coverImages" className="pricing__textarea"
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
          rows={3} value={form.coverImages} onChange={handleField} disabled={submitting} />
      </div>

      <div className="pricing__field pricing__field--check">
        <label className="pricing__check-label">
          <input type="checkbox" name="highlighted" checked={form.highlighted}
            onChange={handleField} disabled={submitting} className="pricing__check" />
          <span>Mark as <strong>Most Popular</strong> (shows highlighted badge)</span>
        </label>
      </div>

      <div className="pricing__form-actions">
        <button type="submit" className="pricing__submit-btn" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="pricing__cancel-btn"
          onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function PricingPackages({ photographerSlug, token, isOwner }) {
  const toast = useToast()
  const [packages, setPackages]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPkg, setEditingPkg]   = useState(null)
  const [submitting, setSubmitting]   = useState(false)

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/packages`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPackages(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load packages.')
    } finally {
      setLoading(false)
    }
  }, [photographerSlug])

  useEffect(() => { fetchPackages() }, [fetchPackages])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      toast.success('Package deleted.')
      setPackages(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Could not delete package.')
    }
  }

  const buildPayload = (form) => ({
    name: form.name.trim(),
    price: Number(form.price),
    currency: form.currency,
    description: form.description.trim(),
    features: form.features.split('\n').map(f => f.trim()).filter(Boolean).join(', '),
    duration: form.duration || null,
    maxPhotos: form.maxPhotos ? Number(form.maxPhotos) : null,
    highlighted: form.highlighted,
    coverImages: form.coverImages.split('\n').map(u => u.trim()).filter(Boolean).join(', '),
  })

  const handleAdd = async (form) => {
    if (!form.name.trim()) { toast.warning('Package name is required.'); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.warning('Enter a valid price.'); return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildPayload(form)),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error')
      toast.success('Package added!')
      setShowAddForm(false)
      await fetchPackages()
    } catch (err) {
      toast.error(err.message || 'Could not add package.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (form) => {
    if (!form.name.trim()) { toast.warning('Package name is required.'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/packages/${editingPkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildPayload(form)),
      })
      if (!res.ok) throw new Error()
      toast.success('Package updated.')
      setEditingPkg(null)
      await fetchPackages()
    } catch {
      toast.error('Could not update package.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="pricing">
      <div className="pricing__header">
        <div>
          <span className="section-eyebrow">Services</span>
          <h2 className="pricing__title">Packages &amp; Pricing</h2>
        </div>
        {isOwner && !showAddForm && !editingPkg && (
          <button className="pricing__add-btn" onClick={() => setShowAddForm(true)}>
            + Add Package
          </button>
        )}
      </div>

      {loading && (
        <div className="pricing__grid">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="pkg-card pkg-card--skeleton" />
          ))}
        </div>
      )}

      {error && !loading && <p className="pricing__error">{error}</p>}

      {!loading && !error && packages.length === 0 && !showAddForm && (
        <p className="pricing__empty">
          {isOwner ? 'No packages yet. Add your first one!' : 'No packages listed yet.'}
        </p>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="pricing__grid">
          <AnimatePresence>
            {packages.map((pkg, i) => (
              editingPkg?.id === pkg.id ? (
                <motion.div
                  key={`edit-${pkg.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pricing__form-wrapper pricing__form-wrapper--edit"
                >
                  <h3 className="pricing__form-title">Edit: {pkg.name}</h3>
                  <PackageForm
                    initial={buildFormFromPkg(pkg)}
                    submitLabel="Save Changes"
                    onSubmit={handleEdit}
                    onCancel={() => setEditingPkg(null)}
                    submitting={submitting}
                  />
                </motion.div>
              ) : (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  index={i}
                  isOwner={isOwner}
                  onDelete={handleDelete}
                  onEdit={(p) => { setShowAddForm(false); setEditingPkg(p) }}
                />
              )
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Package Form */}
      <AnimatePresence>
        {isOwner && showAddForm && (
          <motion.div
            className="pricing__form-wrapper"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <h3 className="pricing__form-title">New Package</h3>
            <PackageForm
              initial={EMPTY_FORM}
              submitLabel="Add Package"
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              submitting={submitting}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
