import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import api from '../../services/api'
import formatCurrency from '../../utils/formatCurrency'

export default function ContributorDashboard() {
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

  const totalPledged = pledges.reduce(
    (total, pledge) => total + Number(pledge.amount || 0),
    0,
  )

  const totalConfirmed = pledges
    .filter((pledge) => pledge.status === 'confirmed')
    .reduce((total, pledge) => total + Number(pledge.amount || 0), 0)

  return (
    <DashboardLayout
      role="contributor"
      title="My Dashboard"
      activePath="/contributor"
    >
      <div className="dashboard-content">
        <div className="dashboard-title">
          <h1>My Dashboard</h1>
          <p>Track your contributions and their progress.</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchPledges} />}

        {loading ? (
          <Loader text="Loading your dashboard..." />
        ) : (
          <>
            <div className="stats-grid">
              <StatCard title="Total Contributions" value={pledges.length} />
              <StatCard title="Total Pledged" value={formatCurrency(totalPledged)} />
              <StatCard title="Confirmed Amount" value={formatCurrency(totalConfirmed)} />
              <StatCard
                title="Pending Contributions"
                value={pledges.filter((pledge) => pledge.status === 'pending').length}
              />
            </div>

            <ActivityFeed
              title="My Recent Contributions"
              activities={pledges.slice(0, 5)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
