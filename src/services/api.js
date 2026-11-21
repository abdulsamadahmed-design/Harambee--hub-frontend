
// Address of our Flask backend
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "token";

// Get the saved login token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Save the login token
export function saveToken(token) {
  if (!token) {
    throw new Error("Authentication token is missing");
  }

  localStorage.setItem(TOKEN_KEY, token);
}

// Remove the login token
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Reusable API request function
async function request(method, path, data) {
  const headers = {
    Accept: "application/json",
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
      {
        method,
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined,
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your backend."
    );
  }

  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  if (!response.ok) {
    const message =
      result?.message ||
      result?.detail ||
      result?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }

  return result;
}

// API methods used by the frontend
const api = {
  get(path) {
    return request("GET", path);
  },

  post(path, data) {
    return request("POST", path, data);
  },

  put(path, data) {
    return request("PUT", path, data);
  },

  patch(path, data) {
    return request("PATCH", path, data);
  },

  delete(path) {
    return request("DELETE", path);
  },
};

export default api;
