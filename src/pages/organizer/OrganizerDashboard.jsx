import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import useFetch from '../../hooks/useFetch'

function formatKES(amount) {
  const value = Number(amount ?? 0)

  return `KSh ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function OrganizerDashboard() {
  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch('/organizer/dashboard')

  const activities = []

  return (
    <DashboardLayout
      role="organizer"
      title="Organizer Dashboard"
      activePath="/organizer"
    >
      <div className="organizer-dashboard">
        <div className="dashboard-welcome">
          <h2>Welcome back!</h2>
          <p>
            Here's an overview of your campaigns and contributions.
          </p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={refetch}
          />
        )}

        {loading ? (
          <Loader text="Loading dashboard statistics..." />
        ) : !error ? (
          <section className="dashboard-stats">
            <StatCard
              title="Total Campaigns"
              value={data?.total_campaigns ?? 0}
              icon="📢"
              description="Campaigns created"
            />

            <StatCard
              title="Active Campaigns"
              value={data?.active_campaigns ?? 0}
              icon="🚀"
              description="Currently running"
            />

            <StatCard
              title="Total Contributions"
              value={data?.total_contributions ?? 0}
              icon="🤝"
              description="Confirmed contributions"
            />

            <StatCard
              title="Total Amount Raised"
              value={formatKES(data?.total_amount_raised)}
              icon="💰"
              description="From confirmed contributions"
            />
          </section>
        ) : null}

        <section className="dashboard-activity">
          <ActivityFeed activities={activities} />
        </section>
      </div>
    </DashboardLayout>
  )
}

export default OrganizerDashboard
