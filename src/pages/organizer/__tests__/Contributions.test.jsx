import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Contributions from '../Contributions'
import useFetch from '../../../hooks/useFetch'

vi.mock('../../../hooks/useFetch')

vi.mock('../../../components/layout/DashboardLayout', () => ({
  default: ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('../../../components/common/Loader', () => ({
  default: () => <div>Loading contributions...</div>,
}))

vi.mock('../../../components/common/ErrorMessage', () => ({
  default: ({ message }) => <div>{message}</div>,
}))

vi.mock('../../../components/common/EmptyState', () => ({
  default: ({ title, message }) => (
    <div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  ),
}))

vi.mock('../../../components/common/StatusBadge', () => ({
  default: ({ status }) => <span>{status}</span>,
}))

vi.mock('../../../utils/formatCurrency', () => ({
  default: (amount) => `KSh ${Number(amount).toFixed(2)}`,
}))

vi.mock('../../../utils/formatDate', () => ({
  default: () => '22 Nov 2026',
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <Contributions />
    </MemoryRouter>
  )
}

describe('Contributions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the contributions page heading and description', () => {
    useFetch.mockReturnValue({
      data: { items: [] },
      loading: false,
      error: null,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Contributions' })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Campaign Contributions' })
    ).toBeInTheDocument()

    expect(
      screen.getByText('View contributions made towards campaigns.')
    ).toBeInTheDocument()
  })

  it('displays a loading indicator while contributions are loading', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    })

    renderPage()

    expect(
      screen.getByText('Loading contributions...')
    ).toBeInTheDocument()
  })

  it('displays an error when fetching contributions fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load contributions',
    })

    renderPage()

    expect(
      screen.getByText('Failed to load contributions')
    ).toBeInTheDocument()
  })

  it('displays an empty state when there are no contributions', () => {
    useFetch.mockReturnValue({
      data: { items: [], total: 0 },
      loading: false,
      error: null,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No contributions yet' })
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Contributions will appear here when people support your campaigns.'
      )
    ).toBeInTheDocument()
  })

  it('displays contribution records in the table', () => {
    useFetch.mockReturnValue({
      data: {
        total: 1,
        items: [
          {
            id: 1,
            user: { name: 'John Doe' },
            campaign: { title: 'School Fees Campaign' },
            amount: 5000,
            created_at: '2026-11-22T10:00:00',
            status: 'completed',
          },
        ],
      },
      loading: false,
      error: null,
    })

    renderPage()

    expect(screen.getByText('1 contribution(s) found')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('School Fees Campaign')).toBeInTheDocument()
    expect(screen.getByText('KSh 5000.00')).toBeInTheDocument()
    expect(screen.getByText('22 Nov 2026')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('uses fallback values when contributor or campaign details are missing', () => {
    useFetch.mockReturnValue({
      data: {
        total: 1,
        items: [
          {
            id: 2,
            user: {},
            campaign: {},
            amount: 100,
            status: null,
          },
        ],
      },
      loading: false,
      error: null,
    })

    renderPage()

    expect(screen.getByText('Anonymous')).toBeInTheDocument()
    expect(screen.getAllByText('Campaign')).toHaveLength(2)
    expect(screen.getByText('pending')).toBeInTheDocument()
  })
})
