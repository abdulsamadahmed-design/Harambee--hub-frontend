const API_URL = import.meta.env.VITE_API_URL;

async function request(path) {
  let url;

  if (API_URL) {
    const base = API_URL.replace(/\/$/, "");
    const endpoint = path.startsWith("/") ? path : `/${path}`;
    url = `${base}${endpoint}`;
  } else {
    url = `/data${path}.json`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getCampaigns() {
  return request("/campaigns");
}

export async function getCampaignById(id) {
  const campaigns = await getCampaigns();
  const items = Array.isArray(campaigns)
    ? campaigns
    : campaigns.items ?? campaigns.campaigns ?? campaigns.data ?? [];

  return items.find((campaign) => String(campaign.id) === String(id)) ?? null;
}

async function get(path) {
  if (path === "/campaigns") {
    return getCampaigns();
  }

  if (path.startsWith("/campaigns/")) {
    const id = path.split("/").filter(Boolean).at(-1);
    return getCampaignById(id);
  }

  throw new Error(`Unknown API path: ${path}`);
}

export default { get };