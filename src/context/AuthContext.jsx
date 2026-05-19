import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

import { API_URL } from '../config.js'

const API = API_URL

const AuthContext = createContext(null)

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const exp = getTokenExpiry(token)
  return exp !== null && Date.now() >= exp
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null)
  const expiryTimerRef = useRef(null)

  const fetchProfile = useCallback(async (t) => {
    try {
      const res = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch { /* non-critical */ }
  }, [])

  const scheduleExpiry = useCallback((t) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
    const exp = getTokenExpiry(t)
    if (!exp) return
    const msUntilExpiry = exp - Date.now()
    if (msUntilExpiry <= 0) return
    expiryTimerRef.current = setTimeout(() => {
      clear()
    }, msUntilExpiry)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const storedToken = localStorage.getItem('photoforge_token')
    const storedUser = localStorage.getItem('photoforge_user')
    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('photoforge_token')
        localStorage.removeItem('photoforge_user')
        return
      }
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        fetchProfile(storedToken)
        scheduleExpiry(storedToken)
      } catch {
        localStorage.removeItem('photoforge_token')
        localStorage.removeItem('photoforge_user')
      }
    }
    return () => { if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current) }
  }, [fetchProfile, scheduleExpiry])

  const clear = useCallback(() => {
    setUser(null)
    setToken(null)
    setProfile(null)
    localStorage.removeItem('photoforge_token')
    localStorage.removeItem('photoforge_user')
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
  }, [])

  const persist = useCallback((u, t) => {
    setUser(u)
    setToken(t)
    localStorage.setItem('photoforge_token', t)
    localStorage.setItem('photoforge_user', JSON.stringify(u))
    fetchProfile(t)
    scheduleExpiry(t)
  }, [fetchProfile, scheduleExpiry])

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Invalid credentials')
    }
    const data = await res.json()
    persist(data.user, data.accessToken)
    return data.user
  }

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Registration failed')
    }
    const data = await res.json()
    persist(data.user, data.accessToken)
    return data.user
  }

  const logout = useCallback(() => clear(), [clear])

  const refreshProfile = useCallback(() => {
    if (token) fetchProfile(token)
  }, [token, fetchProfile])

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  return (
    <AuthContext.Provider value={{ user, token, profile, authHeaders, login, register, logout, refreshProfile, handleUnauthorized: logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
