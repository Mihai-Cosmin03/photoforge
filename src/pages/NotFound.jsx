import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="notfound-page">
      <motion.div
        className="notfound-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="notfound-code" aria-hidden="true">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            ← Go back
          </button>
          <Link to="/" className="btn-primary">
            Browse Categories
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
