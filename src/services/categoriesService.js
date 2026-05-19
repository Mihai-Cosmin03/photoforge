import categoriesMock from '../data/categories'

import { API_URL } from '../config.js'

const API = API_URL
const sorted = (arr) => [...arr].sort((a, b) => Number(b.featured) - Number(a.featured))

const fetchWithTimeout = (url, ms = 2000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

export const getAllCategories = async () => {
  try {
    const res = await fetchWithTimeout(`${API}/categories`)
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return sorted(categoriesMock)
  }
}

export const getCategoryBySlug = async (slug) => {
  try {
    const res = await fetchWithTimeout(`${API}/categories/${slug}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return categoriesMock.find((c) => c.slug === slug) || null
  }
}

export const getFeaturedCategories = async () => {
  const all = await getAllCategories()
  return all.filter((c) => c.featured)
}
