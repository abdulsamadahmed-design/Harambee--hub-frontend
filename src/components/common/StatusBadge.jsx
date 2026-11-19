function StatusBadge({ status = 'pending', className = '' }) {
  const normalizedStatus = String(status).toLowerCase()

  const statusClasses = {
    active: 'status-active',
    approved: 'status-approved',
    confirmed: 'status-approved',
    completed: 'status-approved',
    pending: 'status-pending',
    rejected: 'status-rejected',
    cancelled: 'status-rejected',
    failed: 'status-rejected',
    inactive: 'status-inactive',
  }

  const badgeClass = statusClasses[normalizedStatus] || 'status-default'

  return (
    <span className={`status-badge ${badgeClass} ${className}`}>
      {status}
    </span>
  )
}

export default StatusBadge