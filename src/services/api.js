
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get the saved login token
export function getToken() {
  return localStorage.getItem("token");
}

// Save the login token
export function saveToken(token) {
  localStorage.setItem("token", token);
}

// Remove the login token
export function clearToken() {
  localStorage.removeItem("token");
}

// Send requests to the Flask backend
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      "Something went wrong. Please try again."
    );
  }

  return data;
}

// API methods used by the frontend
const api = {
  get(path) {
    return request(path, {
      method: "GET",
    });
  },

  post(path, body) {
    return request(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

export default api;
