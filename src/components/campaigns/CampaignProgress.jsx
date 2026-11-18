
function CampaignProgress({ raised = 0, goal = 0 }) {
  const percentage =
    Number(goal) > 0
      ? Math.min((Number(raised) / Number(goal)) * 100, 100)
      : 0

  return (
    <div className="campaign-progress">
      <div className="campaign-progress-info">
        <span>Fundraising Progress</span>
        <strong>{percentage.toFixed(1)}%</strong>
      </div>

      <div
        className="campaign-progress-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="campaign-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default CampaignProgress
