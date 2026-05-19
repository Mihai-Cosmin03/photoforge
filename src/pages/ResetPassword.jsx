import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config.js'
import './Auth.css'

const API = API_URL

export default function ResetPassword() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const toast                   = useToast()
  const token                   = searchParams.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')
      toast.success('Password reset! You can now log in.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please request a new link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Photo<span>Forge</span></div>
        <h1 className="auth-heading">New password</h1>
        <p className="auth-subheading">Choose a strong password for your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              className="auth-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!token}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              className="auth-input"
              placeholder="Repeat the password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={!token}
            />
          </div>
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading || !token}
          >
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login" className="auth-switch-link">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}
