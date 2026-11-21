import http from "http";
import { readFileSync } from "fs";

// A tiny fake backend that serves db.json in the same format as the Flask API
const db = JSON.parse(readFileSync(new URL("../db.json", import.meta.url)));
const PORT = 3001;

// Lists come back in the same paginated shape as the real backend
function paginate(list, query) {
  const page = Number(query.get("page")) || 1;
  const perPage = Number(query.get("per_page")) || 10;
  const start = (page - 1) * perPage;
  return {
    items: list.slice(start, start + perPage),
    page,
    per_page: perPage,
    total: list.length,
    pages: Math.max(1, Math.ceil(list.length / perPage)),
  };
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
    return send(res, 200, paginate(list, query));
  }

  // /api/campaigns/1 and /api/campaigns/1/pledges
  const match = url.pathname.match(/^\/api\/campaigns\/(\d+)(\/pledges)?$/);
  if (match) {
    const id = Number(match[1]);
    const campaign = db.campaigns.find((c) => c.id === id);
    if (!campaign) return send(res, 404, { error: "Not found" });
    if (match[2]) return send(res, 200, paginate(db.pledges.filter((p) => p.campaign_id === id), query));
    return send(res, 200, campaign);
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}/api`));