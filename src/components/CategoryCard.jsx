import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'
import ApertureHover from '../photo-fx/components/ApertureHover'
import './CategoryCard.css'

export default function CategoryCard({ category, portfolioCount }) {
  const { ref, onMouseMove, onMouseLeave } = use3DTilt(8, 0.16)

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="category-card"
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Glare layer — follows mouse via CSS custom properties */}
      <div className="card-glare" aria-hidden="true" />

      <div className="category-card-image-wrap">
        <ApertureHover
          preview={<img src={category.coverImage} alt={category.name} className="category-card-image" />}
        >
          <img src={category.coverImage} alt={category.name} className="category-card-image" />
        </ApertureHover>
        {category.featured && (
          <span className="featured-badge category-card-badge">Featured</span>
        )}
      </div>
      <div className="category-card-content">
        <div className="category-card-meta">
          <span>{portfolioCount} {portfolioCount === 1 ? 'portfolio' : 'portfolios'}</span>
        </div>
        <h3 className="category-card-title">{category.name}</h3>
        <p className="category-card-description">{category.description}</p>
        <motion.span
          className="category-card-cta"
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          Explore →
        </motion.span>
      </div>
    </Link>
  )
}
