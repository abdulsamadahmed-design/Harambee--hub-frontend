
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const SESSION_EXPIRED_EVENT = 'auth:session-expired'

let refreshPromise = null

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  if (!token) {
    throw new Error('Authentication token is missing')
  }

  localStorage.setItem(TOKEN_KEY, token)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveRefreshToken(token) {
  if (!token) {
    throw new Error('Refresh token is missing')
  }

  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function expireSession() {
  clearToken()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
}

async function parseResponse(response) {
  const responseText = await response.text()

  if (!responseText) return null

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

function getErrorMessage(result, status) {
  const message =
    result?.message ||
    result?.detail ||
    result?.error ||
    result?.errors ||
    `Request failed with status ${status}`

  return typeof message === 'string'
    ? message
    : JSON.stringify(message)
}

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('Refresh token is missing')
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })
  } catch {
    throw new Error(
      'Unable to connect to the server while refreshing your session.'
    )
  }

  const result = await parseResponse(response)

  if (!response.ok || !result?.token) {
    const error = new Error(
      getErrorMessage(result, response.status)
    )

    error.status = response.status

    throw error
  }

  saveToken(result.token)

  return result.token
}

// Only one refresh request runs when several API requests
// receive 401 responses at approximately the same time.
function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

async function request(method, path, data, hasRetried = false) {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`

  const isAuthEndpoint = [
    '/auth/login',
    '/auth/refresh',
  ].includes(normalizedPath)

  const isFormData =
    typeof FormData !== 'undefined' &&
    data instanceof FormData

  const headers = {
    Accept: 'application/json',
  }

  const token = getToken()

  if (token && !isAuthEndpoint) {
    headers.Authorization = `Bearer ${token}`
  }

  // Never manually set multipart Content-Type.
  // The browser must generate its boundary.
  if (data !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  let response

  try {
    response = await fetch(
      `${API_BASE_URL}${normalizedPath}`,
      {
        method,
        headers,
        body:
          data === undefined
            ? undefined
            : isFormData
              ? data
              : JSON.stringify(data),
      }
    )
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your backend.'
    )
  }

  const result = await parseResponse(response)

  if (
    response.status === 401 &&
    !isAuthEndpoint &&
    token
  ) {
    if (hasRetried) {
      expireSession()
      throw new Error(
        'Your session has expired. Please log in again.'
      )
    }

    if (!getRefreshToken()) {
      expireSession()
      throw new Error(
        'Your session has expired. Please log in again.'
      )
    }

    try {
      await refreshAccessToken()

      // Retry the original API request with the new access token.
      return request(method, path, data, true)
    } catch (error) {
      // Do not log out users because of a temporary server
      // or network failure.
      if (!error.status || error.status >= 500) {
        throw error
      }

      expireSession()

      throw new Error(
        'Your session has expired. Please log in again.',
          { cause: error }
      )
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, response.status)
    )
  }

  return result
}

const api = {
  get(path) {
    return request('GET', path)
  },

  post(path, data) {
    return request('POST', path, data)
  },

  put(path, data) {
    return request('PUT', path, data)
  },

  patch(path, data) {
    return request('PATCH', path, data)
  },

  delete(path) {
    return request('DELETE', path)
  },
}

export default api
