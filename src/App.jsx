import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { SavedProvider } from './context/SavedContext'
import { ThemeProvider } from './context/ThemeContext'
import FilmGrain from './components/FilmGrain'
import ScrollProgress from './components/ScrollProgress'
import BackToTop from './components/BackToTop'
import WelcomeEffect from './components/WelcomeEffect'
import ErrorBoundary from './components/ErrorBoundary'
import FlashCut from './photo-fx/components/FlashCut'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import Header from './components/Header'
import Footer from './components/Footer'
import Categories from './pages/Categories'
import CategoryDetails from './pages/CategoryDetails'
import PortfolioDetails from './pages/PortfolioDetails'
import Photographers from './pages/Photographers'
import PhotographerDetails from './pages/PhotographerDetails'
import Materials from './pages/Materials'
import Profile from './pages/Profile'
import Conversations from './pages/Conversations'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import GalleryView from './pages/GalleryView'
import './App.css'

const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: -8, scale: 0.99,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
}

function AnimatedRoutes() {
  const location = useLocation()
  const [flashing, setFlashing] = useState(false)
  const prevPath = useRef(location.pathname)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname
      setFlashing(true)
    }
  }, [location.pathname])

  return (
    <>
      <FlashCut show={flashing} onComplete={() => setFlashing(false)} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryDetails />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetails />} />
            <Route path="/photographers" element={<Photographers />} />
            <Route path="/photographers/:slug" element={<PhotographerDetails />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/gallery/:code" element={<GalleryView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
    <SavedProvider>
      <BrowserRouter>
        <Helmet defaultTitle="PhotoForge" titleTemplate="%s — PhotoForge">
          <meta name="description" content="Discover talented photographers and stunning portfolios on PhotoForge." />
          <meta property="og:site_name" content="PhotoForge" />
        </Helmet>
        <FilmGrain opacity={0.028} speed={3} />
        <WelcomeEffect />
        <ScrollProgress />
        <BackToTop />
        <div className="app-wrapper">
          <Header />
          <main className="app-main">
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </SavedProvider>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  )
}
