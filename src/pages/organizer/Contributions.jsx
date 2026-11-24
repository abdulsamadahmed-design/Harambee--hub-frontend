
import { useState } from 'react'
import useFetch from '../../hooks/useFetch'
import api from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'

function Contributions() {
  const {
    data,
    loading,
    error,
    refetch = () => {},
  } = useFetch('/pledges/')

  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const contributions = data?.items || []
  const hasPending = contributions.some(
    (contribution) => contribution.status === 'pending'
  )

  async function handleConfirm(contribution) {
    setBusyId(contribution.id)
    setActionError('')

    try {
      await api.post(`/pledges/${contribution.id}/confirm`)
      refetch()
    } catch (err) {
      setActionError(err.message || 'Failed to confirm pledge.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout
      role="organizer"
      title="Contributions"
      activePath="/organizer/contributions"
    >
      <div className="contributions-page">
        <div className="page-heading">
          <div>
            <h2>Campaign Contributions</h2>
            <p>View contributions made towards campaigns.</p>
          </div>
        </div>

        {loading && <Loader />}

        {error && <ErrorMessage message={error} />}

        {actionError && (
          <p role="alert" className="error-message">
            {actionError}
          </p>
        )}

        {!loading && !error && contributions.length === 0 && (
          <EmptyState
            title="No contributions yet"
            message="Contributions will appear here when people support your campaigns."
          />
        )}

        {!loading && !error && contributions.length > 0 && (
          <>
            <p className="contribution-count">
              {data?.total ?? contributions.length} contribution(s) found
            </p>

            <div className="contributions-table-wrapper">
              <table className="contributions-table">
                <thead>
                  <tr>
                    <th>Contributor</th>
                    <th>Campaign</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    {hasPending && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {contributions.map((contribution) => (
                    <tr key={contribution.id}>
                      <td>
                        {contribution.contributor?.name ||
                          contribution.user?.name ||
                          contribution.user?.email ||
                          'Anonymous'}
                      </td>

                      <td>
                        {contribution.campaign?.title || 'Campaign'}
                      </td>

                      <td>{formatCurrency(contribution.amount)}</td>

                      <td>
                        {formatDate(
                          contribution.created_at || contribution.date
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={contribution.status || 'pending'}
                        />
                      </td>

                      {hasPending && (
                        <td>
                          {contribution.status === 'pending' ? (
                            <Button
                              size="small"
                              onClick={() => handleConfirm(contribution)}
                              loading={busyId === contribution.id}
                              disabled={busyId !== null}
                            >
                              Confirm
                            </Button>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Contributions
