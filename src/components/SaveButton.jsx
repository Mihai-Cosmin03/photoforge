import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSaved } from '../context/SavedContext'
import { useToast } from '../context/ToastContext'
import './SaveButton.css'

/**
 * @param {'photographer' | 'portfolio'} type
 * @param {string} slug
 * @param {string} label  — name of the item being saved (for toast message)
 */
export default function SaveButton({ type, slug, label }) {
  const { user } = useAuth()
  const { isPhotographerSaved, isPortfolioSaved, togglePhotographer, togglePortfolio } = useSaved()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const isSaved =
    type === 'photographer' ? isPhotographerSaved(slug) : isPortfolioSaved(slug)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.info('Sign in to save items to your profile.')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const nowSaved =
        type === 'photographer'
          ? await togglePhotographer(slug)
          : await togglePortfolio(slug)

      if (nowSaved) {
        toast.success(`${label} saved to your profile.`)
      } else {
        toast.info(`${label} removed from saved.`)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      className={`save-btn ${isSaved ? 'save-btn--saved' : ''}`}
      onClick={handleClick}
      disabled={loading}
      whileTap={{ scale: 0.88 }}
      title={isSaved ? 'Remove from saved' : 'Save'}
      aria-label={isSaved ? `Remove ${label} from saved` : `Save ${label}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isSaved ? 'saved' : 'unsaved'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{    scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="save-btn__icon"
        >
          {isSaved ? '♥' : '♡'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
