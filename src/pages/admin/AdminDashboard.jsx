import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import useFetch from '../../hooks/useFetch'
import formatCurrency from '../../utils/formatCurrency'

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useFetch('/admin/dashboard')

  const totalUsers = Object.values(data?.users_by_role || {}).reduce(
    (total, count) => total + Number(count || 0),
    0,
  )

  const totalCampaigns = Object.values(data?.campaigns_by_status || {}).reduce(
    (total, count) => total + Number(count || 0),
    0,
  )

  return (
    <DashboardLayout
      role="admin"
      title="Platform Dashboard"
      activePath="/admin"
    >
      <div className="dashboard-content">
        <div className="dashboard-title">
          <h1>Platform Dashboard</h1>
          <p>Overview of users, campaigns, and contributions.</p>
        </div>

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {loading ? (
          <Loader text="Loading platform statistics..." />
        ) : data ? (
          <>
            <div className="stats-grid">
              <StatCard title="Total Users" value={totalUsers} />
              <StatCard title="Total Campaigns" value={totalCampaigns} />
              <StatCard
                title="Total Pledged"
                value={formatCurrency(data.total_pledged)}
              />
              <StatCard
                title="Total Confirmed"
                value={formatCurrency(data.total_confirmed)}
              />
            </div>

            <div className="dashboard-sections">
              <section className="dashboard-panel">
                <h2>Users by Role</h2>
                {Object.entries(data.users_by_role || {}).map(([role, count]) => (
                  <p key={role}>
                    <strong>{role}:</strong> {count}
                  </p>
                ))}
              </section>

              <section className="dashboard-panel">
                <h2>Campaigns by Status</h2>
                {Object.entries(data.campaigns_by_status || {}).map(([status, count]) => (
                  <p key={status}>
                    <strong>{status}:</strong> {count}
                  </p>
                ))}
              </section>

              <section className="dashboard-panel">
                <h2>Contributions by Status</h2>
                {Object.entries(data.pledges_by_status || {}).map(([status, count]) => (
                  <p key={status}>
                    <strong>{status}:</strong> {count}
                  </p>
                ))}
              </section>
            </div>
          </>
        ) : (
          <p>No dashboard statistics available.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
