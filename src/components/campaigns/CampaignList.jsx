import CampaignCard from "./CampaignCard";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";

// Handles the four rendering states: loading, error, empty, list.
export default function CampaignList({
  campaigns,
  loading,
  error,
  onRetry,
  emptyMessage,
}) {
  if (loading) return <Loader text="Loading campaigns..." />;

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns yet"
        message={emptyMessage ?? "Check back soon — new campaigns appear here."}
      />
    );
  }

  return (
    <div className="m3-grid">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}