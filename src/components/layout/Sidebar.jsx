
import { Link } from 'react-router-dom'

const sidebarMenus = {
  admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Manage Users', href: '/admin/users' },
    { label: 'Campaigns', href: '/campaigns' },
  ],
  organizer: [
    { label: 'Dashboard', href: '/organizer' },
    { label: 'Create Campaign', href: '/organizer/campaigns/new' },
    { label: 'Manage Campaigns', href: '/organizer/campaigns' },
    { label: 'Contributions', href: '/organizer/contributions' },
  ],
  contributor: [
    { label: 'Dashboard', href: '/contributor' },
    { label: 'My Contributions', href: '/contributor/contributions' },
    { label: 'Browse Campaigns', href: '/campaigns' },
  ],
}

function Sidebar({ role = 'contributor', activePath = '' }) {
  const menuItems = sidebarMenus[role] || sidebarMenus.contributor

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">
        {role.charAt(0).toUpperCase() + role.slice(1)} Menu
      </h2>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={
              activePath === item.href
                ? 'sidebar-link sidebar-link-active'
                : 'sidebar-link'
            }
            aria-current={activePath === item.href ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

