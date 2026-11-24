import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import useFetch from '../../hooks/useFetch'
import api from '../../services/api'

export default function ManageUsers() {
  const [page, setPage] = useState(1)
  const [recoveryStatus, setRecoveryStatus] = useState({})

  const { data, loading, error, refetch } = useFetch(
    `/admin/users?page=${page}&per_page=10`
  )

  const users = data?.items || []
  const totalPages = data?.pages || 1

  async function handleGenerateRecoveryCode(userId) {
    setRecoveryStatus((previous) => ({
      ...previous,
      [userId]: {
        loading: true,
        message: '',
        error: '',
      },
    }))

    try {
      const response = await api.post(
        `/admin/users/${userId}/recovery-code`
      )

      setRecoveryStatus((previous) => ({
        ...previous,
        [userId]: {
          loading: false,
          message:
            response?.message || 'Recovery email sent successfully.',
          error: '',
        },
      }))
    } catch (err) {
      setRecoveryStatus((previous) => ({
        ...previous,
        [userId]: {
          loading: false,
          message: '',
          error: err.message || 'Unable to send recovery email.',
        },
      }))
    }
  }

  return (
    <DashboardLayout
      role="admin"
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
              Total registered users:{' '}
              <strong>{data?.total ?? users.length}</strong>
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
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Email Verification</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name || 'Name unavailable'}</td>

                        <td>{user.email}</td>

                        <td>{user.phone || '—'}</td>

                        <td>
                          <StatusBadge status={user.role} />
                        </td>

                        <td>
                          {user.email_verified
                            ? 'Verified'
                            : 'Not verified'}
                        </td>

                        <td>
                          <Button
                            size="small"
                            variant="secondary"
                            loading={recoveryStatus[user.id]?.loading}
                            onClick={() =>
                              handleGenerateRecoveryCode(user.id)
                            }
                          >
                            Generate Recovery Code
                          </Button>

                          {recoveryStatus[user.id]?.message && (
                            <p role="status">
                              {recoveryStatus[user.id].message}
                            </p>
                          )}

                          {recoveryStatus[user.id]?.error && (
                            <p role="alert">
                              {recoveryStatus[user.id].error}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination-controls">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((currentPage) => currentPage - 1)
                  }
                >
                  Previous
                </Button>

                <span>
                  Page {data?.page || page} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((currentPage) => currentPage + 1)
                  }
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