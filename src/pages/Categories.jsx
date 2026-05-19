import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CategoryCard from '../components/CategoryCard'
import StatsBlock from '../components/StatsBlock'
import { CardGridSkeleton, Skeleton } from '../components/Skeleton'
import { getAllCategories, getFeaturedCategories } from '../services/categoriesService'
import { getAllPortfolios, getPortfolioCountByCategory } from '../services/portfoliosService'
import { getAllPhotographers } from '../services/photographersService'
import './Categories.css'

import HeroCanvas from '../components/HeroCanvas'

// ─── Animation variants ───────────────────────────────────────────────────────
const heroLeft = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

const heroCardVariants = (i) => ({
  hidden: { opacity: 0, rotateY: -18, y: 40 },
  show: {
    opacity: 1,
    rotateY: 0,
    y: 0,
    transition: { duration: 0.8, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] },
  },
})

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const gridItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [featuredCategories, setFeaturedCategories] = useState([])
  const [portfolioCounts, setPortfolioCounts] = useState({})
  const [totalPortfolios, setTotalPortfolios] = useState(0)
  const [totalPhotographers, setTotalPhotographers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cats, featured, portfolios, photographers] = await Promise.all([
        getAllCategories(),
        getFeaturedCategories(),
        getAllPortfolios(),
        getAllPhotographers(),
      ])

      const counts = {}
      await Promise.all(
        cats.map(async (cat) => {
          counts[cat.slug] = await getPortfolioCountByCategory(cat.slug)
        })
      )

      setCategories(cats)
      setFeaturedCategories(featured.slice(0, 2))
      setPortfolioCounts(counts)
      setTotalPortfolios(portfolios.length)
      setTotalPhotographers(photographers.length)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-9)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Skeleton style={{ height: 18, width: 120 }} />
            <Skeleton style={{ height: 56, width: '80%' }} />
            <Skeleton style={{ height: 20, width: '65%' }} />
            <Skeleton style={{ height: 20, width: '50%' }} />
          </div>
          <Skeleton style={{ height: 340, borderRadius: 'var(--radius-xl)' }} />
        </div>
        <Skeleton style={{ height: 18, width: 140, marginBottom: 'var(--space-5)' }} />
        <CardGridSkeleton count={8} />
      </div>
    )
  }

  return (
    <div className="categories-page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <HeroCanvas />

        <div className="hero-inner">
          {/* Left column — staggered text reveal */}
          <motion.div
            className="hero-left"
            variants={heroLeft}
            initial="hidden"
            animate="show"
          >
            <motion.span className="section-eyebrow" variants={heroItem}>
              Premium Photography Platform
            </motion.span>
            <motion.h1 className="hero-title" variants={heroItem}>
              Discover Extraordinary Photography
            </motion.h1>
            <motion.p className="hero-subtitle" variants={heroItem}>
              Explore curated portfolios from Romania's most talented photographers. From intimate portraits to cinematic weddings — find the visual voice that speaks to you.
            </motion.p>
            <motion.div className="hero-actions" variants={heroItem}>
              <Link to="/photographers" className="btn-primary">Explore Photographers</Link>
              <Link to="/categories/wedding" className="btn-ghost">View Portfolios</Link>
            </motion.div>
            <motion.div variants={heroItem}>
              <StatsBlock
                totalCategories={categories.length}
                totalPortfolios={totalPortfolios}
                totalPhotographers={totalPhotographers}
              />
            </motion.div>
          </motion.div>

          {/* Right column — 3D entrance for featured cards */}
          <div className="hero-right" style={{ perspective: '1200px' }}>
            {featuredCategories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                variants={heroCardVariants(i)}
                initial="hidden"
                animate="show"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className={`hero-feature-card hero-feature-card--${i}`}
                >
                  <img src={cat.coverImage} alt={cat.name} />
                  <div className="hero-feature-overlay" />
                  <div className="hero-feature-content">
                    <span className="section-eyebrow">Featured</span>
                    <span className="hero-feature-name">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Grid ───────────────────────────────── */}
      <section className="categories-section">
        <div className="page-container">
          <div className="categories-section-header">
            <span className="section-eyebrow">Browse</span>
            <h2 className="section-heading">Explore by Category</h2>
          </div>
          <motion.div
            className="categories-grid"
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {categories.map((cat) => (
              <motion.div key={cat.slug} variants={gridItem}>
                <CategoryCard
                  category={cat}
                  portfolioCount={portfolioCounts[cat.slug] || 0}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
