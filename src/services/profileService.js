import { API_URL } from '../config.js'

const API = API_URL

export const getMyPhotographerProfile = async (token) => {
  const res = await fetch(`${API}/photographers/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 404) return null
  if (!res.ok) return null
  return res.json()
}

export const applyAsPhotographer = async (token, data) => {
  const res = await fetch(`${API}/photographers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, status: 'pending' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Application failed')
  }
  return res.json()
}


export const getProfile = async (token) => {
  const res = await fetch(`${API}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export const updateProfile = async (token, data) => {
  const res = await fetch(`${API}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export const uploadAvatar = async (token, file) => {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API}/profile/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) throw new Error('Failed to upload avatar')
  return res.json() // { url }
}

export const savePhotographer = async (token, slug) => {
  const res = await fetch(`${API}/profile/save/photographer/${slug}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to save photographer')
}

export const unsavePhotographer = async (token, slug) => {
  const res = await fetch(`${API}/profile/save/photographer/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to unsave photographer')
}

export const savePortfolio = async (token, slug) => {
  const res = await fetch(`${API}/profile/save/portfolio/${slug}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to save portfolio')
}

export const unsavePortfolio = async (token, slug) => {
  const res = await fetch(`${API}/profile/save/portfolio/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to unsave portfolio')
}
