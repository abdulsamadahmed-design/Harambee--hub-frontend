import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ManageCampaigns from '../ManageCampaigns'
import useFetch from '../../../hooks/useFetch'

vi.mock('../../../hooks/useFetch')

vi.mock('../../../components/campaigns/CampaignCard', () => ({
  default: ({ campaign }) => (
    <div data-testid="campaign-card">
      {campaign.title}
    </div>
  ),
}))

vi.mock('../../../components/common/Loader', () => ({
  default: () => <div>Loading campaigns...</div>,
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

vi.mock('../../../components/common/Button', () => ({
  default: ({ children }) => <button>{children}</button>,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ManageCampaigns />
    </MemoryRouter>
  )
}

describe('ManageCampaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading and create campaign link', () => {
    useFetch.mockReturnValue({
      data: { items: [] },
      loading: false,
      error: null,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Manage Campaigns' })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Create Campaign' })
    ).toHaveAttribute('href', '/organizer/campaigns/new')
  })

  it('displays a loading indicator while campaigns are loading', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    })

    renderPage()

    expect(screen.getByText('Loading campaigns...')).toBeInTheDocument()
  })

  it('displays an error when fetching campaigns fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load campaigns',
    })

    renderPage()

    expect(
      screen.getByText('Failed to load campaigns')
    ).toBeInTheDocument()
  })

  it('displays an empty state when there are no campaigns', () => {
    useFetch.mockReturnValue({
      data: { items: [], total: 0 },
      loading: false,
      error: null,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No campaigns yet' })
    ).toBeInTheDocument()

    expect(
      screen.getByText('Create your first campaign to get started.')
    ).toBeInTheDocument()
  })

  it('displays the campaign count and campaign cards', () => {
    useFetch.mockReturnValue({
      data: {
        total: 2,
        items: [
          { id: 1, title: 'School Fees Campaign' },
          { id: 2, title: 'Medical Support Campaign' },
        ],
      },
      loading: false,
      error: null,
    })

    renderPage()

    expect(screen.getByText('2 campaign(s) found')).toBeInTheDocument()
    expect(screen.getByText('School Fees Campaign')).toBeInTheDocument()
    expect(screen.getByText('Medical Support Campaign')).toBeInTheDocument()
    expect(screen.getAllByTestId('campaign-card')).toHaveLength(2)
  })
})
