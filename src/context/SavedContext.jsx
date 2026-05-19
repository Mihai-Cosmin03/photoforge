import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  getProfile,
  savePhotographer,
  unsavePhotographer,
  savePortfolio,
  unsavePortfolio,
} from '../services/profileService'

const SavedContext = createContext(null)

export function SavedProvider({ children }) {
  const { user, token } = useAuth()
  const [savedPhotographerSlugs, setSavedPhotographerSlugs] = useState([])
  const [savedPortfolioSlugs, setSavedPortfolioSlugs] = useState([])

  // Load saved items when user logs in
  useEffect(() => {
    if (!token) {
      setSavedPhotographerSlugs([])
      setSavedPortfolioSlugs([])
      return
    }
    getProfile(token)
      .then((profile) => {
        setSavedPhotographerSlugs(profile.savedPhotographers?.map((p) => p.slug) ?? [])
        setSavedPortfolioSlugs(profile.savedPortfolios?.map((p) => p.slug) ?? [])
      })
      .catch(() => {})
  }, [token])

  const togglePhotographer = useCallback(
    async (slug) => {
      if (!token) throw new Error('not_logged_in')
      const isSaved = savedPhotographerSlugs.includes(slug)
      if (isSaved) {
        await unsavePhotographer(token, slug)
        setSavedPhotographerSlugs((prev) => prev.filter((s) => s !== slug))
      } else {
        await savePhotographer(token, slug)
        setSavedPhotographerSlugs((prev) => [...prev, slug])
      }
      return !isSaved // returns new saved state
    },
    [token, savedPhotographerSlugs],
  )

  const togglePortfolio = useCallback(
    async (slug) => {
      if (!token) throw new Error('not_logged_in')
      const isSaved = savedPortfolioSlugs.includes(slug)
      if (isSaved) {
        await unsavePortfolio(token, slug)
        setSavedPortfolioSlugs((prev) => prev.filter((s) => s !== slug))
      } else {
        await savePortfolio(token, slug)
        setSavedPortfolioSlugs((prev) => [...prev, slug])
      }
      return !isSaved
    },
    [token, savedPortfolioSlugs],
  )

  return (
    <SavedContext.Provider
      value={{
        savedPhotographerSlugs,
        savedPortfolioSlugs,
        togglePhotographer,
        togglePortfolio,
        isPhotographerSaved: (slug) => savedPhotographerSlugs.includes(slug),
        isPortfolioSaved: (slug) => savedPortfolioSlugs.includes(slug),
      }}
    >
      {children}
    </SavedContext.Provider>
  )
}

export const useSaved = () => useContext(SavedContext)
