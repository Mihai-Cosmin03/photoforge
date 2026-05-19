import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import './Reviews.css'

import { API_URL } from '../config.js'

const API = API_URL

function StarDisplay({ rating, max = 5, size = 'md' }) {
  return (
    <span className={`star-display star-display--${size}`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? 'star star--filled' : 'star star--empty'}>
          ★
        </span>
      ))}
    </span>
  )
}

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const [popped, setPopped] = useState(0)

  const handleClick = (star) => {
    onChange(star)
    setPopped(star)
    setTimeout(() => setPopped(0), 350)
  }

  return (
    <span className="star-selector" role="group" aria-label="Select star rating">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        const active = star <= (hovered || value)
        return (
          <motion.button
            key={star}
            type="button"
            className={`star-btn ${active ? 'star-btn--active' : ''}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(star)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            animate={popped === star ? { scale: [1, 1.45, 1] } : {}}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            ★
          </motion.button>
        )
      })}
    </span>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Reviews({ photographerSlug, token, userId }) {
  const toast = useToast()

  const [reviews, setReviews]       = useState([])
  const [avgRating, setAvgRating]   = useState(0)
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const [rating, setRating]         = useState(0)
  const [text, setText]             = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/reviews`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setReviews(data.reviews ?? [])
      setAvgRating(data.avgRating ?? 0)
      setTotal(data.total ?? 0)
    } catch (err) {
      setError('Failed to load reviews.')
    } finally {
      setLoading(false)
    }
  }, [photographerSlug])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.warning('Please select a star rating.'); return }
    if (!text.trim()) { toast.warning('Please write something in your review.'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, text: text.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `HTTP ${res.status}`)
      }
      toast.success('Review submitted!')
      setRating(0)
      setText('')
      await fetchReviews()
    } catch (err) {
      toast.error(err.message || 'Could not submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="reviews">
      {/* Summary */}
      <div className="reviews__summary">
        <span className="reviews__avg">
          <span className="reviews__avg-star">★</span>
          {avgRating > 0 ? Number(avgRating).toFixed(1) : '—'}
        </span>
        <span className="reviews__count">
          {total} {total === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {/* List */}
      {loading && (
        <div className="reviews__loading">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="review-card review-card--skeleton" />
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="reviews__error">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="reviews__empty">No reviews yet. Be the first to leave one!</p>
      )}

      <AnimatePresence initial={false}>
        {!loading && !error && reviews.map((review, i) => (
          <motion.div
            key={review.id}
            className="review-card"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            layout
          >
            <div className="review-card__header">
              <div className="review-card__author-block">
                <span className="review-card__username">{review.userName}</span>
                <StarDisplay rating={review.rating} />
              </div>
              <time className="review-card__date" dateTime={review.createdAt}>
                {formatDate(review.createdAt)}
              </time>
            </div>
            <p className="review-card__text">{review.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Leave a review */}
      {token && (
        <motion.div
          className="reviews__form-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="reviews__form-title">Leave a Review</h3>
          <form className="reviews__form" onSubmit={handleSubmit} noValidate>
            <div className="reviews__form-row">
              <label className="reviews__label">Your Rating</label>
              <StarSelector value={rating} onChange={setRating} />
            </div>

            <div className="reviews__form-row">
              <label className="reviews__label" htmlFor="review-text">Your Review</label>
              <textarea
                id="review-text"
                className="reviews__textarea"
                placeholder="Share your experience…"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={submitting}
                maxLength={1000}
              />
              <span className="reviews__char-count">{text.length}/1000</span>
            </div>

            <button
              type="submit"
              className="reviews__submit-btn"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </motion.div>
      )}
    </section>
  )
}
