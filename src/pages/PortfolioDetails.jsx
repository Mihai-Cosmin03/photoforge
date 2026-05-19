import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Lightbox from '../components/Lightbox'
import SaveButton from '../components/SaveButton'
import ShareButton from '../components/ShareButton'
import BlurImage from '../components/BlurImage'
import UserAvatar, { getDefaultAvatarIndex } from '../components/UserAvatar'
import { Skeleton } from '../components/Skeleton'
import { getPortfolioBySlug } from '../services/portfoliosService'
import DarkroomDevelop from '../photo-fx/components/DarkroomDevelop'
import './PortfolioDetails.css'

export default function PortfolioDetails() {
  const { slug } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [photographer, setPhotographer] = useState(null)
  const [category, setCategory] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [lightboxDir, setLightboxDir] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const p = await getPortfolioBySlug(slug)
      if (!p) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setPortfolio(p)
      setPhotographer(p.photographer)
      setCategory(p.category)
      setLoading(false)
    }
    load()
  }, [slug])

  const handleNext = useCallback(() => {
    setLightboxDir(1)
    setLightboxIndex((i) => (i + 1) % portfolio.images.length)
  }, [portfolio])

  const handlePrev = useCallback(() => {
    setLightboxDir(-1)
    setLightboxIndex((i) => (i - 1 + portfolio.images.length) % portfolio.images.length)
  }, [portfolio])

  const handleClose = useCallback(() => setLightboxIndex(-1), [])

  if (loading) return (
    <div className="page-container portfolio-layout" style={{ paddingTop: 'var(--space-7)' }}>
      <div className="portfolio-main">
        <Skeleton style={{ height: 48, width: '60%', marginBottom: 'var(--space-4)' }} />
        <Skeleton style={{ height: 20, width: '80%', marginBottom: 'var(--space-6)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-3)' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
      <div className="portfolio-sidebar">
        <Skeleton style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  )

  if (notFound) {
    return (
      <div className="page-container" style={{ paddingTop: 'var(--space-10)' }}>
        <div className="empty-state">
          <h3>Portfolio Not Found</h3>
          <p>This portfolio doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio-details-page">
      <Helmet>
        <title>{portfolio.title} — PhotoForge</title>
        <meta name="description" content={portfolio.description?.slice(0, 155)} />
        {portfolio.coverImage && <meta property="og:image" content={portfolio.coverImage} />}
        <meta property="og:title" content={portfolio.title} />
        <meta property="og:type" content="article" />
      </Helmet>
      <div className="page-container portfolio-layout">
        {/* ── Main Content ─────────────────────────────────── */}
        <div className="portfolio-main">
          {/* Hero */}
          <div className="portfolio-hero">
            <div className="portfolio-hero-top">
              {category && (
                <Link to={`/categories/${category.slug}`} className="back-link">
                  ← Back to {category.name}
                </Link>
              )}
              <div className="portfolio-hero-badges">
                {category && <span className="pill">{category.name}</span>}
                {portfolio.featured && <span className="featured-badge">Featured</span>}
              </div>
            </div>

            <div className="portfolio-hero-title-row">
              <h1 className="portfolio-hero-title">{portfolio.title}</h1>
              <div className="portfolio-hero-actions">
                <SaveButton type="portfolio" slug={portfolio.slug} label={portfolio.title} />
                <ShareButton title={portfolio.title} text={`Check out this portfolio: ${portfolio.title}`} />
              </div>
            </div>
            <p className="portfolio-hero-description">{portfolio.description}</p>

            {photographer && (
              <div className="portfolio-photographer-block">
                <UserAvatar
                  user={photographer}
                  size={56}
                  avatarIndex={photographer.avatar ? null : getDefaultAvatarIndex(photographer)}
                  className="photographer-avatar-md"
                />
                <div className="portfolio-photographer-info">
                  <Link
                    to={`/photographers/${photographer.slug}`}
                    className="portfolio-photographer-name"
                  >
                    {photographer.name}
                  </Link>
                  <span className="portfolio-photographer-meta">
                    {photographer.city} · {photographer.experience} years experience
                  </span>
                  <div className="specialty-pills">
                    {(photographer.specialties || []).map((s) => (
                      <Link key={s} to={`/categories/${s}`} className="pill">{s}</Link>
                    ))}
                  </div>
                </div>
                <Link
                  to={`/photographers/${photographer.slug}`}
                  className="btn-ghost"
                  style={{ marginLeft: 'auto', flexShrink: 0 }}
                >
                  View Profile
                </Link>
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="gallery-section">
            <span className="section-eyebrow">Gallery</span>
            <DarkroomDevelop duration={1800}>
            <div className="gallery-grid">
              {portfolio.images.map((img, i) => (
                <button
                  key={i}
                  className="gallery-item"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Open image ${i + 1}`}
                >
                  <BlurImage
                    src={img}
                    alt={`${portfolio.title} — ${i + 1}`}
                    objectFit="cover"
                  />
                  <span className="gallery-item__expand" aria-hidden="true">⛶</span>
                </button>
              ))}
            </div>
            </DarkroomDevelop>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="portfolio-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-heading">Collection Info</h3>
            <ul className="sidebar-info-list">
              <li>
                <span className="sidebar-label">Photos</span>
                <span className="sidebar-value">{portfolio.images.length}</span>
              </li>
              <li>
                <span className="sidebar-label">Category</span>
                <span className="sidebar-value">
                  {category ? (
                    <Link to={`/categories/${category.slug}`} className="sidebar-link">
                      {category.name}
                    </Link>
                  ) : '—'}
                </span>
              </li>
              <li>
                <span className="sidebar-label">Photographer</span>
                <span className="sidebar-value">
                  {photographer ? (
                    <Link to={`/photographers/${photographer.slug}`} className="sidebar-link">
                      {photographer.name}
                    </Link>
                  ) : '—'}
                </span>
              </li>
              <li>
                <span className="sidebar-label">Status</span>
                <span className="sidebar-value sidebar-status">Active</span>
              </li>
            </ul>

            {photographer && (
              <div className="sidebar-specialties">
                <span className="sidebar-label">Specialties</span>
                <div className="specialty-pills" style={{ marginTop: 'var(--space-2)' }}>
                  {(photographer.specialties || []).map((s) => (
                    <Link key={s} to={`/categories/${s}`} className="pill">{s}</Link>
                  ))}
                </div>
              </div>
            )}

            {category && (
              <Link
                to={`/categories/${category.slug}`}
                className="btn-ghost"
                style={{ width: '100%', marginTop: 'var(--space-4)' }}
              >
                ← More in {category.name}
              </Link>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <Lightbox
            images={portfolio.images}
            index={lightboxIndex}
            direction={lightboxDir}
            onClose={handleClose}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
