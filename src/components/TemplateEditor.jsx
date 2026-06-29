import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TemplatePreview from './TemplatePreview'
import { PencilIcon, CameraIcon, PaletteIcon, ArrowDownIcon } from './Icons'
import { TEMPLATE_CATEGORIES } from '../data/templates'
import { COLOR_SLOTS, PRINT_DIMS, DESIGN_DIMS } from '../data/templateColors'
import templateCSS from './TemplatePreview.css?inline'
import './TemplateEditor.css'

const FIELD_SCHEMA = {
  'business-card': [
    { key: 'name',    label: 'Full Name',    placeholder: 'Alexandra M.' },
    { key: 'title',   label: 'Job Title',    placeholder: 'Photographer' },
    { key: 'email',   label: 'Email',        placeholder: 'alex@studio.ro' },
    { key: 'phone',   label: 'Phone',        placeholder: '+40 721 000 000' },
    { key: 'website', label: 'Website',      placeholder: 'www.alexphoto.ro' },
  ],
  'cv': [
    { key: 'name',   label: 'Full Name',   placeholder: 'Alexandra Moldovan' },
    { key: 'title',  label: 'Job Title',   placeholder: 'Senior Photographer' },
    { key: 'email',  label: 'Email',       placeholder: 'alex@studio.ro' },
    { key: 'phone',  label: 'Phone',       placeholder: '+40 721 000 000' },
    { key: 'city',   label: 'City',        placeholder: 'Cluj-Napoca' },
    { key: 'skill1', label: 'Skill 1',     placeholder: 'Lightroom' },
    { key: 'skill2', label: 'Skill 2',     placeholder: 'Photoshop' },
    { key: 'skill3', label: 'Skill 3',     placeholder: 'Capture One' },
  ],
  'flyer': [
    { key: 'headline', label: 'Main Title',  placeholder: 'Through the Lens' },
    { key: 'subtext',  label: 'Subtitle',    placeholder: 'A Photography Collection' },
    { key: 'date',     label: 'Date & Time', placeholder: '15 Mai 2025 · 19:00' },
    { key: 'venue',    label: 'Location',    placeholder: 'Galeria de Artă, Cluj' },
    { key: 'name',     label: 'Your Name',   placeholder: 'Alexandra Moldovan' },
    { key: 'website',  label: 'Website',     placeholder: 'www.alexphoto.ro' },
    { key: 'badge',    label: 'Offer Badge', placeholder: '50% OFF' },
  ],
  'invitation': [
    { key: 'names',   label: 'Name(s)',      placeholder: 'Ana & Mihai' },
    { key: 'headline',label: 'Event Title',  placeholder: 'Annual Gala 2025' },
    { key: 'date',    label: 'Date',         placeholder: '21 Septembrie 2025' },
    { key: 'venue',   label: 'Venue',        placeholder: 'Conacul Bran, Brașov' },
    { key: 'tagline', label: 'RSVP / Note',  placeholder: 'RSVP by 1 October' },
  ],
  'postcard': [
    { key: 'name',    label: 'Your Name',    placeholder: 'Alexandra M.' },
    { key: 'title',   label: 'Studio Name',  placeholder: 'Alexandra Photography' },
    { key: 'subtext', label: 'Message',      placeholder: 'It was a pleasure capturing your story.' },
    { key: 'address', label: 'Address',      placeholder: 'Str. Memorandumului 10, Cluj' },
    { key: 'website', label: 'Website',      placeholder: 'www.alexphoto.ro' },
    { key: 'badge',   label: 'Offer / Code', placeholder: '30% OFF' },
    { key: 'tagline', label: 'Promo Code',   placeholder: 'Use code: SPRING30' },
  ],
  'poster': [
    { key: 'headline', label: 'Main Title',    placeholder: 'Light & Shadow' },
    { key: 'subtext',  label: 'Subtitle / Tag',placeholder: 'Photography Exhibition' },
    { key: 'name',     label: 'Artist Name',   placeholder: 'Alexandra Moldovan' },
    { key: 'date',     label: 'Date / Period', placeholder: '1 – 30 Mai 2025' },
    { key: 'venue',    label: 'Venue',         placeholder: 'Galeria Națională, Cluj' },
    { key: 'website',  label: 'Website',       placeholder: 'alexphoto.ro' },
    { key: 'tagline',  label: 'Tag / Studio',  placeholder: 'STUDIO · 2025' },
  ],
}

// Where the photo appears in each template (for the hint text)
const PHOTO_AREA_HINT = {
  'bc-split':          'The left half of the card will show your photo.',
  'bc-photocirc':      'Your photo appears in the circular avatar at the top of the card.',
  'bc-photoleft':      'Your photo fills the full-height left panel of the card.',
  'bc-photobanner':    'Your photo fills the wide banner across the top of the card.',
  'bc-photofull':      'Your photo becomes the entire card background with text overlay.',
  'bc-photooval':      'Your photo appears in the oval frame on the right side of the card.',
  'bc-photocorner':    'Your photo appears as a small avatar in the corner of the card.',
  'bc-photodiag':      'Your photo fills the diagonal left area of the card.',
  'bc-photoduo':       'Your photo appears in the large circle on the left side of the card.',
  'cv-executive':      'Your photo appears in the sidebar avatar circle.',
  'cv-photo':          'Your photo appears in the large header portrait.',
  'cv-european':       'Your photo appears in the header avatar circle.',
  'cv-grid':           'Your photo appears in the sidebar avatar circle.',
  'pc-portfolio':      'Your photo fills the left panel of the postcard.',
  'pos-photo-bg':      'Your photo becomes the full background of the poster.',
  'pos-split':         'Your photo fills the left diagonal panel.',
  'pos-portrait-studio': 'Your photo fills the left half panel of the poster.',
}

export default function TemplateEditor({ template, onClose }) {
  const [tab, setTab] = useState('content')
  const [data, setData] = useState({})
  const [colors, setColors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef(null)
  const fileInputRef = useRef(null)

  const slots = COLOR_SLOTS[template.id] || []
  const fields = FIELD_SCHEMA[template.category] || []
  const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category)
  const photoHint = PHOTO_AREA_HINT[template.id]

  const cssVars = {}
  slots.forEach(s => { cssVars[s.cssVar] = colors[s.cssVar] || s.default })

  const updateData = (key, val) => setData(p => ({ ...p, [key]: val }))
  const updateColor = (cssVar, val) => setColors(p => ({ ...p, [cssVar]: val }))

  const loadPhoto = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => updateData('photo', ev.target.result)
    reader.readAsDataURL(file)
  }, [])

  const handleFileChange = (e) => loadPhoto(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    loadPhoto(e.dataTransfer.files?.[0])
  }

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const el = previewRef.current?.querySelector('.tp-wrap')
      if (!el) return

      const dims = PRINT_DIMS[template.preview.type] || { w: 200, h: 150 }
      const design = DESIGN_DIMS[template.preview.type] || { w: 300, h: 300 }

      // Render at 3× for high quality
      const SCALE = 3
      const canvas = await html2canvas(el, {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: design.w,
        height: design.h,
        logging: false,
      })

      const orientation = dims.w >= dims.h ? 'landscape' : 'portrait'
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [dims.w, dims.h],
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, dims.w, dims.h)
      pdf.save(`${template.name.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setDownloading(false)
    }
  }, [template, slots, colors, data])

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="te-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="te-modal"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="te-header">
            <div>
              <span className="te-eyebrow">{category?.icon} {category?.label} · {template.dimensions}</span>
              <h2 className="te-title">{template.name}</h2>
            </div>
            <button className="te-close" onClick={onClose}>×</button>
          </div>

          {/* ── Body ───────────────────────────────────────────── */}
          <div className="te-body">

            {/* LEFT: Live Preview */}
            <div className="te-preview-panel">
              <div className="te-panel-label">Live Preview</div>
              <div ref={previewRef} className="te-preview-stage" style={cssVars}>
                <div className={`te-preview-box te-preview-box--${template.preview.type}`}>
                  <TemplatePreview preview={template.preview} size="card" data={data} />
                </div>
              </div>
              <p className="te-hint">
                Edit content, colors or add a photo using the tabs on the right.
                Click <strong>Download PDF</strong> when ready.
              </p>
            </div>

            {/* RIGHT: Tabs + panels */}
            <div className="te-right-panel">
              <div className="te-tabs">
                <button className={`te-tab ${tab==='content'?'active':''}`} onClick={()=>setTab('content')}>
                  <PencilIcon /> Content
                </button>
                <button className={`te-tab te-tab--photo ${tab==='photo'?'active':''}`} onClick={()=>setTab('photo')}>
                  <CameraIcon /> Photo
                  {data.photo && <span className="te-tab-dot" />}
                </button>
                <button className={`te-tab ${tab==='colors'?'active':''}`} onClick={()=>setTab('colors')}>
                  <PaletteIcon /> Colors
                </button>
              </div>

              {/* ── CONTENT TAB ─────────────────────────────────── */}
              {tab === 'content' && (
                <div className="te-tab-body">
                  <div className="te-fields">
                    {fields.map(f => (
                      <div key={f.key} className="te-field">
                        <label className="te-flabel">{f.label}</label>
                        <input
                          className="te-finput"
                          placeholder={f.placeholder}
                          value={data[f.key] || ''}
                          onChange={e => updateData(f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="te-note">Empty fields use placeholder text.</p>
                </div>
              )}

              {/* ── PHOTO TAB ───────────────────────────────────── */}
              {tab === 'photo' && (
                <div className="te-tab-body te-photo-tab">

                  {data.photo ? (
                    /* ── Has photo ─────────────────────────────── */
                    <div className="te-photo-uploaded">
                      <div className="te-photo-uploaded-preview">
                        <img src={data.photo} alt="Your photo" />
                        <div className="te-photo-uploaded-overlay">
                          <button
                            className="te-photo-change-btn"
                            onClick={() => fileInputRef.current?.click()}
                          >Change photo</button>
                        </div>
                      </div>

                      <div className="te-photo-uploaded-info">
                        <div className="te-photo-check">✓ Photo added</div>
                        {photoHint
                          ? <p className="te-photo-placement">{photoHint}</p>
                          : <p className="te-photo-placement">Your photo is applied to the template. Check the live preview on the left.</p>
                        }
                        <div className="te-photo-uploaded-actions">
                          <button
                            className="btn-ghost btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                          >Change photo</button>
                          <button
                            className="te-photo-remove-btn"
                            onClick={() => updateData('photo', null)}
                          >Remove</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── No photo — big drop zone ───────────────── */
                    <div
                      className={`te-dropzone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="te-dropzone-icon">
                        {isDragging ? <ArrowDownIcon /> : <CameraIcon />}
                      </div>
                      <div className="te-dropzone-title">
                        {isDragging ? 'Drop to upload' : 'Add your photo'}
                      </div>
                      <div className="te-dropzone-sub">
                        Drag & drop an image here, or click to browse
                      </div>
                      <div className="te-dropzone-formats">JPG, PNG, WEBP — max 10MB</div>
                      <div className="te-dropzone-cta">Browse files</div>
                    </div>
                  )}

                  {/* Hidden input — works for both paths */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {!data.photo && (
                    <div className="te-photo-info-box">
                      <strong>Where does the photo go?</strong>
                      {photoHint
                        ? <p>{photoHint}</p>
                        : <p>This template style does not have a dedicated portrait area. Templates with photo support: <em>Photo Split, Executive Dark, Photo Focused, Portfolio Intro, Photo Background, Diagonal Split</em>.</p>
                      }
                    </div>
                  )}
                </div>
              )}

              {/* ── COLORS TAB ──────────────────────────────────── */}
              {tab === 'colors' && (
                <div className="te-tab-body">
                  {slots.length === 0 ? (
                    <p className="te-note" style={{ marginTop: 0 }}>No color customization for this template.</p>
                  ) : (
                    <div className="te-color-grid">
                      {slots.map(slot => {
                        const currentVal = colors[slot.cssVar] || slot.default
                        const isHex = /^#[0-9a-fA-F]{3,8}$/.test(currentVal)
                        const displayVal = isHex ? currentVal : slot.default
                        return (
                          <div key={slot.key} className="te-color-row-item">
                            <div className="te-color-swatch-wrap">
                              <input
                                type="color"
                                className="te-color-input"
                                value={displayVal}
                                onChange={e => updateColor(slot.cssVar, e.target.value)}
                                title={slot.label}
                              />
                              <div className="te-color-swatch-preview" style={{ background: displayVal }} />
                            </div>
                            <div className="te-color-meta">
                              <span className="te-color-label">{slot.label}</span>
                              <span className="te-color-hex">{displayVal}</span>
                            </div>
                            {colors[slot.cssVar] && (
                              <button
                                className="te-color-reset"
                                onClick={() => { const n = {...colors}; delete n[slot.cssVar]; setColors(n) }}
                                title="Reset to default"
                              >↺</button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button className="btn-ghost btn-sm te-reset-all" onClick={() => setColors({})}>
                    Reset all colors
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────── */}
          <div className="te-footer">
            <button className="btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Preparing…' : <><ArrowDownIcon /> Download PDF</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
