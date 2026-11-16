
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function DashboardLayout({
  children,
  role = 'contributor',
  title = 'Dashboard',
  activePath = '',
}) {
  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-body">
        <Sidebar role={role} activePath={activePath} />

        <main className="dashboard-main">
          <div className="dashboard-content">
            <h1 className="dashboard-title">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
