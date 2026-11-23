import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import MyContributions from './MyContributions'
import api from '../../services/api'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('../../components/layout/DashboardLayout', () => ({
  default: ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('../../components/pledges/PledgeTable', () => ({
  default: ({ pledges }) => (
    <div data-testid="pledge-table">
      {pledges.length} contributions displayed
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

vi.mock('../../components/common/Button', () => ({
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

describe('MyContributions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the loading state while contributions are loading', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    render(<MyContributions />)

    expect(screen.getByText('Loading contributions...')).toBeInTheDocument()
  })

  it('loads and displays contributions from the API', async () => {
    api.get.mockResolvedValue({
      items: [{ id: 1 }, { id: 2 }],
      pages: 1,
    })

    render(<MyContributions />)

    expect(await screen.findByTestId('pledge-table')).toHaveTextContent(
      '2 contributions displayed'
    )
    expect(api.get).toHaveBeenCalledWith('/pledges/mine?page=1&per_page=10')
  })

  it('uses the pledges response field when items is unavailable', async () => {
    api.get.mockResolvedValue({
      pledges: [{ id: 1 }],
      pages: 1,
    })

    render(<MyContributions />)

    expect(await screen.findByTestId('pledge-table')).toHaveTextContent(
      '1 contributions displayed'
    )
  })

  it('displays an empty contributions list', async () => {
    api.get.mockResolvedValue({ items: [], pages: 1 })

    render(<MyContributions />)

    expect(await screen.findByTestId('pledge-table')).toHaveTextContent(
      '0 contributions displayed'
    )
  })

  it('displays an error when the API request fails', async () => {
    api.get.mockRejectedValue(new Error('Unable to load contributions'))

    render(<MyContributions />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load contributions'
    )
  })

  it('uses a fallback message when the API error has no message', async () => {
    api.get.mockRejectedValue({})

    render(<MyContributions />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your contributions.'
    )
  })

  it('retries loading contributions when Try again is clicked', async () => {
    api.get
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce({ items: [], pages: 1 })

    render(<MyContributions />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2)
    })

    expect(await screen.findByTestId('pledge-table')).toHaveTextContent(
      '0 contributions displayed'
    )
  })

  it('moves to the next page', async () => {
    api.get
      .mockResolvedValueOnce({ items: [{ id: 1 }], pages: 2 })
      .mockResolvedValueOnce({ items: [{ id: 2 }], pages: 2 })

    render(<MyContributions />)

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/pledges/mine?page=2&per_page=10')
    })

    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('moves back to the previous page', async () => {
    api.get
      .mockResolvedValueOnce({ items: [{ id: 1 }], pages: 2 })
      .mockResolvedValueOnce({ items: [{ id: 2 }], pages: 2 })
      .mockResolvedValueOnce({ items: [{ id: 1 }], pages: 2 })

    render(<MyContributions />)

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText('Page 2 of 2')

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith('/pledges/mine?page=1&per_page=10')
    })

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('does not show pagination when there is only one page', async () => {
    api.get.mockResolvedValue({ items: [{ id: 1 }], pages: 1 })

    render(<MyContributions />)

    await screen.findByTestId('pledge-table')

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
  })
})
