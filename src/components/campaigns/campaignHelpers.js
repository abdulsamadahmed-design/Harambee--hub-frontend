// Tolerance helpers so M3 keeps working even if backend fields change.
// Backend currently returns: id, title, description, goal_amount (string),
// image_url, status, end_date, created_at, organizer_id.
// These helpers also pick up optional fields when the backend adds them later
// (raised_amount / total_pledged / category / organizer.name) — no M3 edit needed.

export function getCampaignsFromResponse(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.items ?? data.campaigns ?? data.data ?? []
}

export function getPagination(data) {
  if (!data || Array.isArray(data)) {
    return {
      page: 1,
      per_page: 10,
      total: Array.isArray(data) ? data.length : 0,
      pages: 1,
    }
  }
  return {
    page: data.page ?? 1,
    per_page: data.per_page ?? 10,
    total: data.total ?? 0,
    pages: data.pages ?? 1,
  }
}

export function getGoal(campaign) {
  return Number(campaign?.goal_amount ?? campaign?.goalAmount ?? 0)
}

export function getRaised(campaign) {
  // Backend may expose this later as raised_amount / total_pledged / pledged_amount.
  return Number(
    campaign?.raised_amount ??
      campaign?.total_pledged ??
      campaign?.pledged_amount ??
      0
  )
}

export function getEndDate(campaign) {
  return campaign?.end_date ?? campaign?.deadline ?? null
}

export function getImageUrl(campaign) {
  return campaign?.image_url ?? campaign?.image ?? null
}

export function getOrganizerName(campaign) {
  if (campaign?.organizer?.name) return campaign.organizer.name
  if (campaign?.organizer_name) return campaign.organizer_name
  if (campaign?.organizer_id != null) return `Organizer #${campaign.organizer_id}`
  return "Organizer"
}

export function getStatus(campaign) {
  return String(campaign?.status ?? "active").toLowerCase()
}

export function daysLeft(endDate) {
  if (!endDate) return null
  const end = new Date(endDate).getTime()
  if (Number.isNaN(end)) return null
  const diff = end - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function progressPercent(campaign) {
  const goal = getGoal(campaign)
  if (goal <= 0) return 0
  const raised = getRaised(campaign)
  return Math.min(100, Math.max(0, Math.round((raised / goal) * 100)))
}
