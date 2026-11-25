import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import OrganizerDashboard from '../OrganizerDashboard'
import useFetch from '../../../hooks/useFetch'

vi.mock('../../../hooks/useFetch', () => ({
  default: vi.fn(),
}))

vi.mock('../../../components/layout/DashboardLayout', () => ({
  default: ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('../../../components/common/Loader', () => ({
  default: ({ text }) => <div role="status">{text}</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ message, onRetry }) => (
    <div role="alert">
      <span>{message}</span>
      <button onClick={onRetry}>Try again</button>
    </div>
  ),
}))

describe('OrganizerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches statistics from the organizer dashboard endpoint', () => {
    useFetch.mockReturnValue({
      data: {
        total_campaigns: 3,
        active_campaigns: 2,
        total_contributions: 8,
        total_amount_raised: 12500,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(useFetch).toHaveBeenCalledWith('/organizer/dashboard')
  })

  it('renders the organizer dashboard heading', () => {
    useFetch.mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(
      screen.getByRole('heading', { name: 'Organizer Dashboard' })
    ).toBeInTheDocument()
  })

  it('displays the welcome message', () => {
    useFetch.mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(screen.getByText('Welcome back!')).toBeInTheDocument()

    expect(
      screen.getByText(
        "Here's an overview of your campaigns and contributions."
      )
    ).toBeInTheDocument()
  })

  it('displays actual organizer statistics', () => {
    useFetch.mockReturnValue({
      data: {
        total_campaigns: 3,
        active_campaigns: 2,
        total_contributions: 8,
        total_amount_raised: 12500,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Total Contributions')).toBeInTheDocument()
    expect(screen.getByText('Total Amount Raised')).toBeInTheDocument()

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('KSh 12,500.00')).toBeInTheDocument()
  })

  it('displays zero statistics when the organizer has no campaigns', () => {
    useFetch.mockReturnValue({
      data: {
        total_campaigns: 0,
        active_campaigns: 0,
        total_contributions: 0,
        total_amount_raised: 0,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(screen.getAllByText('0')).toHaveLength(3)
    expect(screen.getByText('KSh 0.00')).toBeInTheDocument()
  })

  it('shows a loading message while statistics are loading', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading dashboard statistics...'
    )
  })

  it('displays an error when loading statistics fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Unable to load dashboard statistics.',
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load dashboard statistics.'
    )
  })

  it('retries loading statistics when Try again is clicked', () => {
    const refetch = vi.fn()

    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Temporary error',
      refetch,
    })

    render(<OrganizerDashboard />)

    screen.getByRole('button', { name: 'Try again' }).click()

    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('displays the empty activity message', () => {
    useFetch.mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<OrganizerDashboard />)

    expect(
      screen.getByText('No recent activity to display.')
    ).toBeInTheDocument()
  })
})
