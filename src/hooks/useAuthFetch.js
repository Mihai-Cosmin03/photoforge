import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export function useAuthFetch() {
  const { token, handleUnauthorized } = useAuth()

  return useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const res = await fetch(url, { ...options, headers })

    if (res.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please log in again.')
    }

    return res
  }, [token, handleUnauthorized])
}
