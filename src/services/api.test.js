import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import api, {
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from './api'

function mockResponse(body, status = 200) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: vi.fn().mockResolvedValue(
      body === null || body === undefined
        ? ''
        : JSON.stringify(body)
    ),
  }
}

describe('API authentication and token refresh', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('attaches the access token to protected requests', async () => {
    saveToken('my-access-token')

    fetch.mockResolvedValueOnce(
      mockResponse({ message: 'Success' })
    )

    await expect(api.get('/campaigns')).resolves.toEqual({
      message: 'Success',
    })

    const [, options] = fetch.mock.calls[0]

    expect(options.headers.Authorization).toBe(
      'Bearer my-access-token'
    )
  })

  it('sends JSON data with the correct content type', async () => {
    const campaign = { title: 'Community Support' }

    fetch.mockResolvedValueOnce(
      mockResponse({ success: true })
    )

    await api.post('/campaigns', campaign)

    const [, options] = fetch.mock.calls[0]

    expect(options.headers['Content-Type']).toBe(
      'application/json'
    )
    expect(options.body).toBe(JSON.stringify(campaign))
  })

  it('does not manually set Content-Type for FormData', async () => {
    const formData = new FormData()
    formData.append('title', 'Community Support')

    fetch.mockResolvedValueOnce(
      mockResponse({ success: true })
    )

    await api.post('/campaigns', formData)

    const [, options] = fetch.mock.calls[0]

    expect(options.body).toBe(formData)
    expect(options.headers).not.toHaveProperty('Content-Type')
  })

  it('refreshes an expired access token and retries the request', async () => {
    saveToken('expired-access-token')
    saveRefreshToken('valid-refresh-token')

    fetch
      .mockResolvedValueOnce(mockResponse(
        { message: 'Token expired' },
        401
      ))
      .mockResolvedValueOnce(mockResponse({
        token: 'new-access-token',
      }))
      .mockResolvedValueOnce(mockResponse({
        campaigns: [],
      }))

    await expect(api.get('/campaigns')).resolves.toEqual({
      campaigns: [],
    })

    expect(fetch).toHaveBeenCalledTimes(3)

    const [, originalOptions] = fetch.mock.calls[0]
    const [refreshUrl, refreshOptions] = fetch.mock.calls[1]
    const [, retryOptions] = fetch.mock.calls[2]

    expect(originalOptions.headers.Authorization).toBe(
      'Bearer expired-access-token'
    )

    expect(refreshUrl).toContain('/auth/refresh')
    expect(refreshOptions.method).toBe('POST')
    expect(refreshOptions.headers.Authorization).toBe(
      'Bearer valid-refresh-token'
    )

    expect(retryOptions.headers.Authorization).toBe(
      'Bearer new-access-token'
    )

    expect(getToken()).toBe('new-access-token')
  })

  it('uses one refresh request for simultaneous failed requests', async () => {
    saveToken('expired-access-token')
    saveRefreshToken('valid-refresh-token')

    let refreshCalls = 0
    const resourceCalls = new Map()

    fetch.mockImplementation(async (url) => {
      if (url.includes('/auth/refresh')) {
        refreshCalls += 1

        return mockResponse({
          token: 'new-access-token',
        })
      }

      const count = (resourceCalls.get(url) || 0) + 1
      resourceCalls.set(url, count)

      if (count === 1) {
        return mockResponse(
          { message: 'Token expired' },
          401
        )
      }

      return mockResponse({ success: true })
    })

    const [first, second] = await Promise.all([
      api.get('/private-a'),
      api.get('/private-b'),
    ])

    expect(first).toEqual({ success: true })
    expect(second).toEqual({ success: true })
    expect(refreshCalls).toBe(1)
  })

  it('clears tokens when the refresh token is invalid', async () => {
    saveToken('expired-access-token')
    saveRefreshToken('invalid-refresh-token')

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    fetch
      .mockResolvedValueOnce(
        mockResponse({ message: 'Expired' }, 401)
      )
      .mockResolvedValueOnce(
        mockResponse({ message: 'Invalid refresh token' }, 401)
      )

    await expect(
      api.get('/private')
    ).rejects.toThrow('Your session has expired')

    expect(getToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'auth:session-expired',
      })
    )
  })

  it('expires the session when no refresh token exists', async () => {
    saveToken('expired-access-token')

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    fetch.mockResolvedValueOnce(
      mockResponse({ message: 'Expired' }, 401)
    )

    await expect(
      api.get('/private')
    ).rejects.toThrow('Your session has expired')

    expect(getToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'auth:session-expired',
      })
    )
  })

  it('preserves the session when the refresh server returns a 500 error', async () => {
    saveToken('expired-access-token')
    saveRefreshToken('valid-refresh-token')

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    fetch
      .mockResolvedValueOnce(
        mockResponse({ message: 'Expired' }, 401)
      )
      .mockResolvedValueOnce(
        mockResponse({ message: 'Temporary server error' }, 500)
      )

    await expect(
      api.get('/private')
    ).rejects.toThrow('Temporary server error')

    expect(getToken()).toBe('expired-access-token')
    expect(getRefreshToken()).toBe('valid-refresh-token')
    expect(dispatchSpy).not.toHaveBeenCalled()
  })
})
