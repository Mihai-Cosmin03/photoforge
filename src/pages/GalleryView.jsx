import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SearchIcon, HourglassIcon, WarningIcon, LockIcon } from '../components/Icons'
import { API_URL } from '../config.js'
import './GalleryView.css'

const API = API_URL

export default function GalleryView() {
  const { code } = useParams()
  const { user } = useAuth()

  const [gallery, setGallery] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | forbidden | expired | notfound | error
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [lightbox, setLightbox] = useState(null) // index of open image

  const fetchGallery = useCallback(async (email) => {
    setStatus('loading')
    try {
      const url = new URL(`${API}/galleries/view/${code}`)
      if (email) url.searchParams.set('email', email)
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setGallery(data)
        setStatus('ok')
      } else if (res.status === 403) {
        setStatus('forbidden')
      } else if (res.status === 410) {
        setStatus('expired')
      } else if (res.status === 404) {
        setStatus('notfound')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }, [code])

  useEffect(() => {
    // Auto-try with logged-in user's email
    fetchGallery(user?.email || '')
  }, [fetchGallery, user?.email])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!emailInput.trim()) { setEmailError('Please enter your email address.'); return }
    setEmailError('')
    fetchGallery(emailInput.trim())
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return
    const images = gallery?.images?.filter(Boolean) ?? []
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, gallery])

  if (status === 'loading') {
    return (
      <div className="gallery-view gallery-view--centered">
        <div className="gallery-view__spinner" />
        <p className="gallery-view__hint">Loading gallery…</p>
      </div>
    )
  }

  if (status === 'notfound') {
    return (
      <div className="gallery-view gallery-view--centered">
        <div className="gallery-view__icon"><SearchIcon /></div>
        <h2 className="gallery-view__heading">Gallery not found</h2>
        <p className="gallery-view__hint">This link may have been removed or is incorrect.</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="gallery-view gallery-view--centered">
        <div className="gallery-view__icon"><HourglassIcon /></div>
        <h2 className="gallery-view__heading">Gallery has expired</h2>
        <p className="gallery-view__hint">This gallery is no longer available. Please contact your photographer.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="gallery-view gallery-view--centered">
        <div className="gallery-view__icon"><WarningIcon /></div>
        <h2 className="gallery-view__heading">Something went wrong</h2>
        <p className="gallery-view__hint">Please try again later.</p>
      </div>
    )
  }

  if (status === 'forbidden') {
    return (
      <div className="gallery-view gallery-view--centered">
        <div className="gallery-view__gate">
          <div className="gallery-view__icon"><LockIcon /></div>
          <h2 className="gallery-view__heading">Private Gallery</h2>
          <p className="gallery-view__hint">
            This gallery is restricted. Enter the email address your photographer shared this with.
          </p>
          <form onSubmit={handleEmailSubmit} className="gallery-view__email-form">
            <input
              type="email"
              className="gallery-view__email-input"
              placeholder="your@email.com"
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setEmailError('') }}
              autoFocus
            />
            {emailError && <span className="gallery-view__email-error">{emailError}</span>}
            <button type="submit" className="btn-primary">View Gallery</button>
          </form>
        </div>
      </div>
    )
  }

  const images = Array.isArray(gallery?.images) ? gallery.images.filter(Boolean) : []
  const ph = gallery?.photographer

  return (
    <div className="gallery-view">
      {/* Lightbox */}
      {lightbox !== null && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="gallery-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
          <button
            className="gallery-lightbox__nav gallery-lightbox__nav--prev"
            onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + images.length) % images.length) }}
          >‹</button>
          <img
            src={images[lightbox]}
            alt=""
            className="gallery-lightbox__img"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="gallery-lightbox__nav gallery-lightbox__nav--next"
            onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % images.length) }}
          >›</button>
          <span className="gallery-lightbox__counter">{lightbox + 1} / {images.length}</span>
        </div>
      )}

      <div className="page-container">
        {/* Header */}
        <div className="gallery-view__header">
          <div className="gallery-view__badge">Private Gallery</div>
          <h1 className="gallery-view__title">{gallery.title}</h1>
          {gallery.description && (
            <p className="gallery-view__desc">{gallery.description}</p>
          )}
          {ph && (
            <p className="gallery-view__by">
              by <strong>{ph.displayName || ph.name || 'Photographer'}</strong>
              {ph.city ? ` · ${ph.city}` : ''}
            </p>
          )}
          <p className="gallery-view__count">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Photo Grid */}
        {images.length === 0 ? (
          <div className="empty-state">
            <h3>No photos yet</h3>
            <p>Your photographer hasn't added photos to this gallery yet.</p>
          </div>
        ) : (
          <div className="gallery-view__grid">
            {images.map((url, i) => (
              <button
                key={i}
                className="gallery-view__thumb"
                onClick={() => setLightbox(i)}
                aria-label={`Open photo ${i + 1}`}
              >
                <img src={url} alt="" className="gallery-view__thumb-img" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
