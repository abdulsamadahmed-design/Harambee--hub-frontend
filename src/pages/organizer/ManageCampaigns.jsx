
import { Link } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import CampaignCard from '../../components/campaigns/CampaignCard'
import Loader from '../../components/common/Loader'
import ErrorMessage from '../../components/common/ErrorMessage'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
 
function ManageCampaigns() {
  const { data, loading, error } = useFetch('/campaigns/')

  const campaigns = data?.items || []

  return (
    <div className="manage-campaigns">
      <div className="page-heading">
        <div>
          <h2>Manage Campaigns</h2>
          <p>View and keep track of your campaigns.</p>
        </div>

        <Link to="/organizer/campaigns/new">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {loading && <Loader />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && campaigns.length === 0 && (
        <EmptyState
          title="No campaigns yet"
          message="Create your first campaign to get started."
        />
      )}

      {!loading && !error && campaigns.length > 0 && (
        <>
          <p className="campaign-count">
            {data.total} campaign(s) found
          </p>

          <div className="campaign-list">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ManageCampaigns
