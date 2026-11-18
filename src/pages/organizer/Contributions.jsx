
import useFetch from '../../hooks/useFetch'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'

function Contributions() {
  const { data, loading, error } = useFetch('/pledges/')

  const contributions = data?.items || []

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

        {!loading && !error && contributions.length === 0 && (
          <EmptyState
            title="No contributions yet"
            message="Contributions will appear here when people support your campaigns."
          />
        )}

        {!loading && !error && contributions.length > 0 && (
          <>
            <p className="contribution-count">
              {data.total} contribution(s) found
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
                  </tr>
                </thead>

                <tbody>
                  {contributions.map((contribution) => (
                    <tr key={contribution.id}>
                      <td>
                        {contribution.user?.name ||
                          contribution.user?.email ||
                          'Anonymous'}
                      </td>

                      <td>
                        {contribution.campaign?.title || 'Campaign'}
                      </td>

                      <td>
                        {formatCurrency(contribution.amount)}
                      </td>

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
