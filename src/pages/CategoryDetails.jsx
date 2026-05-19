import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, useScroll, useTransform } from 'framer-motion'
import PortfolioCard from '../components/PortfolioCard'
import { CardGridSkeleton, Skeleton } from '../components/Skeleton'
import { getCategoryBySlug } from '../services/categoriesService'
import { getPortfoliosByCategory } from '../services/portfoliosService'
import ContactSheet from '../photo-fx/components/ContactSheet'
import './CategoryDetails.css'

export default function CategoryDetails() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const cat = await getCategoryBySlug(slug)
      if (!cat) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const portfolioList = await getPortfoliosByCategory(slug)
      setCategory(cat)
      setPortfolios(portfolioList)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div>
      <Skeleton className="skeleton-hero--full" style={{ height: 480 }} />
      <div className="page-container" style={{ paddingTop: 'var(--space-7)' }}>
        <CardGridSkeleton count={6} />
      </div>
    </div>
  )

  if (notFound) {
    return (
      <div className="page-container" style={{ paddingTop: 'var(--space-10)' }}>
        <div className="empty-state">
          <h3>Category Not Found</h3>
          <p>This category doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="category-details-page">
      <Helmet>
        <title>{category.name} Photography — PhotoForge</title>
        <meta name="description" content={category.heroSubtitle || category.description?.slice(0, 155)} />
        {category.coverImage && <meta property="og:image" content={category.coverImage} />}
      </Helmet>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="category-hero" ref={heroRef}>
        {category.coverImage && (
          <motion.img
            src={category.coverImage}
            alt={category.name}
            className="category-hero-img"
            style={{ y: imgY }}
          />
        )}
        <div className="category-hero-overlay" />
        <div className="category-hero-content">
          <Link to="/categories" className="back-link">← All Categories</Link>
          <div className="category-hero-meta">
            <span className="category-hero-count">{portfolios.length} {portfolios.length === 1 ? 'Portfolio' : 'Portfolios'}</span>
            {category.featured && <span className="featured-badge">Featured Category</span>}
          </div>
          <h1 className="category-hero-title">{category.heroTitle}</h1>
          <p className="category-hero-subtitle">{category.heroSubtitle}</p>
        </div>
      </div>

      {/* ── Portfolios ────────────────────────────────────── */}
      <div className="page-container category-portfolios">
        <div className="category-portfolios-header">
          <span className="section-eyebrow">Discover</span>
          <h2 className="section-heading">Portfolios in {category.name}</h2>
        </div>

        {portfolios.length === 0 ? (
          <div className="empty-state">
            <h3>No portfolios yet</h3>
            <p>No photographers have added work to this category yet. Check back soon.</p>
          </div>
        ) : (
          <div className="portfolio-grid">
            <ContactSheet stagger={60}>
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.slug}
                  portfolio={portfolio}
                  photographer={portfolio.photographer}
                />
              ))}
            </ContactSheet>
          </div>
        )}
      </div>
    </div>
  )
}
