
import formatDate from '../../utils/formatDate'

function ActivityFeed({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <h2 className="activity-feed-title">Recent Activity</h2>
        <p className="activity-feed-empty">
          No recent activity to display.
        </p>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <h2 className="activity-feed-title">Recent Activity</h2>

      <div className="activity-feed-list">
        {activities.map((activity, index) => (
          <div
            className="activity-feed-item"
            key={activity.id ?? index}
          >
            <div className="activity-feed-indicator" />

            <div className="activity-feed-content">
              <p className="activity-feed-message">
                {activity.message}
              </p>

              {activity.date && (
                <span className="activity-feed-date">
                  {formatDate(activity.date)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeed
