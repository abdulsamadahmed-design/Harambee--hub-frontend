// Address of our Flask backend (set VITE_API_URL in .env when it is deployed)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// The login token is kept in the browser's storage after the user logs in
export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

// One function that sends every request to the backend
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json" };

  // If the user is logged in, send the token so the backend knows who they are
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  // The backend sends errors as { "error": "message" }
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

// Short helpers, for example: api.get("/campaigns") or api.post("/auth/login", { email, password })
const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;
