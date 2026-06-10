import { API_URL } from '../config.js'

const API = API_URL

export const uploadImage = async (token, file) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json() // { url: '/uploads/filename.jpg' }
}

export const getMyPortfolios = async (token) => {
  const res = await fetch(`${API}/portfolios/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch portfolios')
  return res.json()
}

export const createPortfolio = async (token, data) => {
  const res = await fetch(`${API}/portfolios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to create portfolio')
  }
  return res.json()
}

export const addImageToPortfolio = async (token, slug, imageUrl) => {
  const res = await fetch(`${API}/portfolios/${slug}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageUrl }),
  })
  if (!res.ok) throw new Error('Failed to add image')
  return res.json()
}

export const deletePortfolioImage = async (token, imageId) => {
  const res = await fetch(`${API}/portfolios/images/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete image')
}

export const setCoverImage = async (token, slug, imageUrl) => {
  const res = await fetch(`${API}/portfolios/${slug}/cover`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageUrl }),
  })
  if (!res.ok) throw new Error('Failed to set cover image')
  return res.json()
}

export const reorderPortfolioImages = async (token, slug, orderedIds) => {
  const res = await fetch(`${API}/portfolios/${slug}/images/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderedIds }),
  })
  if (!res.ok) throw new Error('Failed to reorder images')
  return res.json()
}
