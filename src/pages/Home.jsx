import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import HeroCanvas from '../components/HeroCanvas'
import BlurImage from '../components/BlurImage'
import CameraAnimation from '../components/CameraAnimation'
import UserAvatar, { getDefaultAvatarIndex } from '../components/UserAvatar'
import { useCountUp } from '../hooks/useCountUp'
import { getAllCategories } from '../services/categoriesService'
import { getAllPhotographers } from '../services/photographersService'
import { getAllPortfolios } from '../services/portfoliosService'
import { API_URL } from '../config.js'
import FocusReticle from '../photo-fx/components/FocusReticle'
import './Home.css'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } },
})

const staggerContainer = (stagger = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: 0.1 } },
})

// ── Marquee strip ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Wedding', 'Portrait', 'Landscape', 'Architecture', 'Event',
  'Fine Art', 'Fashion', 'Documentary', 'Commercial', 'Lifestyle',
]

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="home-marquee" aria-hidden="true">
      <motion.div
        className="home-marquee__track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="home-marquee__item">
            {item} <span className="home-marquee__dot">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── Floating photo collage ────────────────────────────────────────────────────
const COLLAGE_POSITIONS = [
  { top: '8%',  left: '5%',  w: 220, rotate: -6,  delay: 0.2 },
  { top: '2%',  left: '34%', w: 170, rotate: 4,   delay: 0.4 },
  { top: '38%', left: '0%',  w: 190, rotate: 3,   delay: 0.5 },
  { top: '50%', left: '40%', w: 200, rotate: -5,  delay: 0.3 },
  { top: '70%', left: '10%', w: 160, rotate: 6,   delay: 0.6 },
  { top: '5%',  left: '68%', w: 180, rotate: -3,  delay: 0.35 },
  { top: '45%', left: '70%', w: 210, rotate: 5,   delay: 0.45 },
]

function PhotoCollage({ photos }) {
  const containerRef = useRef(null)

  return (
    <div className="home-collage" ref={containerRef} aria-hidden="true">
      {COLLAGE_POSITIONS.map((pos, i) => {
        const photo = photos[i % photos.length]
        if (!photo) return null
        return (
          <motion.div
            key={i}
            className="home-collage__frame"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.w,
              rotate: pos.rotate,
            }}
            initial={{ opacity: 0, y: 60, rotate: pos.rotate + 8 }}
            animate={{ opacity: 1, y: 0, rotate: pos.rotate }}
            transition={{ duration: 1, delay: pos.delay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.06, rotate: 0, zIndex: 10, transition: { duration: 0.3 } }}
          >
            <BlurImage src={photo} alt="" aspectRatio="3/4" objectFit="cover" />
          </motion.div>
        )
      })}
      {/* Gradient fade on the right */}
      <div className="home-collage__fade" />
    </div>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS_CLIENT = [
  { n: '01', icon: '🔍', title: 'Discover',     desc: 'Browse curated portfolios by category, style, or location. Use filters to find your perfect match.' },
  { n: '02', icon: '💬', title: 'Connect',       desc: 'Message photographers directly. Ask questions, share your vision, request a custom quote.' },
  { n: '03', icon: '📅', title: 'Book',          desc: 'Confirm availability, agree on details, and lock in your session — all inside PhotoForge.' },
]
const STEPS_PHOTOGRAPHER = [
  { n: '01', icon: '🎨', title: 'Build your profile', desc: 'Upload your best work, set your specialties, location, and pricing packages.' },
  { n: '02', icon: '✨', title: 'Get discovered',      desc: 'Your portfolio appears in search results and category pages seen by thousands of clients.' },
  { n: '03', icon: '💰', title: 'Grow your business',  desc: 'Receive booking requests, manage your calendar, and build lasting client relationships.' },
]

function HowItWorks() {
  const [tab, setTab] = useState('client')
  const steps = tab === 'client' ? STEPS_CLIENT : STEPS_PHOTOGRAPHER

  return (
    <section className="home-how">
      <div className="page-container">
        <motion.div
          className="home-how__header"
          variants={fadeUp()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-eyebrow">How it works</span>
          <h2 className="home-section-title">Simple. Powerful. Focused.</h2>
          <div className="home-how__tabs">
            <button
              className={`home-how__tab ${tab === 'client' ? 'active' : ''}`}
              onClick={() => setTab('client')}
            >
              I'm looking for a photographer
            </button>
            <button
              className={`home-how__tab ${tab === 'photographer' ? 'active' : ''}`}
              onClick={() => setTab('photographer')}
            >
              I'm a photographer
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="home-how__steps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {steps.map((step, i) => (
              <div key={step.n} className="home-how__step">
                <div className="home-how__step-num">{step.n}</div>
                <div className="home-how__step-icon">{step.icon}</div>
                <h3 className="home-how__step-title">{step.title}</h3>
                <p className="home-how__step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="home-how__step-arrow">→</div>}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ── Photographer spotlight cards ──────────────────────────────────────────────
function PhotographerSpotlight({ photographers }) {
  return (
    <section className="home-spotlight">
      <div className="page-container">
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-eyebrow">Meet the artists</span>
          <h2 className="home-section-title">Featured Photographers</h2>
        </motion.div>

        <motion.div
          className="home-spotlight__grid"
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {photographers.slice(0, 4).map((ph, i) => (
            <motion.div key={ph.slug} variants={fadeUp(i * 0.05)}>
              <Link to={`/photographers/${ph.slug}`} className="home-spotlight__card">
                <div className="home-spotlight__img-wrap">
                  <BlurImage src={ph.avatar} alt={ph.name} aspectRatio="3/4" objectFit="cover" />
                  <div className="home-spotlight__overlay">
                    <span className="home-spotlight__view">View Profile →</span>
                  </div>
                </div>
                <div className="home-spotlight__info">
                  <span className="home-spotlight__name">{ph.name}</span>
                  <span className="home-spotlight__city">{ph.city}</span>
                  <div className="home-spotlight__pills">
                    {(ph.specialties || []).slice(0, 2).map(s => (
                      <span key={s} className="pill">{s}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="home-spotlight__cta"
          variants={fadeUp(0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Link to="/photographers" className="btn-ghost">See all photographers →</Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Categories showcase ───────────────────────────────────────────────────────
function CategoriesShowcase({ categories }) {
  return (
    <section className="home-cats">
      <div className="page-container">
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="section-eyebrow">Explore</span>
          <h2 className="home-section-title">Every Style, Every Story</h2>
        </motion.div>

        <motion.div
          className="home-cats__grid"
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {categories.slice(0, 6).map((cat, i) => (
            <motion.div key={cat.slug} variants={fadeUp(i * 0.04)}>
              <Link to={`/categories/${cat.slug}`} className="home-cats__card">
                <BlurImage
                  src={cat.coverImage}
                  alt={cat.name}
                  aspectRatio={i === 0 || i === 3 ? '3/4' : '4/3'}
                  objectFit="cover"
                  wrapperClassName="home-cats__img"
                />
                <div className="home-cats__card-overlay">
                  <span className="home-cats__card-name">{cat.name}</span>
                  {cat.heroSubtitle && (
                    <span className="home-cats__card-sub">{cat.heroSubtitle}</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="home-cats__footer"
          variants={fadeUp(0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Link to="/categories" className="btn-ghost">Browse all categories →</Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Stats strip (with count-up) ───────────────────────────────────────────────
function StatItem({ num, suffix, label }) {
  const { ref, value } = useCountUp(num, 1400)
  return (
    <motion.div ref={ref} className="home-stats__item" variants={fadeUp()}>
      <span className="home-stats__value">
        {suffix === 'text' ? num : `${value}${suffix}`}
      </span>
      <span className="home-stats__label">{label}</span>
    </motion.div>
  )
}

function StatsStrip({ photographers, categories }) {
  const stats = [
    { num: photographers, suffix: '+',    label: 'Photographers' },
    { num: categories,    suffix: '',     label: 'Specialties'   },
    { num: '100%',        suffix: 'text', label: 'Curated & Verified' },
    { num: 'Free',        suffix: 'text', label: 'To Join'       },
  ]
  return (
    <motion.div
      className="home-stats"
      variants={staggerContainer(0.12)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {stats.map((s) => (
        <StatItem key={s.label} num={s.num} suffix={s.suffix} label={s.label} />
      ))}
    </motion.div>
  )
}

// ── Horizontal portfolio strip ────────────────────────────────────────────────
function PortfoliosStrip({ portfolios }) {
  const trackRef      = useRef(null)
  const containerRef  = useRef(null)

  if (!portfolios.length) return null

  return (
    <section className="home-strip">
      <div className="page-container">
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="home-strip__header"
        >
          <span className="section-eyebrow">Portfolio showcase</span>
          <h2 className="home-section-title">Explore outstanding work</h2>
        </motion.div>
      </div>

      <div className="home-strip__viewport" ref={containerRef}>
        <motion.div
          className="home-strip__track"
          ref={trackRef}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.04}
          dragTransition={{ bounceDamping: 30, bounceStiffness: 200 }}
          style={{ cursor: 'grab' }}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {portfolios.map((p, i) => (
            <motion.div
              key={p.slug}
              className="home-strip__card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03, transition: { duration: 0.25 } }}
            >
              <Link
                to={`/portfolio/${p.slug}`}
                className="home-strip__link"
                draggable={false}
                onClick={(e) => {
                  // prevent nav if user was dragging
                  if (Math.abs(parseInt(trackRef.current?.style.transform?.match(/-?\d+/)?.[0] ?? 0)) > 5) {
                    e.preventDefault()
                  }
                }}
              >
                <BlurImage
                  src={p.coverImage}
                  alt={p.title}
                  aspectRatio="3/4"
                  objectFit="cover"
                  wrapperClassName="home-strip__img"
                />
                <div className="home-strip__info">
                  <span className="home-strip__title">{p.title}</span>
                  {p.photographer && (
                    <span className="home-strip__author">{p.photographer.name}</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="page-container">
        <motion.div
          className="home-strip__footer"
          variants={fadeUp(0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <span className="home-strip__hint">← drag to explore →</span>
          <Link to="/categories" className="btn-ghost">View all portfolios →</Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function CtaSection({ user }) {
  return (
    <section className="home-cta">
      <HeroCanvas />
      <div className="home-cta__inner">
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="home-cta__content"
        >
          <motion.span className="section-eyebrow" variants={fadeUp()}>
            Start today
          </motion.span>
          <motion.h2 className="home-cta__title" variants={fadeUp(0.05)}>
            Your next great photo<br />starts here.
          </motion.h2>
          <motion.p className="home-cta__sub" variants={fadeUp(0.1)}>
            Join a growing community of photographers and clients.<br />
            It's free, fast, and built for visual storytellers.
          </motion.p>
          <motion.div className="home-cta__actions" variants={fadeUp(0.15)}>
            {user ? (
              <FocusReticle label="EXPLORE">
                <Link to="/photographers" className="btn-primary btn-lg">Explore Photographers</Link>
              </FocusReticle>
            ) : (
              <>
                <FocusReticle label="JOIN">
                  <Link to="/register" className="btn-primary btn-lg">Create your account</Link>
                </FocusReticle>
                <Link to="/photographers" className="btn-ghost btn-lg">Browse first</Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth()
  const [photographers, setPhotographers] = useState([])
  const [categories, setCategories]       = useState([])
  const [portfolios, setPortfolios]       = useState([])
  const [heroPhotos, setHeroPhotos]       = useState([])

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY     = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  useEffect(() => {
    async function load() {
      const [phs, cats, ports] = await Promise.all([
        getAllPhotographers(),
        getAllCategories(),
        getAllPortfolios(),
      ])
      setPhotographers(phs.filter(p => p.status === 'approved' || p.featured).slice(0, 8))
      const portfoliosByCat = {}
      ports.forEach(p => {
        const slug = p.category?.slug || p.categorySlug
        if (slug && p.coverImage && !portfoliosByCat[slug]) {
          portfoliosByCat[slug] = p.coverImage
        }
      })
      setCategories(cats.map(cat => ({
        ...cat,
        coverImage: cat.coverImage || portfoliosByCat[cat.slug] || `/cats/${cat.slug}.jpeg`,
      })))
      setPortfolios(ports.slice(0, 12))

      // Collect avatar images for the collage
      const avatars = phs
        .filter(p => p.avatar && !p.avatar.includes('placeholder'))
        .map(p => p.avatar.startsWith('http') ? p.avatar : `${API_URL}${p.avatar}`)
        .slice(0, 7)
      setHeroPhotos(avatars)
    }
    load()
  }, [])

  return (
    <div className="home-page">
      <Helmet>
        <title>PhotoForge — Discover Extraordinary Photography</title>
        <meta name="description" content="Browse curated portfolios from Romania's most talented photographers. Book sessions, explore styles, and find the visual voice that speaks to you." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="home-hero" ref={heroRef}>
        <HeroCanvas />

        <motion.div className="home-hero__inner" style={{ y: heroY, opacity: heroOpacity }}>
          {/* Left: text */}
          <motion.div
            className="home-hero__text"
            variants={staggerContainer(0.12)}
            initial="hidden"
            animate="show"
          >
            <motion.span className="section-eyebrow home-hero__eyebrow" variants={fadeUp()}>
              Premium Photography Platform
            </motion.span>

            <motion.h1 className="home-hero__title" variants={fadeUp(0.05)}>
              See the world<br />
              <span className="home-hero__title-accent">through a lens.</span>
            </motion.h1>

            <motion.p className="home-hero__subtitle" variants={fadeUp(0.1)}>
              Discover Romania's most talented photographers. Explore curated portfolios,
              book sessions, and bring your vision to life.
            </motion.p>

            <motion.div className="home-hero__actions" variants={fadeUp(0.15)}>
              <FocusReticle label="EXPLORE">
                <Link to="/photographers" className="btn-primary btn-lg">Explore Photographers</Link>
              </FocusReticle>
              <Link to="/categories" className="btn-ghost btn-lg">Browse Categories</Link>
            </motion.div>

            {photographers.length > 0 && (
              <motion.div className="home-hero__avatars" variants={fadeUp(0.2)}>
                <div className="home-hero__avatar-stack">
                  {photographers.slice(0, 5).map((ph, i) => (
                    <UserAvatar
                      key={ph.slug}
                      user={ph}
                      size={36}
                      avatarIndex={ph.avatar ? null : getDefaultAvatarIndex(ph)}
                      className="home-hero__avatar"
                      style={{ zIndex: 5 - i, marginLeft: i === 0 ? 0 : -12 }}
                    />
                  ))}
                </div>
                <span className="home-hero__avatar-label">
                  Join {photographers.length}+ photographers
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Right: camera + floating collage */}
          <div className="home-hero__right">
            <CameraAnimation />
            {heroPhotos.length > 0 && <PhotoCollage photos={heroPhotos} />}
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="home-hero__scroll"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── STATS ── */}
      <section className="home-stats-section">
        <div className="page-container">
          <StatsStrip photographers={photographers.length} categories={categories.length} />
        </div>
      </section>

      {/* ── PORTFOLIO STRIP ── */}
      {portfolios.length > 0 && <PortfoliosStrip portfolios={portfolios} />}

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── PHOTOGRAPHER SPOTLIGHT ── */}
      {photographers.length > 0 && <PhotographerSpotlight photographers={photographers} />}

      {/* ── CATEGORIES SHOWCASE ── */}
      {categories.length > 0 && <CategoriesShowcase categories={categories} />}

      {/* ── CTA ── */}
      <CtaSection user={user} />
    </div>
  )
}
