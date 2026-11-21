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
    setLoading(true)
    setError('')

    try {
      const firstPage = await api.get('/pledges/mine?page=1&per_page=100')
      const allPledges = firstPage.items || []
      const totalPages = firstPage.pages || 1

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await api.get(
          `/pledges/mine?page=${page}&per_page=100`
        )
        allPledges.push(...(response.items || []))
      }

      setPledges(allPledges)
    } catch (err) {
      setError(err.message || 'Could not load your contributions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(fetchPledges)
  }, [fetchPledges])

  const totalPledged = pledges.reduce(
    (total, pledge) => total + Number(pledge.amount || 0),
    0
  )

  const totalConfirmed = pledges
    .filter((pledge) => pledge.status === 'confirmed')
    .reduce((total, pledge) => total + Number(pledge.amount || 0), 0)

  const pendingCount = pledges.filter(
    (pledge) => pledge.status === 'pending'
  ).length

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
              <StatCard
                title="Total Contributions"
                value={pledges.length}
              />
              <StatCard
                title="Total Pledged"
                value={formatCurrency(totalPledged)}
              />
              <StatCard
                title="Confirmed Amount"
                value={formatCurrency(totalConfirmed)}
              />
              <StatCard
                title="Pending Contributions"
                value={pendingCount}
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
