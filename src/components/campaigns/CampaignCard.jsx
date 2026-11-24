import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import CampaignProgress from "./CampaignProgress";
import formatDate from "../../utils/formatDate";
import {
  getImageUrl,
  getStatus,
  getEndDate,
  getOrganizerName,
  getRaised,
} from "./campaignHelpers";

export default function CampaignCard({ campaign }) {
  const status = getStatus(campaign);
  const image = getImageUrl(campaign);
  const endDate = getEndDate(campaign);
  const formattedEndDate = endDate ? formatDate(endDate) : "";
  const raisedAmount = getRaised(campaign);

  return (
    <article className="m3-card">
      <Link to={`/campaigns/${campaign.id}`} className="m3-card-image-link">
        <div className="m3-card-image-wrap">
          {image ? (
            <img
              src={image}
              alt={campaign.title}
              className="m3-card-image"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/campaign-placeholder.svg";
              }}
            />
          ) : (
            <div className="m3-card-image-fallback" aria-hidden="true">
              {campaign.title?.charAt(0) ?? "?"}
            </div>
          )}
          <span className="m3-card-status">
            <StatusBadge status={status} />
          </span>
        </div>
      </Link>

      <div className="m3-card-body">
        <h3 className="m3-card-title">
          <Link to={`/campaigns/${campaign.id}`}>{campaign.title}</Link>
        </h3>

        <p className="m3-card-organizer">by {getOrganizerName(campaign)}</p>

        <p className="m3-card-description">
          {campaign.description?.length > 120
            ? `${campaign.description.slice(0, 120)}…`
            : campaign.description}
        </p>

        <CampaignProgress
          campaign={campaign}
          raisedAmount={raisedAmount}
          size="small"
        />

        {formattedEndDate && (
          <p className="m3-card-deadline">Ends {formattedEndDate}</p>
        )}

        <div className="m3-card-actions">
          <Link
            to={`/campaigns/${campaign.id}`}
            className="btn btn-primary btn-medium m3-card-cta"
          >
            View campaign
          </Link>
        </div>
      </div>
    </article>
  );
}
