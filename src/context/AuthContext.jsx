import { useEffect, useState } from 'react'
import { AuthContext } from './authContextValue'
import api, { getToken, saveToken, clearToken } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    const token = getToken()

    if (!token) return

    let cancelled = false

    api.get('/auth/me')
      .then((userData) => {
        if (!cancelled) {
          setUser(userData)
        }
      })
      .catch(() => {
        clearToken()

        if (!cancelled) {
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    })

    saveToken(response.token)
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