import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config.js'
import './Auth.css'

const API = API_URL

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError('Please enter a valid email.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Photo<span>Forge</span></div>
        <h1 className="auth-heading">Reset password</h1>
        <p className="auth-subheading">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div className="auth-error">{error}</div>}

        {success ? (
          <div className="auth-success">
            Check your inbox — if this email is registered, a reset link is on its way.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login" className="auth-switch-link">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}
