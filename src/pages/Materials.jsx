import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import HeroCanvas from '../components/HeroCanvas'
import TemplatePreview from '../components/TemplatePreview'
import TemplateEditor from '../components/TemplateEditor'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../data/templates'
import './Materials.css'

const COLOR_THEMES = [
  { id: 'violet', label: 'Violet', accent: '#7c3aed', light: '#a78bfa' },
  { id: 'blue',   label: 'Blue',   accent: '#2563eb', light: '#93c5fd' },
  { id: 'rose',   label: 'Rose',   accent: '#e11d48', light: '#fda4af' },
  { id: 'emerald',label: 'Green',  accent: '#059669', light: '#6ee7b7' },
  { id: 'amber',  label: 'Amber',  accent: '#b45309', light: '#fcd34d' },
]

function TemplateModal({ template, onClose, onUse }) {
  const { user } = useAuth()
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0])

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="tm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="tm-panel"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <button className="tm-close" onClick={onClose}>×</button>

          <div className="tm-layout">
            {/* Large preview */}
            <div
              className="tm-preview-large"
              style={{ '--tp-accent': colorTheme.accent, '--tp-accent-light': colorTheme.light }}
            >
              <TemplatePreview preview={template.preview} size="large" />
            </div>

            {/* Info */}
            <div className="tm-info">
              <div className="tm-category-label">
                {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}{' '}
                {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label}
              </div>
              <h2 className="tm-name">{template.name}</h2>
              <div className="tm-dimensions">{template.dimensions}</div>
              <p className="tm-description">{template.description}</p>

              <div className="tm-tags">
                {template.tags.map(t => (
                  <span key={t} className="tm-tag">{t}</span>
                ))}
              </div>

              {/* Color theme picker */}
              <div className="tm-color-section">
                <span className="tm-color-label">Accent color</span>
                <div className="tm-color-swatches">
                  {COLOR_THEMES.map(t => (
                    <button
                      key={t.id}
                      className={`tm-color-swatch ${colorTheme.id === t.id ? 'active' : ''}`}
                      style={{ background: t.accent }}
                      onClick={() => setColorTheme(t)}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              <div className="tm-actions">
                {user ? (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => onUse(template, colorTheme)}
                    >
                      Use Template
                    </button>
                  </>
                ) : (
                  <div className="tm-auth-note">
                    <Link to="/login" className="btn-primary">Sign in to use template</Link>
                    <p>Create a free account to access all templates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default function Materials() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null) // { template, colorTheme }

  const filtered = useMemo(() => {
    return TEMPLATES.filter(t => {
      const catMatch = activeCategory === 'all' || t.category === activeCategory
      const q = search.toLowerCase()
      const searchMatch = !q
        || t.name.toLowerCase().includes(q)
        || t.tags.some(tag => tag.includes(q))
        || t.description.toLowerCase().includes(q)
      return catMatch && searchMatch
    })
  }, [activeCategory, search])

  // Count per category
  const countByCategory = useMemo(() => {
    const counts = {}
    TEMPLATES.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1
    })
    counts['all'] = TEMPLATES.length
    return counts
  }, [])

  return (
    <div className="materials-page">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="materials-hero">
        <HeroCanvas />
        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-eyebrow">Print &amp; Design</span>
          <h1 className="materials-title">Professional Templates</h1>
          <p className="materials-subtitle">
            Ready-made templates for business cards, CVs, flyers, invitations and more —
            designed for photographers and creative professionals.
          </p>
          <div className="materials-stats">
            <span><strong>{TEMPLATES.length}</strong> templates</span>
            <span>·</span>
            <span><strong>{TEMPLATE_CATEGORIES.length - 1}</strong> categories</span>
            <span>·</span>
            <span>Free to use</span>
            <span>·</span>
            <span>5 color themes</span>
          </div>
        </div>
      </div>

      <div className="page-container materials-body">
        {/* ── Filter bar ───────────────────────────────────────────── */}
        <div className="mat-filter-bar">
          <div className="mat-category-tabs">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`mat-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="mat-cat-icon">{cat.icon}</span>
                {cat.label}
                <span className="mat-cat-count">{countByCategory[cat.id] || 0}</span>
              </button>
            ))}
          </div>

          <div className="mat-search-wrap">
            <span className="mat-search-icon">⌕</span>
            <input
              className="mat-search-input"
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="mat-search-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>
        </div>

        {/* ── Results count ─────────────────────────────────────────── */}
        <div className="mat-results-count">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
        </div>

        {/* ── Template grid ─────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No templates found</h3>
            <p>Try a different category or search term.</p>
          </div>
        ) : (
          <motion.div className="mat-grid" layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((template, i) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <button
                    className="mat-card"
                    onClick={() => setSelected(template)}
                  >
                    {/* Badges */}
                    {(template.popular || template.isNew) && (
                      <div className="mat-badges">
                        {template.popular && <span className="mat-badge mat-badge--popular">Popular</span>}
                        {template.isNew && <span className="mat-badge mat-badge--new">New</span>}
                      </div>
                    )}

                    {/* Preview area */}
                    <div className={`mat-card-preview mat-card-preview--${template.preview.type}`}>
                      <TemplatePreview preview={template.preview} size="card" />
                    </div>

                    {/* Info */}
                    <div className="mat-card-info">
                      <div className="mat-card-top">
                        <span className="mat-card-category">
                          {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label}
                        </span>
                        <span className="mat-card-dims">{template.dimensions}</span>
                      </div>
                      <h3 className="mat-card-name">{template.name}</h3>
                      <p className="mat-card-desc">{template.description}</p>
                      <div className="mat-card-tags">
                        {template.tags.map(t => (
                          <span key={t} className="mat-tag">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mat-card-footer">
                      <span className="mat-card-use-btn">
                        {user ? 'Preview & Use →' : 'Preview →'}
                      </span>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Auth gate for non-users ───────────────────────────────── */}
        {!user && (
          <div className="mat-auth-banner">
            <div className="mat-auth-banner-content">
              <span className="mat-auth-banner-icon">🔓</span>
              <div>
                <strong>Sign in to use templates</strong>
                <p>Create a free account to customize and download all templates.</p>
              </div>
              <div className="mat-auth-banner-actions">
                <Link to="/login" className="btn-primary btn-sm">Sign In</Link>
                <Link to="/register" className="btn-ghost btn-sm">Register</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Template Modal ────────────────────────────────────────────── */}
      {selected && !editing && (
        <TemplateModal
          template={selected}
          onClose={() => setSelected(null)}
          onUse={(template, colorTheme) => {
            setSelected(null)
            setEditing({ template, colorTheme })
          }}
        />
      )}

      {/* ── Template Editor ───────────────────────────────────────────── */}
      {editing && (
        <TemplateEditor
          template={editing.template}
          colorTheme={editing.colorTheme}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
