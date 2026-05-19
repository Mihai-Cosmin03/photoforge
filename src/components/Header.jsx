import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import UserAvatar, { getDefaultAvatarIndex } from './UserAvatar'
import './Header.css'

export default function Header() {
  const { user, logout, token, profile } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    toast.info('You have been signed out.')
    setMenuOpen(false)
  }

  const navLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link'

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-brand">
            Photo<span>Forge</span>
          </Link>

          <nav className="header-nav">
            <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
            <NavLink to="/photographers" className={navLinkClass}>Photographers</NavLink>
            <NavLink to="/materials" className={navLinkClass}>Materials</NavLink>
          </nav>

          <SearchBar />
          <ThemeToggle />

          <div className="header-actions">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active nav-link--admin' : 'nav-link nav-link--admin'}>
                    Admin
                  </NavLink>
                )}
                {user.role === 'photographer' && (
                  <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                )}
                <NavLink to="/conversations" className={navLinkClass}>Messages</NavLink>
                <NotificationBell token={token} />
                <NavLink to="/profile" className={({ isActive }) => `nav-link header-profile-link${isActive ? ' active' : ''}`}>
                  <UserAvatar
                    user={profile ?? user}
                    size={30}
                    avatarIndex={(profile ?? user).avatar ? null : getDefaultAvatarIndex(profile ?? user)}
                    className="header-profile-avatar"
                  />
                  <span>{user.name}</span>
                </NavLink>
                <button onClick={handleLogout} className="btn-ghost btn-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`header-hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              {/* Header inside drawer */}
              <div className="mobile-menu__top">
                {user ? (
                  <div className="mobile-menu__user">
                    <UserAvatar
                      user={profile ?? user}
                      size={44}
                      avatarIndex={(profile ?? user).avatar ? null : getDefaultAvatarIndex(profile ?? user)}
                      className="mobile-menu__avatar"
                    />
                    <div>
                      <span className="mobile-menu__name">{user.name}</span>
                      <span className="mobile-menu__role">{user.role}</span>
                    </div>
                  </div>
                ) : (
                  <span className="mobile-menu__brand">PhotoForge</span>
                )}
                <ThemeToggle />
              </div>

              <div className="mobile-menu__links">
                <NavLink to="/" className={navLinkClass} end>Home</NavLink>
                <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
                <NavLink to="/photographers" className={navLinkClass}>Photographers</NavLink>
                <NavLink to="/materials" className={navLinkClass}>Materials</NavLink>

                {user && (
                  <>
                    <div className="mobile-menu__divider" />
                    <NavLink to="/conversations" className={navLinkClass}>Messages</NavLink>
                    <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                    {user.role === 'photographer' && (
                      <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                    )}
                    {user.role === 'admin' && (
                      <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active nav-link--admin' : 'nav-link nav-link--admin'}>
                        Admin
                      </NavLink>
                    )}
                  </>
                )}
              </div>

              <div className="mobile-menu__footer">
                {user ? (
                  <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%' }}>
                    Sign out
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/login" className="btn-ghost" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMenuOpen(false)}>Register</Link>
                  </div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
