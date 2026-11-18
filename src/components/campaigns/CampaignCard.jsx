
import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'
import StatusBadge from '../common/StatusBadge'
import CampaignProgress from './CampaignProgress'

function CampaignCard({ campaign }) {
  const {
    title,
    description,
    goal_amount,
    current_amount = 0,
    status = 'active',
    end_date,
  } = campaign

  return (
    <div className="campaign-card">
      <div className="campaign-card-header">
        <h3>{title}</h3>
        <StatusBadge status={status} />
      </div>

      <p className="campaign-card-description">
        {description}
      </p>

      <div className="campaign-card-details">
        <p>
          <strong>Goal:</strong> {formatCurrency(goal_amount)}
        </p>

        <p>
          <strong>Raised:</strong> {formatCurrency(current_amount)}
        </p>

        {end_date && (
          <p>
            <strong>Ends:</strong> {formatDate(end_date)}
          </p>
        )}
      </div>

      <CampaignProgress
        raised={current_amount}
        goal={goal_amount}
      />
    </div>
  )
}

export default CampaignCard
