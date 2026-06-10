import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config.js'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getMyPortfolios,
  createPortfolio,
  uploadImage,
  addImageToPortfolio,
  deletePortfolioImage,
  reorderPortfolioImages,
  setCoverImage,
} from '../services/uploadService'
import { getMyPhotographerProfile } from '../services/profileService'
import './MyPortfolios.css'

const CATEGORIES = [
  { slug: 'wedding', name: 'Wedding' },
  { slug: 'portrait', name: 'Portrait' },
  { slug: 'landscape', name: 'Landscape' },
  { slug: 'event', name: 'Event' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'street', name: 'Street' },
  { slug: 'newborn', name: 'Newborn' },
  { slug: 'commercial', name: 'Commercial' },
]

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Sortable image thumb ──────────────────────────────────────────────────
function SortableThumb({ image, onDelete, deleting, isCover, onSetCover, settingCover }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`my-portfolio-thumb-wrap ${isCover ? 'my-portfolio-thumb-wrap--cover' : ''}`}
    >
      {isCover && (
        <span className="my-portfolio-cover-badge" title="Cover image">★</span>
      )}
      <img
        src={image.url}
        alt=""
        className="my-portfolio-thumb"
        loading="lazy"
        {...attributes}
        {...listeners}
        draggable={false}
      />
      <div className="my-portfolio-thumb-actions">
        {!isCover && (
          <button
            className="my-portfolio-thumb-set-cover"
            onClick={() => onSetCover(image.url)}
            disabled={settingCover}
            title="Set as cover"
          >
            ★
          </button>
        )}
        <button
          className="my-portfolio-thumb-delete"
          onClick={() => onDelete(image.id)}
          disabled={deleting}
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ── Drop Zone ─────────────────────────────────────────────────────────────
function DropZone({ slug, isUploading, progress, onFiles }) {
  const inputRef = useRef(null)
  const [draggingOver, setDraggingOver] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDraggingOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    if (files.length) onFiles(files, slug)
  }, [slug, onFiles])

  const handleDragOver = (e) => { e.preventDefault(); setDraggingOver(true) }
  const handleDragLeave = () => setDraggingOver(false)

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div
      className={`drop-zone ${draggingOver ? 'drop-zone--active' : ''} ${isUploading ? 'drop-zone--uploading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isUploading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label="Upload photos"
    >
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files)
          e.target.value = ''
          if (files.length) onFiles(files, slug)
        }}
      />
      {isUploading ? (
        <>
          <span className="drop-zone__label">
            {progress.done}/{progress.total} uploaded
          </span>
          <div className="drop-zone__progress-track">
            <motion.div
              className="drop-zone__progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <span className="drop-zone__hint">{pct}%</span>
        </>
      ) : (
        <>
          <svg className="drop-zone__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="drop-zone__label">
            {draggingOver ? 'Drop to upload' : 'Upload photos'}
          </span>
          <span className="drop-zone__hint">or drag & drop</span>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function MyPortfolios() {
  const { token } = useAuth()
  const toast = useToast()

  const [photographer, setPhotographer] = useState(null)
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploadingFor, setUploadingFor] = useState(null)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [deletingId, setDeletingId] = useState(null)
  const [settingCoverFor, setSettingCoverFor] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    categorySlug: 'wedding',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    if (!token) return
    load()
  }, [token])

  async function load() {
    setLoading(true)
    try {
      const [ph, pfs] = await Promise.all([
        getMyPhotographerProfile(token),
        getMyPortfolios(token),
      ])
      setPhotographer(ph)
      // Normalise images: backend returns raw PortfolioImage objects
      setPortfolios(
        (pfs || []).map((p) => ({
          ...p,
          imageObjects: (p.images || []).map((img) =>
            typeof img === 'string'
              ? { id: img, url: img }
              : { id: img.id, url: img.imageUrl ?? img.url ?? img }
          ),
        }))
      )
    } catch {
      toast.error('Failed to load your portfolios.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    try {
      const slug = slugify(form.title) + '-' + Date.now().toString(36)
      await createPortfolio(token, {
        title: form.title.trim(),
        description: form.description.trim(),
        categorySlug: form.categorySlug,
        photographerSlug: photographer.slug,
        slug,
        status: 'pending',
      })
      toast.success('Portfolio created!')
      setShowForm(false)
      setForm({ title: '', description: '', categorySlug: 'wedding' })
      await load()
    } catch (err) {
      toast.error(err.message || 'Failed to create portfolio.')
    } finally {
      setCreating(false)
    }
  }

  const handleFilesUpload = useCallback(async (files, portfolioSlug) => {
    if (!files.length) return
    setUploadingFor(portfolioSlug)
    setUploadProgress({ done: 0, total: files.length })
    let successCount = 0
    for (let i = 0; i < files.length; i++) {
      try {
        const { url } = await uploadImage(token, files[i])
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`
        await addImageToPortfolio(token, portfolioSlug, fullUrl)
        successCount++
      } catch {
        toast.error(`Failed to upload ${files[i].name}`)
      }
      setUploadProgress({ done: i + 1, total: files.length })
    }
    setUploadingFor(null)
    setUploadProgress({ done: 0, total: 0 })
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded.`)
      await load()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleDelete = async (portfolioSlug, imageId) => {
    setDeletingId(imageId)
    try {
      await deletePortfolioImage(token, imageId)
      setPortfolios((prev) =>
        prev.map((p) =>
          p.slug === portfolioSlug
            ? { ...p, imageObjects: p.imageObjects.filter((img) => img.id !== imageId) }
            : p
        )
      )
    } catch {
      toast.error('Failed to delete image.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetCover = async (portfolioSlug, imageUrl) => {
    setSettingCoverFor(portfolioSlug)
    try {
      await setCoverImage(token, portfolioSlug, imageUrl)
      setPortfolios((prev) =>
        prev.map((p) => (p.slug === portfolioSlug ? { ...p, coverImage: imageUrl } : p))
      )
      toast.success('Cover image updated.')
    } catch {
      toast.error('Failed to set cover image.')
    } finally {
      setSettingCoverFor(null)
    }
  }

  const handleDragEnd = async (event, portfolioSlug) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPortfolios((prev) =>
      prev.map((p) => {
        if (p.slug !== portfolioSlug) return p
        const oldIndex = p.imageObjects.findIndex((img) => img.id === active.id)
        const newIndex = p.imageObjects.findIndex((img) => img.id === over.id)
        const reordered = arrayMove(p.imageObjects, oldIndex, newIndex)
        // Persist reorder
        reorderPortfolioImages(
          token,
          portfolioSlug,
          reordered.map((img) => img.id)
        ).catch(() => toast.error('Failed to save image order.'))
        return { ...p, imageObjects: reordered }
      })
    )
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="my-portfolios-loading">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton my-portfolio-skeleton" />
        ))}
      </div>
    )
  }

  if (!photographer) {
    return (
      <div className="empty-state">
        <h3>No photographer profile</h3>
        <p>Apply as a photographer above to manage your portfolios.</p>
      </div>
    )
  }

  if (photographer.status === 'pending') {
    return (
      <div className="empty-state">
        <h3>Application under review</h3>
        <p>Once your application is approved you can create and manage portfolios here.</p>
      </div>
    )
  }

  return (
    <div className="my-portfolios">
      {/* Header row */}
      <div className="my-portfolios-header">
        <p className="my-portfolios-count">
          {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}
        </p>
        <button className="btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Portfolio'}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            className="my-portfolio-form"
            onSubmit={handleCreate}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="my-portfolio-form-grid">
              <div className="form-field">
                <label className="settings-label">Title *</label>
                <input
                  className="settings-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Summer Wedding Stories"
                  required
                />
              </div>
              <div className="form-field">
                <label className="settings-label">Category</label>
                <select
                  className="settings-input"
                  value={form.categorySlug}
                  onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label className="settings-label">Description</label>
              <textarea
                className="settings-input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description of this portfolio…"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create Portfolio'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Portfolio list */}
      {portfolios.length === 0 && !showForm ? (
        <div className="empty-state">
          <h3>No portfolios yet</h3>
          <p>Create your first portfolio and start uploading your work.</p>
        </div>
      ) : (
        <div className="my-portfolio-list">
          {portfolios.map((p) => {
            const isUploading = uploadingFor === p.slug
            return (
              <div key={p.slug} className="my-portfolio-card">
                <div className="my-portfolio-card-header">
                  <div>
                    <h3 className="my-portfolio-title">
                      <Link to={`/portfolio/${p.slug}`} className="my-portfolio-link">
                        {p.title}
                      </Link>
                    </h3>
                    <div className="my-portfolio-meta">
                      <span className={`status-badge status-badge--${p.status}`}>
                        {p.status}
                      </span>
                      <span className="my-portfolio-category">
                        {p.category?.name || p.categorySlug}
                      </span>
                      <span className="my-portfolio-img-count">
                        {p.imageObjects.length} image{p.imageObjects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <DropZone
                    slug={p.slug}
                    isUploading={isUploading}
                    progress={isUploading ? uploadProgress : { done: 0, total: 0 }}
                    onFiles={handleFilesUpload}
                  />
                </div>

                {/* Drag-to-reorder image strip */}
                {p.imageObjects.length > 0 && (
                  <div>
                    {p.imageObjects.length > 1 && (
                      <p className="my-portfolio-drag-hint">Drag to reorder</p>
                    )}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, p.slug)}
                    >
                      <SortableContext
                        items={p.imageObjects.map((img) => img.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        <div className="my-portfolio-images">
                          {p.imageObjects.map((img) => (
                            <SortableThumb
                              key={img.id}
                              image={img}
                              onDelete={(id) => handleDelete(p.slug, id)}
                              deleting={deletingId === img.id}
                              isCover={img.url === p.coverImage}
                              onSetCover={(url) => handleSetCover(p.slug, url)}
                              settingCover={settingCoverFor === p.slug}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
