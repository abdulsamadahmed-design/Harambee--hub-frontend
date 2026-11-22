import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import StatusBadge from "../../components/common/StatusBadge";
import CampaignProgress from "../../components/campaigns/CampaignProgress";
import PledgeForm from "../../components/pledges/PledgeForm";
import formatDate from "../../utils/formatDate";
import {
  getImageUrl,
  getStatus,
  getEndDate,
  getOrganizerName,
  getRaised,
} from "../../components/campaigns/campaignHelpers";
import "./campaigns.css";

export default function CampaignDetails() {
  const { id } = useParams();
  const {
    data: campaign,
    loading,
    error,
    refetch,
  } = useFetch(id ? `/campaigns/${id}/` : "");
  const {
    data: pledgeData,
    error: pledgeError,
    refetch: refetchPledges,
  } = useFetch(id ? `/pledges/campaign/${id}/` : "");

  const handlePledgeSuccess = () => {
    refetch();
    refetchPledges();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader text="Loading campaign..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="m3-detail">
          <div className="container">
            <Link to="/campaigns" className="m3-detail-back">
              ← Back to campaigns
            </Link>
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        </div>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        <Navbar />
        <div className="m3-detail">
          <div className="container">
            <Link to="/campaigns" className="m3-detail-back">
              ← Back to campaigns
            </Link>
            <p>Campaign not found.</p>
          </div>
        </div>
      </>
    );
  }

  const image = getImageUrl(campaign);
  const status = getStatus(campaign);
  const endDate = getEndDate(campaign);
  const formattedEndDate = endDate ? formatDate(endDate) : "";
  const pledgeRaisedAmount = Number(pledgeData?.raised_amount);
  const raisedAmount =
    pledgeData?.raised_amount != null && Number.isFinite(pledgeRaisedAmount)
      ? pledgeRaisedAmount
      : getRaised(campaign);

  return (
    <>
      <Navbar />
      <div className="m3-detail">
        <div className="container">
          <Link to="/campaigns" className="m3-detail-back">
            ← Back to campaigns
          </Link>

          <div className="m3-detail-grid">
            <div>
            <div className="m3-detail-image-wrap">
              {image ? (
                <img
                  src={image}
                  alt={campaign.title}
                  className="m3-detail-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "/images/campaign-placeholder.svg";
                  }}
                />
              ) : (
                <div className="m3-detail-image-fallback" aria-hidden="true">
                  {campaign.title?.charAt(0) ?? "?"}
                </div>
              )}
            </div>

            <h1 className="m3-detail-title">{campaign.title}</h1>

              <div className="m3-detail-meta">
                <StatusBadge status={status} />
                <span>by {getOrganizerName(campaign)}</span>
                {formattedEndDate && <span>Ends {formattedEndDate}</span>}
              </div>

            <div className="m3-detail-description">{campaign.description}</div>
          </div>

          <aside className="m3-detail-side">
            <h3>Campaign progress</h3>
            <CampaignProgress
              campaign={campaign}
              raisedAmount={raisedAmount}
              size="large"
            />

            {pledgeError && (
              <ErrorMessage
                message={pledgeError}
                onRetry={refetchPledges}
              />
            )}

            <div
              id="pledge-slot"
              data-campaign-id={campaign.id}
              style={{ marginTop: "24px" }}
            >
              <PledgeForm
                campaignId={campaign.id}
                onSuccess={handlePledgeSuccess}
              />
            </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
