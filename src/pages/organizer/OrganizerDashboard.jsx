
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

function OrganizerDashboard() {
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

        <section className="dashboard-stats">
          <StatCard
            title="Total Campaigns"
            value="—"
            icon="📢"
            description="Campaigns created"
          />

          <StatCard
            title="Active Campaigns"
            value="—"
            icon="🚀"
            description="Currently running"
          />

          <StatCard
            title="Total Contributions"
            value="—"
            icon="🤝"
            description="Contributions received"
          />

          <StatCard
            title="Total Amount Raised"
            value="—"
            icon="💰"
            description="Across your campaigns"
          />
        </section>

        <section className="dashboard-activity">
          <ActivityFeed activities={activities} />
        </section>
      </div>
    </DashboardLayout>
  )
}

export default OrganizerDashboard
