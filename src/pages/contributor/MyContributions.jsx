import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PledgeTable from '../../components/pledges/PledgeTable'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import api from '../../services/api'

export default function MyContributions() {
  const [pledges, setPledges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPledges = useCallback(async () => {
    try {
      const response = await api.get('/pledges/mine')
      setError('')
      setPledges(response.items || response.pledges || [])
    } catch (err) {
      setError(err.message || 'Could not load your contributions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    api.get('/pledges/mine')
      .then((response) => {
        if (cancelled) return
        setPledges(response.items || response.pledges || [])
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Could not load your contributions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardLayout
      role="contributor"
      title="My Contributions"
      activePath="/contributor/contributions"
    >
      <div className="dashboard-content">
        <div className="dashboard-title">
          <h1>My Contributions</h1>
          <p>View your contribution history and current statuses.</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchPledges} />}

        {loading ? (
          <Loader text="Loading contributions..." />
        ) : (
          <PledgeTable pledges={pledges} />
        )}
      </div>
    </DashboardLayout>
  )
}
