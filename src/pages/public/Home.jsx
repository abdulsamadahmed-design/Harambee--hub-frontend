import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import useFetch from "../../hooks/useFetch";
import CampaignList from "../../components/campaigns/CampaignList";
import {
  getCampaignsFromResponse,
  getStatus,
} from "../../components/campaigns/campaignHelpers";
import "./campaigns.css";

const focusAreas = [
  {
    icon: "🎓",
    title: "Education",
    description: "Help create opportunities for learners and students.",
  },
  {
    icon: "🏥",
    title: "Health & wellbeing",
    description: "Support initiatives that make healthier communities.",
  },
  {
    icon: "🌱",
    title: "Community projects",
    description: "Bring people together to improve their communities.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover a cause",
    description: "Explore campaigns and find projects that matter to you.",
  },
  {
    number: "02",
    title: "Get involved",
    description:
      "Choose how you would like to contribute and support a campaign.",
  },
  {
    number: "03",
    title: "Make an impact",
    description:
      "Be part of a community working together towards meaningful goals.",
  },
];

export default function Home() {
  const { data, loading, error, refetch } = useFetch("/campaigns/");

  const allCampaigns = getCampaignsFromResponse(data);
  const featured = allCampaigns
    .filter((campaign) => getStatus(campaign) === "active")
    .slice(0, 3);

  return (
    <>
      <Navbar />

      <main className="hh-home">
        <section className="hh-hero">
          <div className="container hh-hero-grid">
            <div className="hh-hero-content">
              <span className="hh-eyebrow">
                <span className="hh-dot" />
                TOGETHER WE CAN DO MORE
              </span>

              <h1>
                Big change starts
                <br />
                with <span>coming together.</span>
              </h1>

              <p>
                Harambee Hub connects communities with causes that matter.
                Discover campaigns, support meaningful projects and make a
                difference together.
              </p>

              <div className="hh-hero-actions">
                <Link to="/campaigns" className="btn btn-primary btn-large">
                  Explore campaigns <span aria-hidden="true">→</span>
                </Link>
                <Link to="/register" className="btn btn-secondary btn-large">
                  Join our community
                </Link>
              </div>

              <div className="hh-trust-line">
                <span>✓ Community driven</span>
                <span>✓ Purposeful giving</span>
                <span>✓ Collective impact</span>
              </div>
            </div>

            <div
              className="hh-hero-visual"
              aria-label="Many hands, one community"
            >
              <div className="hh-visual-circle hh-circle-one" />
              <div className="hh-visual-circle hh-circle-two" />

              <div className="hh-visual-card">
                <span className="hh-card-label">THE POWER OF HARAMBEE</span>
                <div className="hh-community-icon" aria-hidden="true">
                  🤝
                </div>
                <h2>Many hands.</h2>
                <h2 className="hh-green-heading">One community.</h2>
                <p>
                  When people unite around a shared purpose, meaningful things
                  become possible.
                </p>
                <div className="hh-card-bottom">
                  <span>DISCOVER</span>
                  <span>CONTRIBUTE</span>
                  <span>GROW</span>
                </div>
              </div>

              <div className="hh-floating-note">
                <span aria-hidden="true">💚</span>
                <div>
                  <strong>Stronger together</strong>
                  <small>Every contribution matters</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hh-intro container">
          <div className="hh-section-heading">
            <span className="hh-eyebrow">ABOUT HARAMBEE HUB</span>
            <h2>
              A platform built around
              <span> the power of community.</span>
            </h2>
            <p>
              Harambee means pulling together. We bring that spirit into one
              platform where organizers and contributors can connect around
              meaningful causes.
            </p>
          </div>
        </section>

        <section className="hh-focus">
          <div className="container">
            <div className="hh-section-top">
              <div>
                <span className="hh-eyebrow">FIND YOUR PURPOSE</span>
                <h2>Support what matters.</h2>
                <p>
                  Discover different ways to get involved in your community.
                </p>
              </div>
              <Link to="/campaigns" className="hh-text-link">
                View campaigns <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="hh-focus-grid">
              {focusAreas.map((area) => (
                <article className="hh-focus-card" key={area.title}>
                  <div className="hh-focus-icon" aria-hidden="true">
                    {area.icon}
                  </div>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                  <Link to="/campaigns">
                    Explore causes <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hh-featured">
          <div className="container">
            <div className="hh-section-top">
              <div>
                <span className="hh-eyebrow">MAKE A DIFFERENCE</span>
                <h2>Featured campaigns</h2>
                <p>Find a community project that matters to you.</p>
              </div>
              <Link to="/campaigns" className="hh-text-link">
                View all campaigns <span aria-hidden="true">→</span>
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

        <section className="hh-how container">
          <div className="hh-section-heading">
            <span className="hh-eyebrow">HOW IT WORKS</span>
            <h2>Three steps. One shared purpose.</h2>
            <p>Getting involved in something meaningful should be simple.</p>
          </div>
          <div className="hh-steps-grid">
            {steps.map((step) => (
              <article className="hh-step" key={step.number}>
                <span className="hh-step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hh-roles">
          <div className="container hh-roles-grid">
            <div>
              <span className="hh-eyebrow">FOR ORGANIZERS</span>
              <h2>Have an idea worth bringing to life?</h2>
              <p>
                Create a campaign, share your vision and invite your community
                to support it.
              </p>
              <Link to="/register" className="btn btn-secondary">
                Get started <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div>
              <span className="hh-eyebrow">FOR CONTRIBUTORS</span>
              <h2>Ready to be part of something bigger?</h2>
              <p>
                Discover causes, connect with organizers and support projects
                that inspire you.
              </p>
              <Link to="/campaigns" className="btn btn-primary">
                Explore campaigns <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="hh-final-cta container">
          <h2>Let&apos;s make a difference, together.</h2>
          <p>Your community. Your contribution. Our collective future.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Join Harambee Hub <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <footer className="hh-footer">
        <div className="container hh-footer-content">
          <div>
            <Link to="/" className="hh-footer-brand">
              Harambee Hub
            </Link>
            <p>Coming together to make meaningful change.</p>
          </div>
          <nav className="hh-footer-links" aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/campaigns">Campaigns</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        </div>
        <div className="container hh-copyright">
          © {new Date().getFullYear()} Harambee Hub. All rights reserved.
        </div>
      </footer>
    </>
  );
}
