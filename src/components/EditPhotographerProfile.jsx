import { useState, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import UserAvatar, { getDefaultAvatarIndex } from './UserAvatar'
import { CameraIcon } from './Icons'
import './EditPhotographerProfile.css'

import { API_URL } from '../config.js'

const API = API_URL

const SPECIALTIES = [
  'wedding','portrait','landscape','event','fashion','street','newborn','commercial',
]

export default function EditPhotographerProfile({ photographer, token, onSaved }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    bio: photographer.bio || '',
    city: photographer.city || '',
    experience: photographer.experience ?? 0,
    avatar: photographer.avatar || '',
    specialties: photographer.specialties || [],
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggleSpecialty = (s) => {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      setForm((f) => ({ ...f, avatar: url }))
      toast.success('Photo updated!')
    } catch {
      toast.error('Upload failed. Max 5 MB, images only.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API}/photographers/my`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated!')
      onSaved?.()
    } catch {
      toast.error('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const previewUser = { ...photographer, avatar: form.avatar || null }

  return (
    <form className="edit-ph-form" onSubmit={handleSave}>

      {/* Avatar upload */}
      <div className="form-field">
        <label className="settings-label">Profile Photo</label>
        <div className="edit-ph-avatar-row">
          <UserAvatar
            user={previewUser}
            size={72}
            avatarIndex={form.avatar ? null : getDefaultAvatarIndex(photographer)}
            className="edit-ph-avatar-preview"
          />
          <div className="edit-ph-avatar-actions">
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : <><CameraIcon /> Upload Photo</>}
            </button>
            {form.avatar && (
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setForm((f) => ({ ...f, avatar: '' }))}
              >
                Remove
              </button>
            )}
            <span className="settings-note">Max 5 MB · JPG, PNG, WebP</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>
      </div>

      <div className="edit-ph-grid">
        <div className="form-field">
          <label className="settings-label">City</label>
          <input
            className="settings-input"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="e.g. Cluj-Napoca"
          />
        </div>
        <div className="form-field">
          <label className="settings-label">Years of Experience</label>
          <input
            className="settings-input"
            type="number"
            min={0}
            max={50}
            value={form.experience}
            onChange={(e) => setForm((f) => ({ ...f, experience: +e.target.value }))}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="settings-label">Bio</label>
        <textarea
          className="settings-input"
          rows={4}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="Tell clients about yourself…"
        />
      </div>

      <div className="form-field">
        <label className="settings-label">Specialties</label>
        <div className="edit-ph-specialties">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pill ${form.specialties.includes(s) ? 'active' : ''}`}
              onClick={() => toggleSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}
