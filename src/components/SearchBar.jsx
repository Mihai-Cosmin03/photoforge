import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CameraIcon } from './Icons'
import './SearchBar.css'

import { API_URL } from '../config.js'

const API = API_URL

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    fetch(`${API}/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hasResults =
    results && (results.photographers?.length > 0 || results.portfolios?.length > 0)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      setQuery('')
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const go = (path) => {
    navigate(path)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="search-bar-wrap" ref={wrapRef}>
      <div className="search-bar-input-wrap">
        <span className="search-bar-icon">⌕</span>
        <input
          ref={inputRef}
          className="search-bar-input"
          type="text"
          placeholder="Search photographers, portfolios…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button className="search-bar-clear" onClick={() => { setQuery(''); setResults(null) }}>
            ×
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {loading && <div className="search-dropdown-status">Searching…</div>}

            {!loading && !hasResults && results && (
              <div className="search-dropdown-status">No results for "{query}"</div>
            )}

            {!loading && hasResults && (
              <>
                {results.photographers.length > 0 && (
                  <div className="search-section">
                    <span className="search-section-label">Photographers</span>
                    {results.photographers.map((ph) => (
                      <button
                        key={ph.slug}
                        className="search-result-item"
                        onClick={() => go(`/photographers/${ph.slug}`)}
                      >
                        {ph.avatar ? (
                          <img src={ph.avatar} alt="" className="search-result-avatar" />
                        ) : (
                          <div className="search-result-avatar-placeholder">
                            {ph.name[0]}
                          </div>
                        )}
                        <div className="search-result-info">
                          <span className="search-result-name">{ph.name}</span>
                          <span className="search-result-sub">{ph.city}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.portfolios.length > 0 && (
                  <div className="search-section">
                    <span className="search-section-label">Portfolios</span>
                    {results.portfolios.map((p) => (
                      <button
                        key={p.slug}
                        className="search-result-item"
                        onClick={() => go(`/portfolio/${p.slug}`)}
                      >
                        {p.coverImage ? (
                          <img src={p.coverImage} alt="" className="search-result-cover" />
                        ) : (
                          <div className="search-result-cover-placeholder"><CameraIcon /></div>
                        )}
                        <div className="search-result-info">
                          <span className="search-result-name">{p.title}</span>
                          <span className="search-result-sub">
                            {p.photographerName} · {p.categoryName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  className="search-view-all"
                  onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); setQuery('') }}
                >
                  View all results for "{query}" →
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
