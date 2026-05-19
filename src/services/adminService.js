import { API_URL } from '../config.js'

const API = `${API_URL}/admin`

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const getPendingPortfolios = async (token) => {
  const res = await fetch(`${API}/portfolios/pending`, { headers: headers(token) })
  if (!res.ok) throw new Error('Failed to fetch pending portfolios')
  return res.json()
}

export const approvePortfolio = async (token, id) => {
  const res = await fetch(`${API}/portfolios/${id}/approve`, {
    method: 'PATCH',
    headers: headers(token),
  })
  if (!res.ok) throw new Error('Failed to approve portfolio')
  return res.json()
}

export const rejectPortfolio = async (token, id) => {
  const res = await fetch(`${API}/portfolios/${id}/reject`, {
    method: 'PATCH',
    headers: headers(token),
  })
  if (!res.ok) throw new Error('Failed to reject portfolio')
  return res.json()
}

export const getPendingPhotographers = async (token) => {
  const res = await fetch(`${API}/photographers/pending`, { headers: headers(token) })
  if (!res.ok) throw new Error('Failed to fetch pending photographers')
  return res.json()
}

export const approvePhotographer = async (token, id) => {
  const res = await fetch(`${API}/photographers/${id}/approve`, {
    method: 'PATCH',
    headers: headers(token),
  })
  if (!res.ok) throw new Error('Failed to approve photographer')
  return res.json()
}

// ── Reviews ───────────────────────────────────────────────────────────
export const getAllReviews = async (token) => {
  const res = await fetch(`${API}/reviews`, { headers: headers(token) })
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

export const deleteReview = async (token, id) => {
  const res = await fetch(`${API}/reviews/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error('Failed to delete review')
  return res.json()
}

// ── Categories ────────────────────────────────────────────────────────
const CAT_API = `${API_URL}/categories`

export const adminUpdateCategory = async (token, id, data) => {
  const res = await fetch(`${CAT_API}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export const adminToggleFeatured = async (token, id, featured) => {
  const res = await fetch(`${CAT_API}/${id}/featured`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ featured }),
  })
  if (!res.ok) throw new Error('Failed to toggle featured')
  return res.json()
}

export const getGlobalStats = async (token) => {
  const res = await fetch(`${API}/stats`, { headers: headers(token) })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export const getAllUsers = async (token) => {
  const res = await fetch(`${API}/users`, { headers: headers(token) })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export const updateUserRole = async (token, id, role) => {
  const res = await fetch(`${API}/users/${id}/role`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}

export const deleteUser = async (token, id) => {
  const res = await fetch(`${API}/users/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error('Failed to delete user')
  return res.json()
}

export const getAuditLog = async (token) => {
  const res = await fetch(`${API}/audit-log`, { headers: headers(token) })
  if (!res.ok) throw new Error('Failed to fetch audit log')
  return res.json()
}
