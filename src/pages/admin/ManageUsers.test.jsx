import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import ManageUsers from './ManageUsers'
import useFetch from '../../hooks/useFetch'
import api from '../../services/api'

vi.mock('../../hooks/useFetch', () => ({
  default: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
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

describe('ManageUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading message while users are loading', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: true,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading users...')
  })

  it('displays users and their details', () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina Hassan',
            email: 'amina@example.com',
            phone: '0712345678',
            role: 'organizer',
            email_verified: true,
          },
          {
            id: 2,
            name: 'John Kamau',
            email: 'john@example.com',
            phone: '0723456789',
            role: 'contributor',
            email_verified: false,
          },
        ],
        total: 2,
        pages: 1,
        page: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByText('Amina Hassan')).toBeInTheDocument()
    expect(screen.getByText('amina@example.com')).toBeInTheDocument()
    expect(screen.getByText('0712345678')).toBeInTheDocument()
    expect(screen.getByText('organizer')).toBeInTheDocument()
    expect(screen.getByText('John Kamau')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('contributor')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Not verified')).toBeInTheDocument()
    expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument()
  })

  it('uses fallback text when a user name or phone is missing', () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            email: 'user@example.com',
            phone: '',
            role: 'contributor',
            email_verified: false,
          },
        ],
        total: 1,
        pages: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByText('Name unavailable')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('uses the number of returned users when total is missing', () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina',
            email: 'amina@example.com',
            role: 'organizer',
          },
        ],
        pages: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByText('Total registered users:')).toBeInTheDocument()
    expect(screen.getByText('1', { selector: 'strong' })).toBeInTheDocument()
  })

  it('displays an empty state when there are no users', () => {
    useFetch.mockReturnValue({
      data: { items: [], total: 0, pages: 1 },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByText('No users found.')).toBeInTheDocument()
  })

  it('handles missing user items', () => {
    useFetch.mockReturnValue({
      data: {},
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByText('No users found.')).toBeInTheDocument()
    expect(screen.getByText('Total registered users:')).toBeInTheDocument()
  })

  it('displays an error when fetching users fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Unable to load users',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load users')
  })

  it('retries fetching users when Try again is clicked', () => {
    const refetch = vi.fn()

    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Temporary error',
      refetch,
    })

    render(<ManageUsers />)
    screen.getByRole('button', { name: 'Try again' }).click()

    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows pagination and moves to the next page', async () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina',
            email: 'amina@example.com',
            role: 'organizer',
          },
        ],
        total: 11,
        pages: 2,
        page: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()

    await act(async () => {
      screen.getByRole('button', { name: 'Next' }).click()
    })

    expect(useFetch).toHaveBeenLastCalledWith(
      '/admin/users?page=2&per_page=10'
    )
  })

  it('disables Previous on the first page and Next on the last page', async () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina',
            email: 'amina@example.com',
            role: 'organizer',
          },
        ],
        total: 11,
        pages: 2,
        page: 2,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()

    await act(async () => {
      screen.getByRole('button', { name: 'Next' }).click()
    })

    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('does not show pagination when there is only one page', () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina',
            email: 'amina@example.com',
            role: 'organizer',
          },
        ],
        total: 1,
        pages: 1,
        page: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    render(<ManageUsers />)

    expect(
      screen.queryByRole('button', { name: 'Previous' })
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Next' })
    ).not.toBeInTheDocument()
  })

  it('sends a recovery email when the admin clicks the button', async () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina Hassan',
            email: 'amina@example.com',
            role: 'organizer',
          },
        ],
        total: 1,
        pages: 1,
        page: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    api.post.mockResolvedValue({
      message: "Recovery code sent to the user's registered email.",
    })

    render(<ManageUsers />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Generate Recovery Code',
      })
    )

    expect(api.post).toHaveBeenCalledWith(
      '/admin/users/1/recovery-code'
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      "Recovery code sent to the user's registered email."
    )
  })

  it('displays an error when recovery email generation fails', async () => {
    useFetch.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Amina Hassan',
            email: 'amina@example.com',
            role: 'organizer',
          },
        ],
        total: 1,
        pages: 1,
        page: 1,
      },
      loading: false,
      error: '',
      refetch: vi.fn(),
    })

    api.post.mockRejectedValue(
      new Error('Unable to send recovery email.')
    )

    render(<ManageUsers />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Generate Recovery Code',
      })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to send recovery email.'
    )
  })
})
