import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import './MyGalleries.css'

import { API_URL } from '../config.js'
const API = API_URL

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {
    const el = document.createElement('textarea')
    el.value = text; document.body.appendChild(el); el.select()
    document.execCommand('copy'); document.body.removeChild(el)
  })
}

function GalleryLink({ code }) {
  const url = `${window.location.origin}/gallery/${code}`
  const [copied, setCopied] = useState(false)
  const copy = () => {
    copyToClipboard(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="gallery-link-row">
      <span className="gallery-link-url">{url}</span>
      <button className="gallery-link-copy" onClick={copy}>
        {copied ? '✓ Copied!' : 'Copy Link'}
      </button>
    </div>
  )
}

function GalleryCard({ gallery, token, onDelete, onUpdate }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [uploadState, setUploadState] = useState(null) // null | { done, total, failed }
  const [justAdded, setJustAdded] = useState(new Set())
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const images = Array.isArray(gallery.images) ? gallery.images.filter(Boolean) : []
  const emails = Array.isArray(gallery.clientEmails) ? gallery.clientEmails.filter(Boolean) : []

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadState({ done: 0, total: files.length, failed: 0 })
    const uploaded = []
    let failed = 0
    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`${API}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (res.ok) {
          const { url } = await res.json()
          uploaded.push(url)
        } else { failed++ }
      } catch { failed++ }
      setUploadState(prev => ({ ...prev, done: prev.done + 1, failed }))
    }
    if (uploaded.length) {
      const res = await fetch(`${API}/galleries/${gallery.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ urls: uploaded }),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdate(updated)
        setJustAdded(new Set(uploaded))
        setTimeout(() => setJustAdded(new Set()), 3000)
        setUploadState({ done: files.length, total: files.length, failed, success: uploaded.length })
        setTimeout(() => setUploadState(null), 2500)
        if (failed > 0)
          toast.warning(`${uploaded.length} added, ${failed} failed to upload.`)
      } else {
        toast.error('Failed to save photos.')
        setUploadState(null)
      }
    } else {
      toast.error('All uploads failed. Check file types and sizes.')
      setUploadState(null)
    }
    e.target.value = ''
  }

  const removeImage = async (url) => {
    const res = await fetch(`${API}/galleries/${gallery.id}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url }),
    })
    if (res.ok) onUpdate(await res.json())
    else toast.error('Failed to remove photo.')
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete gallery "${gallery.title}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`${API}/galleries/${gallery.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) { onDelete(gallery.id); toast.success('Gallery deleted.') }
    else { toast.error('Failed to delete gallery.'); setDeleting(false) }
  }

  const expired = gallery.expiresAt && new Date() > new Date(gallery.expiresAt)

  return (
    <div className={`gallery-card ${expired ? 'gallery-card--expired' : ''}`}>
      {/* Header */}
      <div className="gallery-card__header">
        <div className="gallery-card__info">
          <h3 className="gallery-card__title">{gallery.title}</h3>
          <div className="gallery-card__meta">
            <span>{images.length} photo{images.length !== 1 ? 's' : ''}</span>
            {emails.length > 0 && <span>🔒 {emails.length} recipient{emails.length !== 1 ? 's' : ''}</span>}
            {expired && <span className="gallery-card__expired-badge">Expired</span>}
            {gallery.expiresAt && !expired && (
              <span>Expires {new Date(gallery.expiresAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="gallery-card__actions">
          <button className="gallery-card__expand-btn" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Collapse' : 'Manage'}
          </button>
          <button className="gallery-card__delete-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? '…' : '✕'}
          </button>
        </div>
      </div>

      {/* Share link — always visible */}
      <GalleryLink code={gallery.accessCode} />

      {/* Expandable management panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="gallery-card__body">
              {gallery.description && (
                <p className="gallery-card__desc">{gallery.description}</p>
              )}

              {emails.length > 0 && (
                <div className="gallery-card__emails">
                  <span className="gallery-card__section-label">Restricted to:</span>
                  <div className="gallery-card__email-chips">
                    {emails.map(e => <span key={e} className="gallery-card__email-chip">{e}</span>)}
                  </div>
                </div>
              )}

              {/* Photo grid */}
              {images.length > 0 && (
                <div className="gallery-card__photos">
                  {images.map((url, i) => (
                    <div
                      key={url + i}
                      className={`gallery-card__photo-wrap${justAdded.has(url) ? ' gallery-card__photo-wrap--new' : ''}`}
                    >
                      {justAdded.has(url) && <span className="gallery-card__photo-new-badge">New</span>}
                      <img src={url} alt="" className="gallery-card__photo" />
                      <button
                        className="gallery-card__photo-remove"
                        onClick={() => removeImage(url)}
                        title="Remove photo"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload photos */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleUpload}
              />

              <div className="gallery-card__upload-row">
                <button
                  className={`gallery-card__upload-btn${uploadState?.success != null ? ' gallery-card__upload-btn--success' : ''}`}
                  onClick={() => !uploadState && fileRef.current?.click()}
                  disabled={!!uploadState}
                >
                  {!uploadState && '+ Add Photos'}
                  {uploadState && !uploadState.success && (
                    <>
                      <span className="upload-spinner" />
                      Uploading {uploadState.done} / {uploadState.total}…
                    </>
                  )}
                  {uploadState?.success != null && `✓ ${uploadState.success} photo${uploadState.success !== 1 ? 's' : ''} added`}
                </button>

                {uploadState && !uploadState.success && (
                  <div className="gallery-card__upload-progress">
                    <div
                      className="gallery-card__upload-progress-bar"
                      style={{ width: `${(uploadState.done / uploadState.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const EMPTY_FORM = { title: '', description: '', clientEmails: '', expiresAt: '' }

export default function MyGalleries({ token }) {
  const toast = useToast()
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/galleries/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setGalleries(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.warning('Gallery title is required.'); return }
    setCreating(true)
    try {
      const res = await fetch(`${API}/galleries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          clientEmails: form.clientEmails.trim() || undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = errBody?.message || `Error ${res.status}`
        throw new Error(msg)
      }
      const created = await res.json()
      setGalleries(prev => [created, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Gallery created! Share the link with your client.')
    } catch (err) {
      toast.error(err?.message || 'Failed to create gallery.')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = (updated) => {
    setGalleries(prev => prev.map(g => g.id === updated.id ? updated : g))
  }
  const handleDelete = (id) => {
    setGalleries(prev => prev.filter(g => g.id !== id))
  }

  return (
    <section className="my-galleries">
      <div className="my-galleries__header">
        <div>
          <span className="section-eyebrow">Private</span>
          <h2 className="section-heading">Client Galleries</h2>
          <p className="profile-section-hint">
            Create a private gallery after each session — share a secret link with your client so only they can view their photos.
          </p>
        </div>
        {!showForm && (
          <button className="btn-primary btn-sm" onClick={() => setShowForm(true)}>
            + New Gallery
          </button>
        )}
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="gallery-create-form"
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <h3 className="gallery-create-form__title">New Client Gallery</h3>
            <form onSubmit={handleCreate} className="gallery-create-form__body">
              <div className="gallery-field">
                <label className="gallery-label">Gallery title *</label>
                <input className="gallery-input" type="text" placeholder="e.g. Ana & Mihai — Wedding 2025"
                  value={form.title} onChange={e => set('title', e.target.value)} disabled={creating} />
              </div>
              <div className="gallery-field">
                <label className="gallery-label">Description <span className="gallery-label-hint">(optional)</span></label>
                <input className="gallery-input" type="text" placeholder="A short note for your client"
                  value={form.description} onChange={e => set('description', e.target.value)} disabled={creating} />
              </div>
              <div className="gallery-field">
                <label className="gallery-label">
                  Restrict to emails <span className="gallery-label-hint">(optional — comma-separated, e.g. ana@gmail.com, mihai@gmail.com)</span>
                </label>
                <input className="gallery-input" type="text"
                  placeholder="Leave empty to allow anyone with the link"
                  value={form.clientEmails} onChange={e => set('clientEmails', e.target.value)} disabled={creating} />
              </div>
              <div className="gallery-field">
                <label className="gallery-label">
                  Expiry date <span className="gallery-label-hint">(optional — gallery becomes inaccessible after this date)</span>
                </label>
                <input className="gallery-input" type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} disabled={creating} />
              </div>
              <div className="gallery-create-form__actions">
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Gallery'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery list */}
      {loading ? (
        <div className="my-galleries__skeletons">
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 12 }} />)}
        </div>
      ) : galleries.length === 0 && !showForm ? (
        <div className="empty-state">
          <h3>No galleries yet</h3>
          <p>After a session, create a private gallery and share the link with your client.</p>
        </div>
      ) : (
        <div className="my-galleries__list">
          {galleries.map(g => (
            <GalleryCard
              key={g.id}
              gallery={g}
              token={token}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </section>
  )
}
