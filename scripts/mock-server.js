import http from "http";
import { readFileSync } from "fs";

// A tiny fake backend that serves db.json in the same format as the Flask API
const db = JSON.parse(readFileSync(new URL("../db.json", import.meta.url)));
const PORT = 3001;

// Lists come back in the same paginated shape as the real backend
function paginate(list, query) {
  const rawPage = query.get("page");
  const rawPerPage = query.get("per_page");

  const page = rawPage === null ? 1 : Number(rawPage);
  const requestedPerPage = rawPerPage === null ? 10 : Number(rawPerPage);

  if (!Number.isInteger(page) || page < 1) {
    return { error: "page must be a valid integer and at least 1" };
  }

  if (!Number.isInteger(requestedPerPage) || requestedPerPage < 1) {
    return { error: "per_page must be a valid integer and at least 1" };
  }

  const perPage = Math.min(requestedPerPage, 100);
  const start = (page - 1) * perPage;

  return {
    items: list.slice(start, start + perPage),
    page,
    per_page: perPage,
    total: list.length,
    pages: Math.ceil(list.length / perPage),
  };
}


function sendPaginated(res, list, query) {
  const result = paginate(list, query);
  if (result.error) return send(res, 400, result);
  return send(res, 200, result);
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const query = url.searchParams;

  if (req.method === "OPTIONS") return send(res, 204, {});
  if (url.pathname === "/api/health") return send(res, 200, { status: "ok" });

  // Any password works; the token is "mock-token-" plus the user id
  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    const { email } = await readBody(req);
    const user = db.users.find((u) => u.email === email);
    if (!user) return send(res, 401, { error: "Invalid email or password" });
    return send(res, 200, { token: `mock-token-${user.id}`, user });
  }

  if (url.pathname === "/api/auth/me") {
    const id = Number((req.headers.authorization || "").replace("Bearer mock-token-", ""));
    const user = db.users.find((u) => u.id === id);
    return user ? send(res, 200, user) : send(res, 401, { error: "Please log in first" });
  }

  if (url.pathname === "/api/campaigns") {
    let list = db.campaigns;
    if (query.get("category")) list = list.filter((c) => c.category === query.get("category"));
    if (query.get("status")) list = list.filter((c) => c.status === query.get("status"));
    return sendPaginated(res, list, query);
  }

  // /api/campaigns/1 and /api/campaigns/1/pledges
  const match = url.pathname.match(/^\/api\/campaigns\/(\d+)(\/pledges)?$/);
  if (match) {
    const id = Number(match[1]);
    const campaign = db.campaigns.find((c) => c.id === id);
    if (!campaign) return send(res, 404, { error: "Not found" });
    if (match[2]) return sendPaginated(res, db.pledges.filter((p) => p.campaign_id === id), query);
    return send(res, 200, campaign);
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}/api`));