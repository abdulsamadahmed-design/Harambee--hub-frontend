
function StatCard({ title, value, icon, description, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>

        {icon && (
          <div className="stat-card-icon">
            {icon}
          </div>
        )}
      </div>

      <div className="stat-card-value">
        {value ?? 0}
      </div>

      {(description || trend) && (
        <div className="stat-card-footer">
          {description && (
            <span className="stat-card-description">
              {description}
            </span>
          )}

          {trend && (
            <span className="stat-card-trend">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default StatCard
