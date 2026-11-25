
import { useEffect, useState } from 'react'

import { AuthContext } from './authContextValue'

import api, {
  getToken,
  saveToken,
  saveRefreshToken,
  clearToken,
} from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(
    () => Boolean(getToken())
  )

  useEffect(() => {
    let cancelled = false

    function handleSessionExpired() {
      setUser(null)
      setLoading(false)
    }

    window.addEventListener(
      'auth:session-expired',
      handleSessionExpired
    )

    async function restoreSession() {
      const token = getToken()

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const userData = await api.get('/auth/me')

        if (!cancelled) {
          setUser(userData)
        }
      } catch {
        if (!cancelled) {
          clearToken()
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true

      window.removeEventListener(
        'auth:session-expired',
        handleSessionExpired
      )
    }
  }, [])

  async function login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    })

    if (
      !response.token ||
      !response.refresh_token ||
      !response.user
    ) {
      throw new Error(
        'Invalid authentication response from server.'
      )
    }

    saveToken(response.token)
    saveRefreshToken(response.refresh_token)

    setUser(response.user)

    return response.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
