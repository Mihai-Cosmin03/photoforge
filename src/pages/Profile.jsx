import { useState, useEffect, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import UserAvatar, { AvatarPicker, getDefaultAvatarIndex } from '../components/UserAvatar'
import PhotographerApplication from '../components/PhotographerApplication'
import MyPortfolios from '../components/MyPortfolios'
import EditPhotographerProfile from '../components/EditPhotographerProfile'
import MyBookings from '../components/MyBookings'
import MyGalleries from '../components/MyGalleries'
import PricingPackages from '../components/PricingPackages'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import { getProfile, updateProfile, uploadAvatar, getMyPhotographerProfile } from '../services/profileService'
import { CameraIcon, PaletteIcon } from '../components/Icons'
import './Profile.css'

export default function Profile() {
  const { user, token, refreshProfile } = useAuth()
  const toast = useToast()
  const fileRef = useRef(null)

  const [profile,      setProfile]      = useState(null)
  const [photographer, setPhotographer] = useState(undefined)

  // Edit state
  const [nameInput,    setNameInput]    = useState('')
  const [bioInput,     setBioInput]     = useState('')
  const [avatarIndex,  setAvatarIndex]  = useState(null)  // null = use auto/photo
  const [showPicker,   setShowPicker]   = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    if (!token) return
    getProfile(token).then((data) => {
      setProfile(data)
      setNameInput(data.name  || '')
      setBioInput(data.bio    || '')
      setAvatarIndex(data.avatarIndex ?? null)
    })
    getMyPhotographerProfile(token).then((ph) => setPhotographer(ph ?? null))
  }, [token])

  if (!user) return <Navigate to="/login" replace />

  const displayUser = { ...(profile || user), avatar: profile?.avatar ?? null }

  // Resolved avatar index to show in picker
  const resolvedIdx = avatarIndex ?? getDefaultAvatarIndex(displayUser)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadAvatar(token, file)
      setProfile(prev => ({ ...prev, avatar: url }))
      setAvatarIndex(null) // use photo now
      refreshProfile()
      toast.success('Photo updated!')
    } catch {
      toast.error('Upload failed. Max 5 MB, images only.')
    } finally {
      setUploading(false)
    }
  }

  const handleSelectAvatar = async (idx) => {
    setAvatarIndex(idx)
    setShowPicker(false)
    // Clear photo and save preset avatar
    setProfile(prev => ({ ...prev, avatar: null }))
    try {
      await updateProfile(token, { avatar: null, avatarIndex: idx })
      refreshProfile()
    } catch { /* non-critical */ }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateProfile(token, {
        name: nameInput,
        bio:  bioInput,
        avatarIndex: avatarIndex,
      })
      setProfile(prev => ({ ...prev, ...updated }))
      refreshProfile()
      toast.success('Profile saved.')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="page-container">

        {/* ── Profile Header ───────────────────────────────── */}
        <div className="profile-header">
          {/* Avatar with edit overlay */}
          <div className="profile-avatar-wrap">
            <UserAvatar
              user={displayUser}
              size={100}
              avatarIndex={displayUser.avatar ? null : resolvedIdx}
              className="profile-avatar-img"
            />
            <div className="profile-avatar-actions">
              <button
                className="profile-avatar-btn"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Upload photo"
              >
                {uploading ? '…' : <CameraIcon />}
              </button>
              <button
                className="profile-avatar-btn"
                onClick={() => setShowPicker(v => !v)}
                title="Choose avatar"
              >
                <PaletteIcon />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="profile-header-info">
            <h1 className="profile-name">{displayUser.name}</h1>
            <span className="profile-email">{displayUser.email}</span>
            {profile?.bio && (
              <p className="profile-bio-display">{profile.bio}</p>
            )}
            <span className="profile-since">
              Member since {new Date(profile?.createdAt || Date.now()).getFullYear()}
            </span>
          </div>
        </div>

        {/* ── Avatar Picker ─────────────────────────────────── */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              className="profile-picker-panel"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,   scale: 1     }}
              exit={{    opacity: 0, y: -8,   scale: 0.97  }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="profile-picker-header">
                <span className="profile-picker-title">Choose an avatar</span>
                <button className="profile-picker-close" onClick={() => setShowPicker(false)}>✕</button>
              </div>
              <AvatarPicker current={resolvedIdx} onSelect={handleSelectAvatar} />
              <p className="profile-picker-hint">
                Or{' '}
                <button
                  className="profile-picker-upload-link"
                  onClick={() => { setShowPicker(false); fileRef.current?.click() }}
                >
                  upload your own photo
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Saved Photographers ───────────────────────────── */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-eyebrow">Saved</span>
            <h2 className="section-heading">Saved Photographers</h2>
          </div>
          {!profile?.savedPhotographers?.length ? (
            <div className="empty-state">
              <h3>No saved photographers</h3>
              <p>Discover photographers and save your favorites here for quick access.</p>
            </div>
          ) : (
            <div className="profile-saved-grid">
              {profile.savedPhotographers.map((ph) => (
                <Link key={ph.slug} to={`/photographers/${ph.slug}`} className="profile-saved-card">
                  <UserAvatar user={ph} size={40} avatarIndex={ph.avatar ? null : getDefaultAvatarIndex(ph)} className="photographer-avatar-sm" />
                  <div>
                    <span className="photographer-name">{ph.name}</span>
                    <span className="photographer-meta">{ph.city}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Saved Portfolios ──────────────────────────────── */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-eyebrow">Saved</span>
            <h2 className="section-heading">Saved Portfolios</h2>
          </div>
          {!profile?.savedPortfolios?.length ? (
            <div className="empty-state">
              <h3>No saved portfolios</h3>
              <p>Browse portfolios and save the ones that inspire you.</p>
            </div>
          ) : (
            <div className="profile-saved-grid">
              {profile.savedPortfolios.map((p) => (
                <Link key={p.slug} to={`/portfolio/${p.slug}`} className="profile-saved-card">
                  {p.coverImage
                    ? <img src={p.coverImage} alt={p.title} className="permitted-item-img" />
                    : <div className="permitted-item-img permitted-item-img--placeholder" />
                  }
                  <span className="photographer-name">{p.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── My Bookings ───────────────────────────────────── */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-eyebrow">Sessions</span>
            <h2 className="section-heading">My Bookings</h2>
          </div>
          <MyBookings token={token} isPhotographer={photographer?.status === 'approved'} />
        </div>

        {/* ── Edit Photographer Profile ─────────────────────── */}
        {photographer?.status === 'approved' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="section-eyebrow">Photographer</span>
              <h2 className="section-heading">Edit Photographer Profile</h2>
            </div>
            <EditPhotographerProfile
              photographer={photographer}
              token={token}
              onSaved={() => getMyPhotographerProfile(token).then((ph) => setPhotographer(ph ?? null))}
            />
          </div>
        )}

        {/* ── Availability Calendar ─────────────────────────── */}
        {photographer?.status === 'approved' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="section-eyebrow">Schedule</span>
              <h2 className="section-heading">My Availability</h2>
              <p className="profile-section-hint">
                Click a day to mark it as available or busy. Clients see this calendar before booking.
              </p>
            </div>
            <AvailabilityCalendar
              photographerSlug={photographer.slug}
              token={token}
              isOwner={true}
            />
          </div>
        )}

        {/* ── Pricing Packages ──────────────────────────────── */}
        {photographer?.status === 'approved' && (
          <div className="profile-section">
            <PricingPackages
              photographerSlug={photographer.slug}
              token={token}
              isOwner={true}
            />
          </div>
        )}

        {/* ── Client Galleries ──────────────────────────────── */}
        {photographer?.status === 'approved' && (
          <div className="profile-section">
            <MyGalleries token={token} />
          </div>
        )}

        {/* ── My Portfolios ─────────────────────────────────── */}
        {photographer?.status === 'approved' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="section-eyebrow">My Work</span>
              <h2 className="section-heading">My Portfolios</h2>
            </div>
            <MyPortfolios />
          </div>
        )}

        {/* ── Photographer Application ──────────────────────── */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-eyebrow">Photographer</span>
            <h2 className="section-heading">Join as Photographer</h2>
          </div>
          <PhotographerApplication />
        </div>

        {/* ── Settings ──────────────────────────────────────── */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-eyebrow">Account</span>
            <h2 className="section-heading">Settings</h2>
          </div>
          <div className="profile-settings-card">
            <div className="profile-settings-field">
              <label className="settings-label">Display Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="settings-input"
                placeholder="Your display name"
              />
            </div>
            <div className="profile-settings-field">
              <label className="settings-label">Email Address</label>
              <input
                type="email"
                defaultValue={displayUser.email}
                className="settings-input"
                readOnly
              />
            </div>
            <div className="profile-settings-field">
              <label className="settings-label">Short Bio</label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="settings-input settings-textarea"
                placeholder="Tell us a little about yourself…"
                maxLength={200}
                rows={3}
              />
              <span className="settings-char-count">{bioInput.length}/200</span>
            </div>
            <button
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
