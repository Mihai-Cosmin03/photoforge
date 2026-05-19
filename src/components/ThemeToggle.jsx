import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import './ThemeToggle.css'

const ICONS = {
  dark:  { symbol: '◐', label: 'Dark'  },
  paper: { symbol: '✦', label: 'Paper' },
}

export default function ThemeToggle() {
  const { theme, cycle } = useTheme()
  const icon = ICONS[theme]

  return (
    <button
      className={`theme-toggle theme-toggle--${theme}`}
      onClick={cycle}
      title={`Theme: ${icon.label} — click to cycle`}
      aria-label={`Switch theme (current: ${icon.label})`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          className="theme-toggle__icon"
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0,   scale: 1   }}
          exit={{    opacity: 0, rotate:  90,  scale: 0.6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {icon.symbol}
        </motion.span>
      </AnimatePresence>
      <span className="theme-toggle__label">{icon.label}</span>
    </button>
  )
}
