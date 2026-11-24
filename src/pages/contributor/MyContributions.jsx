import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PledgeTable from '../../components/pledges/PledgeTable'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import Button from '../../components/common/Button'
import api from '../../services/api'

export default function MyContributions() {
  const [pledges, setPledges] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPledges = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get(
        `/pledges/mine?page=${page}&per_page=10`
      )

      setPledges(response.items || response.pledges || [])
      setTotalPages(response.pages || 1)
    } catch (err) {
      setError(err.message || 'Could not load your contributions.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    Promise.resolve().then(fetchPledges)
  }, [fetchPledges])

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
          <>
            <PledgeTable pledges={pledges} />

            {totalPages > 1 && (
              <div className="pagination-controls">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  Previous
                </Button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
