import DashboardLayout from '../../components/layout/DashboardLayout'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import StatusBadge from '../../components/common/StatusBadge'
import useFetch from '../../hooks/useFetch'
import formatDate from '../../utils/formatDate'

export default function ManageUsers() {
  const { data, loading, error, refetch } = useFetch('/admin/users')

  const users = data?.items || []

  return (
    <DashboardLayout
      role="organizer"
      title="Manage Users"
      activePath="/admin/users"
    >
      <div className="dashboard-content">
        <div className="dashboard-title">
          <h1>Manage Users</h1>
          <p>View registered organizers and contributors.</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {loading ? (
          <Loader text="Loading users..." />
        ) : (
          <>
            <p className="users-count">
              Total registered users: <strong>{data?.total ?? users.length}</strong>
            </p>

            {users.length === 0 ? (
              <div className="empty-state">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name || user.full_name || 'Name unavailable'}</td>
                        <td>{user.email}</td>
                        <td>
                          <StatusBadge status={user.role} />
                        </td>
                        <td>{formatDate(user.created_at) || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data?.pages > 1 && (
              <p className="pagination-info">
                Page {data.page} of {data.pages}
              </p>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
