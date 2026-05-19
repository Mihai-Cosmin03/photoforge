import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './SearchResults.css'

import { API_URL } from '../config.js'

const API = API_URL

const CITIES = ['Cluj-Napoca', 'București', 'Timișoara', 'Iași', 'Brașov', 'Sibiu', 'Constanța']
const SPECIALTIES = ['Wedding', 'Portrait', 'Newborn', 'Real Estate', 'Events', 'Fashion', 'Street', 'Nature']
const SORT_OPTIONS = [
  { value: 'relevance',       label: 'Most relevant' },
  { value: 'experience_desc', label: 'Most experienced' },
  { value: 'experience_asc',  label: 'Least experienced' },
]
const TYPE_OPTIONS = [
  { value: 'all',           label: 'All' },
  { value: 'photographers', label: 'Photographers' },
  { value: 'portfolios',    label: 'Portfolios' },
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q         = searchParams.get('q') || ''
  const city      = searchParams.get('city') || ''
  const specialty = searchParams.get('specialty') || ''
  const sortBy    = searchParams.get('sortBy') || 'relevance'
  const type      = searchParams.get('type') || 'all'

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    setSearchParams(next)
  }

  const activeFilterCount = [city, specialty, sortBy !== 'relevance', type !== 'all'].filter(Boolean).length

  useEffect(() => {
    if (q.length < 2) { setResults({ photographers: [], portfolios: [] }); return }
    setLoading(true)
    const params = new URLSearchParams({ q })
    if (city) params.set('city', city)
    if (specialty) params.set('specialty', specialty)
    if (sortBy !== 'relevance') params.set('sortBy', sortBy)
    if (type !== 'all') params.set('type', type)

    fetch(`${API}/search?${params}`)
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults({ photographers: [], portfolios: [] }))
      .finally(() => setLoading(false))
  }, [q, city, specialty, sortBy, type])

  const showPhotographers = type !== 'portfolios'
  const showPortfolios    = type !== 'photographers'
  const phCount  = results?.photographers?.length ?? 0
  const pfCount  = results?.portfolios?.length ?? 0
  const total    = (showPhotographers ? phCount : 0) + (showPortfolios ? pfCount : 0)

  return (
    <div className="search-results-page">
      <div className="page-container">

        {/* Header */}
        <div className="search-results-header">
          <span className="section-eyebrow">Search</span>
          <div className="search-results-title-row">
            <h1 className="section-heading">
              {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''} for "${q}"`}
            </h1>
            <button
              className={`search-filter-toggle ${activeFilterCount > 0 ? 'search-filter-toggle--active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
            >
              Filters {activeFilterCount > 0 && <span className="search-filter-badge">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="search-filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="search-filters-row">

                {/* Type */}
                <div className="search-filter-group">
                  <label className="search-filter-label">Show</label>
                  <div className="search-filter-pills">
                    {TYPE_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        className={`search-pill ${type === o.value ? 'search-pill--active' : ''}`}
                        onClick={() => setFilter('type', o.value === 'all' ? '' : o.value)}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div className="search-filter-group">
                  <label className="search-filter-label">City</label>
                  <select
                    className="search-filter-select"
                    value={city}
                    onChange={e => setFilter('city', e.target.value)}
                  >
                    <option value="">All cities</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Specialty */}
                <div className="search-filter-group">
                  <label className="search-filter-label">Specialty</label>
                  <select
                    className="search-filter-select"
                    value={specialty}
                    onChange={e => setFilter('specialty', e.target.value)}
                  >
                    <option value="">All specialties</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div className="search-filter-group">
                  <label className="search-filter-label">Sort by</label>
                  <select
                    className="search-filter-select"
                    value={sortBy}
                    onChange={e => setFilter('sortBy', e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {activeFilterCount > 0 && (
                  <button className="search-clear-btn" onClick={clearFilters}>Clear all</button>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="search-results-grid">
            {[1,2,3,4].map((i) => (
              <div key={i} className="skeleton search-result-skeleton" />
            ))}
          </div>
        ) : (
          <>
            {showPhotographers && phCount > 0 && (
              <section className="search-results-section">
                <h2 className="search-results-section-title">
                  Photographers <span className="search-count">({phCount})</span>
                </h2>
                <div className="search-results-grid">
                  {results.photographers.map((ph, i) => (
                    <motion.div
                      key={ph.slug}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <Link to={`/photographers/${ph.slug}`} className="search-ph-card">
                        {ph.avatar ? (
                          <img src={ph.avatar} alt={ph.name} className="search-ph-avatar" />
                        ) : (
                          <div className="search-ph-avatar-placeholder">{ph.name[0]}</div>
                        )}
                        <div className="search-ph-info">
                          <span className="search-ph-name">{ph.name}</span>
                          <span className="search-ph-meta">{ph.city} · {ph.experience} yrs</span>
                          {ph.specialties && (
                            <span className="search-ph-spec">
                              {(Array.isArray(ph.specialties) ? ph.specialties : ph.specialties.split(',')).slice(0, 2).join(' · ')}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {showPortfolios && pfCount > 0 && (
              <section className="search-results-section">
                <h2 className="search-results-section-title">
                  Portfolios <span className="search-count">({pfCount})</span>
                </h2>
                <div className="search-results-portfolio-grid">
                  {results.portfolios.map((p, i) => (
                    <motion.div
                      key={p.slug}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <Link to={`/portfolio/${p.slug}`} className="search-portfolio-card">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt={p.title} className="search-portfolio-cover" />
                        ) : (
                          <div className="search-portfolio-cover-placeholder">📷</div>
                        )}
                        <div className="search-portfolio-info">
                          <span className="search-portfolio-title">{p.title}</span>
                          <span className="search-portfolio-meta">
                            {p.photographerName} · {p.categoryName}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {total === 0 && results && (
              <div className="empty-state">
                <h3>No results found</h3>
                <p>
                  Try a different search term{activeFilterCount > 0 ? ', adjust your filters,' : ''} or browse{' '}
                  <Link to="/photographers">photographers</Link>.
                </p>
                {activeFilterCount > 0 && (
                  <button className="btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
