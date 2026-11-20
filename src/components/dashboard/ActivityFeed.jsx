
import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'

function ActivityFeed({
  activities = [],
  title = 'Recent Activity',
}) {
  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <h2 className="activity-feed-title">{title}</h2>
        <p className="activity-feed-empty">
          No recent activity to display.
        </p>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <h2 className="activity-feed-title">{title}</h2>

      <div className="activity-feed-list">
        {activities.map((activity, index) => (
          <div
            className="activity-feed-item"
            key={activity.id ?? index}
          >
            <div className="activity-feed-indicator" />

            <div className="activity-feed-content">
              <strong>
                {activity.contributor?.name ||
                  activity.contributor_name ||
                  activity.user?.name ||
                  activity.title ||
                  'Activity'}
              </strong>

              <p className="activity-feed-message">
                {activity.message ||
                  activity.description ||
                  'Contribution activity'}
              </p>

              <div className="activity-meta">
                {activity.amount != null && (
                  <strong>
                    {formatCurrency(activity.amount)}
                  </strong>
                )}

                {(activity.created_at || activity.date) && (
                  <span className="activity-feed-date">
                    {formatDate(activity.created_at || activity.date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeed
