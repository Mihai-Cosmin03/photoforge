import { useState, useEffect } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PortfolioCard from '../components/PortfolioCard'
import ContactSheet from '../photo-fx/components/ContactSheet'
import UserAvatar, { getDefaultAvatarIndex } from '../components/UserAvatar'
import SaveButton from '../components/SaveButton'
import ShareButton from '../components/ShareButton'
import Reviews from '../components/Reviews'
import PricingPackages from '../components/PricingPackages'
import BookingModal from '../components/BookingModal'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import { CardGridSkeleton, Skeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePolaroidToast } from '../photo-fx/components/PolaroidToast'
import { getPhotographerBySlug } from '../services/photographersService'
import { getPortfoliosByPhotographer } from '../services/portfoliosService'
import './PhotographerDetails.css'

function StatValue({ value }) {
  const num = typeof value === 'number' ? value : (value === '—' ? null : Number(value))
  const { ref, value: animated } = useCountUp(num ?? 0)
  if (num == null || isNaN(num)) return <span>—</span>
  return <span ref={ref}>{animated}</span>
}

import { API_URL } from '../config.js'

const API = API_URL

export default function PhotographerDetails() {
  const { slug } = useParams()
  const { user, token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { show: showPolaroid, Toasts: PolaroidToasts } = usePolaroidToast()

  const [photographer, setPhotographer] = useState(null)
  const [portfolios, setPortfolios]     = useState([])
  const [stats, setStats]               = useState(null)
  const [myPhotographer, setMyPhotographer] = useState(null) // logged-in user's photographer profile
  const [loading, setLoading]           = useState(true)
  const [notFound, setNotFound]         = useState(false)
  const [showBooking, setShowBooking]   = useState(false)
  const [bookingType, setBookingType]   = useState('Portrait') // or 'consultation'

  useEffect(() => {
    async function load() {
      setLoading(true)
      const ph = await getPhotographerBySlug(slug)
      if (!ph) { setNotFound(true); setLoading(false); return }

      const [portfolioList] = await Promise.all([
        getPortfoliosByPhotographer(slug),
        fetch(`${API}/photographers/${slug}/view`, { method: 'POST' }).catch(() => null),
      ])
      setPhotographer(ph)
      setPortfolios(portfolioList)
      setLoading(false)

      // Non-blocking extras
      fetch(`${API}/photographers/${slug}/stats`)
        .then(r => r.ok ? r.json() : null).then(s => { if (s) setStats(s) }).catch(() => null)
    }
    load()
  }, [slug])

  // Check if logged-in user is the owner of this profile
  useEffect(() => {
    if (!token) return
    fetch(`${API}/photographers/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(ph => setMyPhotographer(ph))
      .catch(() => null)
  }, [token])

  const isOwner = myPhotographer?.slug === slug

  if (loading) return (
    <div className="page-container" style={{ paddingTop: 'var(--space-7)' }}>
      <Skeleton style={{ height: 220, borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-7)' }} />
      <CardGridSkeleton count={4} />
    </div>
  )

  if (notFound) return (
    <div className="page-container" style={{ paddingTop: 'var(--space-10)' }}>
      <div className="empty-state">
        <h3>Photographer Not Found</h3>
        <p>This photographer profile doesn't exist or has been removed.</p>
        <Link to="/photographers" className="btn-primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          All Photographers
        </Link>
      </div>
    </div>
  )

  return (
    <div className="photographer-details-page">
      <Helmet>
        <title>{photographer.name} — PhotoForge</title>
        <meta name="description" content={`${photographer.name} is a photographer based in ${photographer.city}. ${photographer.bio?.slice(0, 100) ?? ''}`} />
        {photographer.avatar && <meta property="og:image" content={photographer.avatar} />}
        <meta property="og:title" content={`${photographer.name} — PhotoForge`} />
        <meta property="og:type" content="profile" />
      </Helmet>
      <div className="page-container">
        <Link to="/photographers" className="back-link">← All Photographers</Link>

        {/* ── Profile Hero ─────────────────────────────── */}
        <div className="photographer-profile-hero">
          <div className="photographer-profile-avatar-wrap">
            <UserAvatar
              user={photographer}
              size={120}
              avatarIndex={photographer.avatar ? null : getDefaultAvatarIndex(photographer)}
              className="photographer-profile-avatar"
            />
            {photographer.featured && (
              <span className="featured-badge photographer-featured-badge">Featured</span>
            )}
          </div>

          <div className="photographer-profile-info">
            <div className="photographer-profile-name-row">
              <h1 className="photographer-profile-name">
                {photographer.name}
                {photographer.status === 'approved' && (
                  <span className="verified-badge verified-badge--inline" title="Verified photographer">✓ Verified</span>
                )}
              </h1>
              <div className="photographer-profile-actions">
                <SaveButton type="photographer" slug={photographer.slug} label={photographer.name} />
                <ShareButton title={photographer.name} text={`Check out ${photographer.name} on PhotoForge`} />
                {!isOwner && (
                  <>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => {
                        if (!user) { toast.info('Sign in to message photographers.'); navigate('/login'); return }
                        navigate(`/conversations?start=${photographer.id}`)
                      }}
                    >Message</button>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => {
                        if (!user) { toast.info('Sign in to book a session.'); navigate('/login'); return }
                        setBookingType('Portrait')
                        setShowBooking(true)
                      }}
                    >Book Session</button>
                    <button
                      className="btn-ghost btn-sm"
                      style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)' }}
                      onClick={() => {
                        if (!user) { toast.info('Sign in to request a call.'); navigate('/login'); return }
                        setBookingType('consultation')
                        setShowBooking(true)
                      }}
                    >📞 Intro Call</button>
                  </>
                )}
              </div>
            </div>

            <div className="photographer-profile-meta-row">
              <span className="photographer-profile-city">{photographer.city}</span>
              <span className="experience-badge">{photographer.experience} years experience</span>
            </div>

            <div className="specialty-pills" style={{ marginTop: 'var(--space-3)' }}>
              {(photographer.specialties || []).map(s => (
                <Link key={s} to={`/categories/${s}`} className="pill">{s}</Link>
              ))}
            </div>

            <p className="photographer-profile-bio">{photographer.bio}</p>

            <div className="photographer-profile-stats">
              <div className="photographer-stat">
                <span className="photographer-stat-value">
                  <StatValue value={stats ? stats.portfolios : portfolios.length} />
                </span>
                <span className="photographer-stat-label">Portfolios</span>
              </div>
              <div className="photographer-stat">
                <span className="photographer-stat-value">
                  <StatValue value={photographer.experience} />
                </span>
                <span className="photographer-stat-label">Years</span>
              </div>
              <div className="photographer-stat">
                <span className="photographer-stat-value">
                  <StatValue value={stats != null ? stats.saves : '—'} />
                </span>
                <span className="photographer-stat-label">Saves</span>
              </div>
              <div className="photographer-stat">
                <span className="photographer-stat-value">
                  <StatValue value={stats != null ? stats.views : '—'} />
                </span>
                <span className="photographer-stat-label">Views</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pricing Packages ──────────────────────────── */}
        <div className="ph-detail-section">
          <PricingPackages
            photographerSlug={slug}
            token={token}
            isOwner={isOwner}
          />
        </div>

        {/* ── Availability Calendar ─────────────────────── */}
        <div className="ph-detail-section">
          <span className="section-eyebrow">Availability</span>
          <h2 className="section-heading" style={{ marginBottom: 'var(--space-4)' }}>
            {isOwner ? 'Manage Your Availability' : 'Check Availability'}
          </h2>
          <AvailabilityCalendar
            photographerSlug={slug}
            token={token}
            isOwner={isOwner}
          />
        </div>

        {/* ── Portfolios ────────────────────────────────── */}
        <div className="photographer-portfolios-section ph-detail-section">
          <div className="photographer-portfolios-header">
            <span className="section-eyebrow">Work</span>
            <h2 className="section-heading">Portfolios by {photographer.name}</h2>
          </div>
          {portfolios.length === 0 ? (
            <div className="empty-state">
              <h3>No portfolios yet</h3>
              <p>This photographer hasn't published any portfolios yet.</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              <ContactSheet stagger={60}>
                {portfolios.map(p => (
                  <PortfolioCard key={p.slug} portfolio={p} photographer={photographer} />
                ))}
              </ContactSheet>
            </div>
          )}
        </div>

        {/* ── Reviews ───────────────────────────────────── */}
        <div className="ph-detail-section">
          <span className="section-eyebrow">Reviews</span>
          <h2 className="section-heading" style={{ marginBottom: 'var(--space-4)' }}>
            What clients say
          </h2>
          <Reviews
            photographerSlug={slug}
            token={token}
            userId={user?.id}
          />
        </div>
      </div>

      {/* Booking Modal */}
      <PolaroidToasts />

      {showBooking && (
        <BookingModal
          photographer={photographer}
          token={token}
          initialType={bookingType}
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            showPolaroid({
              title: bookingType === 'consultation' ? 'Call Requested!' : 'Session Requested!',
              body: bookingType === 'consultation'
                ? `${photographer.name} will reach out to schedule your intro call.`
                : `Your request to ${photographer.name} is on its way.`,
              icon: bookingType === 'consultation' ? '📞' : '📸',
              color: '#8B5CF6',
            })
            setTimeout(() => navigate('/profile'), 2000)
          }}
        />
      )}
    </div>
  )
}
