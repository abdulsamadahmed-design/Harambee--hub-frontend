
import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

// Loads data from the backend.
export default function useFetch(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!path) return

    setLoading(true)
    setError(null)

    try {
      const result = await api.get(path)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [path])

  // Schedule the initial fetch asynchronously.
  useEffect(() => {
    if (path) {
      Promise.resolve().then(fetchData)
    }
  }, [path, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
