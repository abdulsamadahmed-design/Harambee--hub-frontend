import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import ContributorDashboard from './ContributorDashboard'
import api from '../../services/api'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('../../components/layout/DashboardLayout', () => ({
  default: ({ children, title, role }) => (
    <div data-testid="dashboard-layout" data-role={role}>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('../../components/dashboard/StatCard', () => ({
  default: ({ title, value }) => (
    <div>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  ),
}))

vi.mock('../../components/dashboard/ActivityFeed', () => ({
  default: ({ title, activities }) => (
    <div>
      <h2>{title}</h2>
      <span data-testid="activity-count">{activities.length}</span>
    </div>
  ),
}))

vi.mock('../../components/common/Loader', () => ({
  default: ({ text }) => <div role="status">{text}</div>,
}))

vi.mock('../../components/common/ErrorMessage', () => ({
  default: ({ message, onRetry }) => (
    <div role="alert">
      <span>{message}</span>
      <button onClick={onRetry}>Try again</button>
    </div>
  ),
}))

describe('ContributorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the loading state before the API request finishes', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    render(<ContributorDashboard />)

    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })

  it('loads contributions and displays dashboard statistics', async () => {
    api.get.mockResolvedValue({
      items: [
        { id: 1, amount: 500, status: 'confirmed' },
        { id: 2, amount: 300, status: 'pending' },
      ],
      pages: 1,
    })

    render(<ContributorDashboard />)

    expect(await screen.findByText('Total Contributions')).toBeInTheDocument()
    expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('Confirmed Amount')).toBeInTheDocument()
    expect(screen.getByText('Pending Contributions')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/pledges/mine?page=1&per_page=100')
    expect(screen.getByTestId('activity-count')).toHaveTextContent('2')
  })

  it('fetches all pages when contributions span multiple pages', async () => {
    api.get
      .mockResolvedValueOnce({
        items: [{ id: 1, amount: 100, status: 'pending' }],
        pages: 2,
      })
      .mockResolvedValueOnce({
        items: [{ id: 2, amount: 200, status: 'confirmed' }],
      })

    render(<ContributorDashboard />)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2)
    })

    expect(api.get).toHaveBeenNthCalledWith(
      2,
      '/pledges/mine?page=2&per_page=100'
    )
    expect(screen.getByTestId('activity-count')).toHaveTextContent('2')
  })

  it('handles an empty contributions response', async () => {
    api.get.mockResolvedValue({ items: [], pages: 1 })

    render(<ContributorDashboard />)

    expect(await screen.findByText('Total Contributions')).toBeInTheDocument()
    expect(screen.getByTestId('activity-count')).toHaveTextContent('0')
  })

  it('displays an error when the API request fails', async () => {
    api.get.mockRejectedValue(new Error('Unable to load contributions'))

    render(<ContributorDashboard />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load contributions'
    )
  })

  it('uses a fallback message when the API error has no message', async () => {
    api.get.mockRejectedValue({})

    render(<ContributorDashboard />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your contributions.'
    )
  })

  it('retries the request when Try again is clicked', async () => {
    api.get
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce({ items: [], pages: 1 })

    render(<ContributorDashboard />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await act(async () => { screen.getByRole('button', { name: 'Try again' }).click() })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2)
    })

    expect(await screen.findByText('Total Contributions')).toBeInTheDocument()
  })
})
