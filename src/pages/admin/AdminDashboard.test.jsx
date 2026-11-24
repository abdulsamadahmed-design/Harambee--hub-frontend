import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminDashboard from './AdminDashboard'
import useFetch from '../../hooks/useFetch'

vi.mock('../../hooks/useFetch', () => ({
  default: vi.fn(),
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

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading message while dashboard data is loading', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: true,
      error: '',
      refetch: vi.fn(),
    })

    render(<AdminDashboard />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading platform statistics...'
    )
  })

  it('displays dashboard statistics and breakdowns', () => {
    useFetch.mockReturnValue({
      data: {
        users_by_role: { organizer: 2, contributor: 5 },
        campaigns_by_status: { active: 3, completed: 1 },
        pledges_by_status: { pending: 4, confirmed: 2 },
        total_pledged: 5000,
        total_confirmed: 3000,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<AdminDashboard />)

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Total Pledged')).toBeInTheDocument()
    expect(screen.getByText('Total Confirmed')).toBeInTheDocument()

    expect(screen.getByText('Users by Role')).toBeInTheDocument()
    expect(screen.getByText('organizer:')).toBeInTheDocument()
    expect(screen.getByText('contributor:')).toBeInTheDocument()

    expect(screen.getByText('Campaigns by Status')).toBeInTheDocument()
    expect(screen.getByText('active:')).toBeInTheDocument()
    expect(screen.getByText('completed:')).toBeInTheDocument()

    expect(screen.getByText('Contributions by Status')).toBeInTheDocument()
    expect(screen.getByText('pending:')).toBeInTheDocument()
    expect(screen.getByText('confirmed:')).toBeInTheDocument()
  })

  it('calculates totals from the role and campaign breakdowns', () => {
    useFetch.mockReturnValue({
      data: {
        users_by_role: { organizer: 2, contributor: 5 },
        campaigns_by_status: { active: 3, completed: 1 },
        pledges_by_status: {},
        total_pledged: 0,
        total_confirmed: 0,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<AdminDashboard />)

    const totalUsers = screen.getByText('Total Users').parentElement
    const totalCampaigns = screen.getByText('Total Campaigns').parentElement

    expect(totalUsers.querySelector('strong')).toHaveTextContent('7')
    expect(totalCampaigns.querySelector('strong')).toHaveTextContent('4')
  })

  it('handles missing breakdown data', () => {
    useFetch.mockReturnValue({
      data: {},
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<AdminDashboard />)

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Users by Role')).toBeInTheDocument()
    expect(screen.getByText('Campaigns by Status')).toBeInTheDocument()
    expect(screen.getByText('Contributions by Status')).toBeInTheDocument()
  })

  it('shows a message when dashboard data is unavailable', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<AdminDashboard />)

    expect(
      screen.getByText('No dashboard statistics available.')
    ).toBeInTheDocument()
  })

  it('displays an error when fetching dashboard data fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Unable to load dashboard',
      refetch: vi.fn(),
    })

    render(<AdminDashboard />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load dashboard'
    )
  })

  it('retries fetching dashboard data when Try again is clicked', () => {
    const refetch = vi.fn()

    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Temporary error',
      refetch,
    })

    render(<AdminDashboard />)
    screen.getByRole('button', { name: 'Try again' }).click()

    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
