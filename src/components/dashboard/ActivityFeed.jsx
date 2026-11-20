import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'

export default function ActivityFeed({
  activities = [],
  title = 'Recent Activity',
}) {
  return (
    <section className="activity-feed">
      <h2>{title}</h2>

      {!activities.length ? (
        <p className="empty-state">No recent activity.</p>
      ) : (
        <ul className="activity-list">
          {activities.map((activity, index) => (
            <li
              className="activity-item"
              key={activity.id || `${activity.created_at}-${index}`}
            >
              <div>
                <strong>
                  {activity.contributor?.name ||
                    activity.contributor_name ||
                    activity.user?.name ||
                    activity.title ||
                    'Activity'}
                </strong>

                <p>{activity.message || activity.description || 'Contribution activity'}</p>
              </div>

              <div className="activity-meta">
                {activity.amount != null && (
                  <strong>{formatCurrency(activity.amount)}</strong>
                )}
                <small>{formatDate(activity.created_at)}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
