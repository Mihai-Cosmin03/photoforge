import portfoliosMock from '../data/portfolios'
import photographersMock from '../data/photographers'
import categoriesMock from '../data/categories'

import { API_URL } from '../config.js'

const API = API_URL
const sorted = (arr) => [...arr].sort((a, b) => Number(b.featured) - Number(a.featured))

const fetchWithTimeout = (url, ms = 2000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

const shapeMock = (p) => ({
  ...p,
  images: p.images || [],
  photographer: photographersMock.find((ph) => ph.slug === p.photographerSlug) || null,
  category: categoriesMock.find((c) => c.slug === p.categorySlug) || null,
})

const toArray = (res) => (Array.isArray(res) ? res : res.data ?? [])

export const getAllPortfolios = async ({ categorySlug, photographerSlug } = {}) => {
  try {
    const params = new URLSearchParams()
    if (categorySlug) params.set('categorySlug', categorySlug)
    if (photographerSlug) params.set('photographerSlug', photographerSlug)
    const qs = params.toString()
    const res = await fetchWithTimeout(`${API}/portfolios${qs ? `?${qs}` : ''}`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    return toArray(json)
  } catch {
    let result = sorted(portfoliosMock)
    if (categorySlug) result = result.filter((p) => p.categorySlug === categorySlug)
    if (photographerSlug) result = result.filter((p) => p.photographerSlug === photographerSlug)
    return result.map(shapeMock)
  }
}

// Paginated version — returns { data, total, page, limit, totalPages }
export const getPortfoliosPaged = async ({ categorySlug, photographerSlug, page = 1, limit = 12 } = {}) => {
  try {
    const params = new URLSearchParams({ page, limit })
    if (categorySlug) params.set('categorySlug', categorySlug)
    if (photographerSlug) params.set('photographerSlug', photographerSlug)
    const res = await fetchWithTimeout(`${API}/portfolios?${params}`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    if (Array.isArray(json)) return { data: json, total: json.length, page: 1, totalPages: 1 }
    return json
  } catch {
    let result = sorted(portfoliosMock)
    if (categorySlug) result = result.filter((p) => p.categorySlug === categorySlug)
    if (photographerSlug) result = result.filter((p) => p.photographerSlug === photographerSlug)
    const data = result.map(shapeMock)
    return { data, total: data.length, page: 1, totalPages: 1 }
  }
}

export const getPortfolioBySlug = async (slug) => {
  try {
    const res = await fetchWithTimeout(`${API}/portfolios/${slug}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    const p = portfoliosMock.find((p) => p.slug === slug) || null
    return p ? shapeMock(p) : null
  }
}

export const getPortfoliosByCategory = async (categorySlug) => getAllPortfolios({ categorySlug })
export const getPortfoliosByPhotographer = async (photographerSlug) => getAllPortfolios({ photographerSlug })

export const getPortfoliosWithMaterialsEnabled = async () => {
  const all = await getAllPortfolios()
  return all.filter((p) => p.materialsEnabled)
}

export const getPortfolioCountByCategory = async (categorySlug) => {
  const portfolios = await getPortfoliosByCategory(categorySlug)
  return portfolios.length
}
