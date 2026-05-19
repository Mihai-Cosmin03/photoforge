import photographersMock from '../data/photographers'

import { API_URL } from '../config.js'

const API = API_URL
const sorted = (arr) => [...arr].sort((a, b) => Number(b.featured) - Number(a.featured))

const fetchWithTimeout = (url, ms = 2000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

// Extract array from paginated or flat response
const toArray = (res) => (Array.isArray(res) ? res : res.data ?? [])

export const getAllPhotographers = async ({ city, specialty } = {}) => {
  try {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (specialty) params.set('specialty', specialty)
    const qs = params.toString()
    const res = await fetchWithTimeout(`${API}/photographers${qs ? `?${qs}` : ''}`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    return toArray(json)
  } catch {
    let result = sorted(photographersMock)
    if (city) result = result.filter((p) => p.city.toLowerCase() === city.toLowerCase())
    if (specialty) result = result.filter((p) => p.specialties.includes(specialty))
    return result
  }
}

// Paginated version — returns { data, total, page, limit, totalPages }
export const getPhotographersPaged = async ({ city, specialty, page = 1, limit = 12 } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit })
    if (city) params.set('city', city)
    if (specialty) params.set('specialty', specialty)
    const res = await fetchWithTimeout(`${API}/photographers?${params}`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    if (Array.isArray(json)) return { data: json, total: json.length, page: 1, totalPages: 1 }
    return json
  } catch {
    let result = sorted(photographersMock)
    if (city) result = result.filter((p) => p.city.toLowerCase() === city.toLowerCase())
    if (specialty) result = result.filter((p) => p.specialties.includes(specialty))
    return { data: result, total: result.length, page: 1, totalPages: 1 }
  }
}

export const getPhotographerBySlug = async (slug) => {
  try {
    const res = await fetchWithTimeout(`${API}/photographers/${slug}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return photographersMock.find((p) => p.slug === slug) || null
  }
}

export const getFeaturedPhotographers = async () => {
  const all = await getAllPhotographers()
  return all.filter((p) => p.featured)
}

export const getPhotographersByCity = async (city) => getAllPhotographers({ city })
export const getPhotographersBySpecialty = async (specialty) => getAllPhotographers({ specialty })
