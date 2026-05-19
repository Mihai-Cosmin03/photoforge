import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'
import UserAvatar, { getDefaultAvatarIndex } from './UserAvatar'
import './PhotographerCard.css'

const revealVariant = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function PhotographerCard({ photographer, portfolioCount }) {
  const { ref, onMouseMove, onMouseLeave } = use3DTilt(7, 0.13)

  return (
    <motion.div
      variants={revealVariant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      <Link
        to={`/photographers/${photographer.slug}`}
        className="photographer-card"
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Glare */}
        <div className="card-glare" aria-hidden="true" />

        <div className="photographer-card-header">
          <motion.div
            className="photographer-card-avatar-wrap"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          >
            <UserAvatar
              user={photographer}
              size={72}
              avatarIndex={photographer.avatar ? null : getDefaultAvatarIndex(photographer)}
              className="photographer-card-avatar"
            />
          </motion.div>
          <div className="photographer-card-badges">
            {photographer.featured && (
              <span className="featured-badge">Featured</span>
            )}
            {photographer.status === 'approved' && (
              <span className="verified-badge" title="Verified photographer">✓ Verified</span>
            )}
            <span className="experience-badge">{photographer.experience}yr</span>
          </div>
        </div>

        <div className="photographer-card-body">
          <h3 className="photographer-card-name">{photographer.name}</h3>
          <span className="photographer-card-city">{photographer.city}</span>

          <div className="specialty-pills" style={{ marginTop: 'var(--space-3)' }}>
            {photographer.specialties.map((s) => (
              <span key={s} className="pill">{s}</span>
            ))}
          </div>

          <span className="photographer-card-portfolio-count">
            {portfolioCount} {portfolioCount === 1 ? 'portfolio' : 'portfolios'}
          </span>
        </div>

        <div className="photographer-card-footer">
          <motion.span
            className="photographer-card-cta"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            View Profile →
          </motion.span>
        </div>
      </Link>
    </motion.div>
  )
}
