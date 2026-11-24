import { useMemo, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import useFetch from "../../hooks/useFetch";
import CampaignList from "../../components/campaigns/CampaignList";
import {
  getCampaignsFromResponse,
  getPagination,
  getStatus,
  getGoal,
  getEndDate,
} from "../../components/campaigns/campaignHelpers";
import "./campaigns.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "ending", label: "Ending soon" },
  { value: "goal-high", label: "Goal: high to low" },
  { value: "goal-low", label: "Goal: low to high" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Campaigns() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch(
    `/campaigns/?page=${page}&per_page=10`
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const pagination = getPagination(data);
  const allCampaigns = useMemo(
    () => getCampaignsFromResponse(data),
    [data]
  );

  const visibleCampaigns = useMemo(() => {
    let list = [...allCampaigns];
    const term = search.trim().toLowerCase();

    if (term) {
      list = list.filter(
        (campaign) =>
          campaign.title?.toLowerCase().includes(term) ||
          campaign.description?.toLowerCase().includes(term)
      );
    }

    if (status !== "all") {
      list = list.filter((campaign) => getStatus(campaign) === status);
    }

    if (sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
      );
    } else if (sort === "ending") {
      list.sort((a, b) => {
        const ea = new Date(getEndDate(a) ?? 0).getTime() || Infinity;
        const eb = new Date(getEndDate(b) ?? 0).getTime() || Infinity;
        return ea - eb;
      });
    } else if (sort === "goal-high") {
      list.sort((a, b) => getGoal(b) - getGoal(a));
    } else if (sort === "goal-low") {
      list.sort((a, b) => getGoal(a) - getGoal(b));
    }

    return list;
  }, [allCampaigns, search, status, sort]);

  return (
    <>
      <Navbar />
      <div className="m3-page">
        <div className="container">
          <header className="m3-page-header">
            <h1 className="m3-page-title">Campaigns</h1>
            <p className="m3-page-subtitle">
              Discover causes and make a difference.
            </p>
          </header>

          <div className="m3-toolbar">
            <div className="form-group">
              <label htmlFor="m3-search">Search</label>
              <input
                id="m3-search"
                type="text"
                placeholder="Search by title or description"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="m3-status">Status</label>
              <select
                id="m3-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="m3-sort">Sort</label>
              <select
                id="m3-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!loading && !error && (
            <p className="m3-result-count">
              Showing {visibleCampaigns.length} campaign
              {visibleCampaigns.length === 1 ? "" : "s"} on this page (
              {pagination.total} total)
            </p>
          )}

          <CampaignList
            campaigns={visibleCampaigns}
            loading={loading}
            error={error}
            onRetry={refetch}
            emptyMessage={
              allCampaigns.length > 0
                ? "No campaigns match your filters on this page. Try adjusting them."
                : pagination.total > 0
                  ? "No campaigns on this page. Try another page."
                  : "No campaigns yet — check back soon."
            }
          />

          {!loading && !error && pagination.pages > 1 && (
            <nav className="m3-pagination" aria-label="Campaign pages">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                ← Previous
              </button>
              <span aria-live="polite">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= pagination.pages}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}