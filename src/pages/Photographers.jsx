import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import PhotographerCard from '../components/PhotographerCard'
import { CardGridSkeleton } from '../components/Skeleton'
import HeroCanvas from '../components/HeroCanvas'
import { getPhotographersPaged } from '../services/photographersService'
import { getAllCategories } from '../services/categoriesService'
import './Photographers.css'

const LIMIT = 12

export default function Photographers() {
  const [photographers, setPhotographers] = useState([])
  const [categories, setCategories] = useState([])
  const [cityFilter, setCityFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const sentinelRef = useRef(null)
  const loadingMoreRef = useRef(false)

  const fetchPage = useCallback(async (p, city, specialty, replace = false) => {
    const res = await getPhotographersPaged({ city: city || undefined, specialty: specialty || undefined, page: p, limit: LIMIT })
    setTotalPages(res.totalPages)
    setTotal(res.total)
    setPhotographers((prev) => replace ? res.data : [...prev, ...res.data])
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      const [, cats] = await Promise.all([
        fetchPage(1, cityFilter, specialtyFilter, true),
        getAllCategories(),
      ])
      setCategories(cats)
      setPage(1)
      setLoading(false)
    }
    init()
  }, [cityFilter, specialtyFilter])

  const cities = useMemo(
    () => [...new Set(photographers.map((p) => p.city))].sort(),
    [photographers]
  )

  const handleLoadMore = useCallback(async (currentPage, city, specialty, currentTotal) => {
    if (loadingMoreRef.current || currentPage >= currentTotal) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    const next = currentPage + 1
    await fetchPage(next, city, specialty, false)
    setPage(next)
    setLoadingMore(false)
    loadingMoreRef.current = false
  }, [fetchPage])

  // IntersectionObserver for infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleLoadMore(page, cityFilter, specialtyFilter, totalPages)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [page, totalPages, cityFilter, specialtyFilter, handleLoadMore])

  if (loading) return (
    <div className="page-container" style={{ paddingTop: 'var(--space-8)' }}>
      <CardGridSkeleton count={6} type="photographer" />
    </div>
  )

  return (
    <div className="photographers-page">
      {/* ── Hero ── */}
      <section className="photographers-hero">
        <HeroCanvas />
        <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="photographers-header">
            <span className="section-eyebrow">Talent</span>
            <h1 className="section-heading">Photography Talent</h1>
            <p className="photographers-subtitle">
              Discover skilled photographers across Romania, each with a unique style and specialty.
            </p>
          </div>
        </div>
      </section>

      <div className="page-container">

        {/* ── Filter Bar ────────────────────────────────── */}
        <div className="filter-bar">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter by city"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <div className="filter-specialties">
            <button
              className={`filter-pill ${specialtyFilter === '' ? 'active' : ''}`}
              onClick={() => setSpecialtyFilter('')}
            >All</button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                className={`filter-pill ${specialtyFilter === cat.slug ? 'active' : ''}`}
                onClick={() => setSpecialtyFilter(specialtyFilter === cat.slug ? '' : cat.slug)}
              >{cat.name}</button>
            ))}
          </div>

          <span className="filter-count">
            {total} {total === 1 ? 'photographer' : 'photographers'}
          </span>
        </div>

        {/* ── Grid ─────────────────────────────────────── */}
        {photographers.length === 0 ? (
          <div className="empty-state">
            <h3>No photographers found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <>
            <div className="photographers-grid">
              {photographers.map((ph, i) => (
                <motion.div
                  key={ph.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (i % LIMIT) * 0.04 }}
                >
                  <PhotographerCard photographer={ph} portfolioCount={ph.portfolioCount ?? 0} />
                </motion.div>
              ))}
            </div>

            {page < totalPages && (
              <div ref={sentinelRef} className="load-more-wrap" aria-hidden="true">
                {loadingMore && (
                  <div className="infinite-scroll-spinner">
                    <span className="spinner" />
                    <span>Loading more…</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
