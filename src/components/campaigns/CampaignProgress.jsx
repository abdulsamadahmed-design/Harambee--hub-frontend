import formatCurrency from "../../utils/formatCurrency";
import {
  getGoal,
  getRaised,
  daysLeft,
  getEndDate,
  progressPercent,
} from "./campaignHelpers";

// Shows raised / goal with a bar and a "days left" pill.
// size: "small" (used inside cards) or "large" (used on details page)
export default function CampaignProgress({ campaign, size = "small" }) {
  const goal = getGoal(campaign);
  const raised = getRaised(campaign);
  const percent = progressPercent(campaign);
  const remaining = daysLeft(getEndDate(campaign));

  const daysLabel =
    remaining == null
      ? "No deadline"
      : remaining > 0
      ? `${remaining} day${remaining === 1 ? "" : "s"} left`
      : "Ended";

  return (
    <div className={`m3-progress m3-progress-${size}`}>
      <div className="m3-progress-head">
        <span className="m3-progress-raised">{formatCurrency(raised)}</span>
        <span className="m3-progress-goal">of {formatCurrency(goal)}</span>
      </div>

      <div
        className="m3-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Campaign progress"
      >
        <div className="m3-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="m3-progress-foot">
        <span className="m3-progress-percent">{percent}% funded</span>
        <span
          className={
            "m3-progress-days" +
            (remaining != null && remaining <= 0 ? " m3-progress-days-ended" : "")
          }
        >
          {daysLabel}
        </span>
      </div>
    </div>
  );
}