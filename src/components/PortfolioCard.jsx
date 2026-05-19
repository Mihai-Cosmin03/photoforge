import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'
import BlurImage from './BlurImage'
import UserAvatar, { getDefaultAvatarIndex } from './UserAvatar'
import './PortfolioCard.css'

const revealVariant = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function PortfolioCard({ portfolio, photographer }) {
  const { ref, onMouseMove, onMouseLeave: tiltLeave } = use3DTilt(7, 0.14)
  const [hovered, setHovered] = useState(false)
  const [previewIdx, setPreviewIdx] = useState(0)
  const intervalRef = useRef(null)
  const previewImages = portfolio.images?.slice(0, 5) ?? []

  const handleMouseEnter = () => {
    if (previewImages.length < 2) return
    setHovered(true)
    setPreviewIdx(0)
    intervalRef.current = setInterval(() => {
      setPreviewIdx((i) => (i + 1) % previewImages.length)
    }, 900)
  }

  const handleMouseLeave = (e) => {
    tiltLeave(e)
    setHovered(false)
    setPreviewIdx(0)
    clearInterval(intervalRef.current)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const displaySrc = hovered && previewImages.length > 1
    ? previewImages[previewIdx]
    : portfolio.coverImage

  return (
    <motion.div
      variants={revealVariant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      <Link
        to={`/portfolio/${portfolio.slug}`}
        className="portfolio-card"
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glare */}
        <div className="card-glare" aria-hidden="true" />

        <div className="portfolio-card-image-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={displaySrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <BlurImage
                src={displaySrc}
                alt={portfolio.title}
                className="portfolio-card-image"
                aspectRatio="4/3"
              />
            </motion.div>
          </AnimatePresence>
          {portfolio.featured && (
            <span className="featured-badge portfolio-card-badge">Featured</span>
          )}
          <span className="portfolio-card-count">{portfolio.images.length} photos</span>
          {hovered && previewImages.length > 1 && (
            <div className="portfolio-card-dots" aria-hidden="true">
              {previewImages.map((_, i) => (
                <span key={i} className={`portfolio-card-dot${i === previewIdx ? ' portfolio-card-dot--active' : ''}`} />
              ))}
            </div>
          )}
        </div>

        <div className="portfolio-card-body">
          <h3 className="portfolio-card-title">{portfolio.title}</h3>
          <p className="portfolio-card-description">{portfolio.description}</p>

          {photographer && (
            <div className="portfolio-card-photographer">
              <UserAvatar
                user={photographer}
                size={40}
                avatarIndex={photographer.avatar ? null : getDefaultAvatarIndex(photographer)}
                className="photographer-avatar-sm"
              />
              <div className="photographer-info">
                <span className="photographer-name">{photographer.name}</span>
                <span className="photographer-meta">
                  {photographer.city} · {photographer.experience}yr exp
                </span>
                <div className="specialty-pills">
                  {photographer.specialties.map((s) => (
                    <span key={s} className="pill">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
