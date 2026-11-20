import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'

export default function PledgeTable({
  pledges = [],
  loading = false,
  onConfirm,
  onDelete,
  busyId = null,
}) {
  if (loading) {
    return <p role="status">Loading contributions...</p>
  }

  if (!pledges.length) {
    return (
      <div className="empty-state">
        <p>No contributions found.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="pledge-table">
        <thead>
          <tr>
            <th>Contributor</th>
            <th>Amount</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            {(onConfirm || onDelete) && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {pledges.map((pledge) => {
            const contributorName =
              pledge.contributor?.name ||
              pledge.contributor_name ||
              pledge.user?.name ||
              pledge.user?.full_name ||
              'Name unavailable'

            const isBusy = busyId === pledge.id

            return (
              <tr key={pledge.id}>
                <td>{contributorName}</td>
                <td>{formatCurrency(pledge.amount)}</td>
                <td>{pledge.message || '—'}</td>
                <td>{formatDate(pledge.created_at) || '—'}</td>
                <td>
                  <StatusBadge status={pledge.status} />
                </td>

                {(onConfirm || onDelete) && (
                  <td>
                    <div className="table-actions">
                      {onConfirm && pledge.status === 'pending' && (
                        <Button
                          size="small"
                          onClick={() => onConfirm(pledge)}
                          disabled={isBusy}
                          loading={isBusy}
                        >
                          Confirm
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => onDelete(pledge)}
                          disabled={isBusy}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
