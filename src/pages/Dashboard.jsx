import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CardGridSkeleton } from '../components/Skeleton'
import './Dashboard.css'

import { API_URL } from '../config.js'

const API = API_URL

function StatCard({ label, value, sub, accent }) {
  return (
    <motion.div
      className={`dash-stat ${accent ? 'dash-stat--accent' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="dash-stat__value">{value}</span>
      <span className="dash-stat__label">{label}</span>
      {sub && <span className="dash-stat__sub">{sub}</span>}
    </motion.div>
  )
}

function BookingBar({ pending, accepted, rejected }) {
  const total = pending + accepted + rejected
  if (total === 0) return <div className="dash-bar-empty">No bookings yet</div>
  return (
    <div className="dash-booking-bar-wrap">
      <div className="dash-booking-bar">
        {accepted > 0 && (
          <div
            className="dash-booking-bar__seg dash-booking-bar__seg--accepted"
            style={{ width: `${(accepted / total) * 100}%` }}
            title={`Accepted: ${accepted}`}
          />
        )}
        {pending > 0 && (
          <div
            className="dash-booking-bar__seg dash-booking-bar__seg--pending"
            style={{ width: `${(pending / total) * 100}%` }}
            title={`Pending: ${pending}`}
          />
        )}
        {rejected > 0 && (
          <div
            className="dash-booking-bar__seg dash-booking-bar__seg--rejected"
            style={{ width: `${(rejected / total) * 100}%` }}
            title={`Declined: ${rejected}`}
          />
        )}
      </div>
      <div className="dash-booking-legend">
        <span className="dash-legend-dot dash-legend-dot--accepted" />{accepted} accepted
        <span className="dash-legend-dot dash-legend-dot--pending" />{pending} pending
        <span className="dash-legend-dot dash-legend-dot--rejected" />{rejected} declined
      </div>
    </div>
  )
}

function CompletenessCard({ completeness }) {
  if (!completeness) return null
  const { score, items } = completeness
  const color = score === 100 ? '#4ade80' : score >= 60 ? 'var(--gold)' : '#f87171'
  return (
    <div className="dash-card dash-completeness">
      <h2 className="dash-card__title">Profile completeness</h2>
      <div className="dash-completeness__score-row">
        <span className="dash-completeness__pct" style={{ color }}>{score}%</span>
        <div className="dash-completeness__bar-bg">
          <div
            className="dash-completeness__bar-fill"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
      </div>
      <ul className="dash-completeness__list">
        {items.map((item) => (
          <li key={item.label} className={`dash-completeness__item ${item.done ? 'done' : ''}`}>
            <span className="dash-completeness__check">{item.done ? '✓' : '○'}</span>
            {item.label}
          </li>
        ))}
      </ul>
      {score < 100 && (
        <Link to="/profile" className="dash-card__link">Complete your profile →</Link>
      )}
    </div>
  )
}

function MonthChart({ data }) {
  if (!data || data.length === 0) return <div className="dash-bar-empty">No bookings in the last 6 months</div>
  const max = Math.max(...data.map((d) => parseInt(d.count, 10)), 1)
  return (
    <div className="dash-chart">
      {data.map((d) => {
        const pct = (parseInt(d.count, 10) / max) * 100
        return (
          <div key={d.month} className="dash-chart__col">
            <span className="dash-chart__count">{d.count}</span>
            <div className="dash-chart__bar-wrap">
              <div className="dash-chart__bar" style={{ height: `${Math.max(pct, 4)}%` }} />
            </div>
            <span className="dash-chart__month">{d.month}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !user || user.role !== 'photographer') { setLoading(false); return }
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/photographers/my/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        const json = await res.json()
        setData(json)
      } catch {
        toast.error('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, user])

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'user') return <Navigate to="/profile" replace />

  if (loading) return (
    <div className="dash-page">
      <div className="page-container"><CardGridSkeleton count={6} /></div>
    </div>
  )

  if (!data) return (
    <div className="dash-page">
      <div className="page-container">
        <div className="empty-state">
          <h3>No photographer profile found</h3>
          <p>You need an approved photographer profile to access this dashboard.</p>
          <Link to="/profile" className="btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  )

  const totalBookings = data.bookings.pending + data.bookings.accepted + data.bookings.rejected

  return (
    <div className="dash-page">
      <div className="page-container">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-header__left">
            <span className="section-eyebrow">Photographer</span>
            <h1 className="dash-title">Dashboard</h1>
          </div>
          <div className="dash-header__actions">
            <Link to={`/photographers/${data.photographer.slug}`} className="btn-ghost btn-sm">
              View Profile
            </Link>
            <Link to="/profile" className="btn-primary btn-sm">
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Status banner if pending */}
        {data.photographer.status !== 'approved' && (
          <div className="dash-pending-banner">
            Your profile is pending admin review. Some features may be limited until approved.
          </div>
        )}

        {/* Stats grid */}
        <div className="dash-stats-grid">
          <StatCard label="Profile views" value={data.views.toLocaleString()} accent />
          <StatCard label="Saved by users" value={data.saves.toLocaleString()} />
          <StatCard
            label="Portfolios"
            value={data.portfolios.approved}
            sub={data.portfolios.pending > 0 ? `${data.portfolios.pending} pending review` : null}
          />
          <StatCard
            label="Rating"
            value={data.rating.avg > 0 ? `${data.rating.avg} ★` : '—'}
            sub={data.rating.total > 0 ? `${data.rating.total} reviews` : 'No reviews yet'}
          />
          <StatCard label="Total bookings" value={totalBookings} />
          <StatCard label="Accepted bookings" value={data.bookings.accepted} accent />
        </div>

        {/* Two columns */}
        <div className="dash-cols">

          {/* Bookings breakdown */}
          <div className="dash-card">
            <h2 className="dash-card__title">Booking requests</h2>
            <BookingBar
              pending={data.bookings.pending}
              accepted={data.bookings.accepted}
              rejected={data.bookings.rejected}
            />
            <Link to="/profile" className="dash-card__link">
              Manage requests →
            </Link>
          </div>

          {/* Bookings by month */}
          <div className="dash-card">
            <h2 className="dash-card__title">Bookings per month</h2>
            <MonthChart data={data.bookingsByMonth} />
          </div>

        </div>

        {/* Profile completeness */}
        <CompletenessCard completeness={data.completeness} />

        {/* Quick actions */}
        <div className="dash-card">
          <h2 className="dash-card__title">Quick actions</h2>
          <div className="dash-actions">
            <Link to="/profile" className="dash-action-btn">
              <span className="dash-action-btn__icon">📸</span>
              <span>Add portfolio</span>
            </Link>
            <Link to="/profile" className="dash-action-btn">
              <span className="dash-action-btn__icon">📅</span>
              <span>Set availability</span>
            </Link>
            <Link to="/profile" className="dash-action-btn">
              <span className="dash-action-btn__icon">💰</span>
              <span>Manage packages</span>
            </Link>
            <Link to="/conversations" className="dash-action-btn">
              <span className="dash-action-btn__icon">💬</span>
              <span>Messages</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
