import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import CampaignList from "../../components/campaigns/CampaignList";
import {
  getCampaignsFromResponse,
  getStatus,
} from "../../components/campaigns/campaignHelpers";
import "./campaigns.css";

export default function Home() {
  const { data, loading, error, refetch } = useFetch("/campaigns");

  const allCampaigns = getCampaignsFromResponse(data);
  const featured = allCampaigns
    .filter((campaign) => getStatus(campaign) === "active")
    .slice(0, 3);

  return (
    <div>
      <section className="m3-hero">
        <div className="container m3-hero-inner">
          <h1 className="m3-hero-title">Fund ideas that change communities.</h1>
          <p className="m3-hero-text">
            Discover campaigns, back a cause you care about, and follow the
            impact you help create.
          </p>
          <div className="m3-hero-actions">
            <Link to="/campaigns" className="btn btn-primary btn-large">
              Browse campaigns
            </Link>
            <Link to="/register" className="btn btn-secondary btn-large">
              Start a campaign
            </Link>
          </div>
        </div>
      </section>

      <section className="m3-section">
        <div className="container">
          <div className="m3-section-header">
            <h2 className="m3-section-title">Featured campaigns</h2>
            <Link to="/campaigns" className="m3-section-link">
              View all →
            </Link>
          </div>

          <CampaignList
            campaigns={featured}
            loading={loading}
            error={error}
            onRetry={refetch}
            emptyMessage="No active campaigns right now. Check back soon."
          />
        </div>
      </section>

      <section className="m3-section m3-section-alt">
        <div className="container">
          <div className="m3-section-header">
            <h2 className="m3-section-title">How it works</h2>
          </div>

          <div className="m3-steps">
            <div className="m3-step">
              <span className="m3-step-number">1</span>
              <h3>Discover</h3>
              <p>Browse campaigns by cause and find one that speaks to you.</p>
            </div>
            <div className="m3-step">
              <span className="m3-step-number">2</span>
              <h3>Pledge</h3>
              <p>Make a pledge to the campaign. Every contribution counts.</p>
            </div>
            <div className="m3-step">
              <span className="m3-step-number">3</span>
              <h3>Follow the impact</h3>
              <p>Track progress and see how your support makes a difference.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="m3-cta">
        <div className="container">
          <h2>Have a cause worth funding?</h2>
          <p>Create a campaign and start rallying support today.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}