import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PledgeForm from './PledgeForm'
import api from '../../services/api'
import { useAuth } from '../../context/useAuth'

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('PledgeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      user: { name: 'Abdulsalam Ahmed' },
    })
  })

  it('displays the contributor name', () => {
    render(<PledgeForm campaignId={1} />)

    expect(screen.getByText('Abdulsalam Ahmed')).toBeInTheDocument()
  })

  it('uses full_name when name is unavailable', () => {
    useAuth.mockReturnValue({
      user: { full_name: 'Contributor Full Name' },
    })

    render(<PledgeForm campaignId={1} />)

    expect(screen.getByText('Contributor Full Name')).toBeInTheDocument()
  })

  it('uses a fallback when the user has no name', () => {
    useAuth.mockReturnValue({ user: {} })

    render(<PledgeForm campaignId={1} />)

    expect(screen.getByText('Your account')).toBeInTheDocument()
  })

  it('rejects an amount below KSh 1', async () => {
    render(<PledgeForm campaignId={1} />)

    fireEvent.change(screen.getByLabelText(/pledge amount/i), {
      target: { value: '0' },
    })

    fireEvent.submit(screen.getByRole('button', { name: /submit pledge/i }).closest('form'))

    expect(
      await screen.findByText('Enter a valid pledge amount of at least KSh 1.')
    ).toBeInTheDocument()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('rejects an amount above KSh 10,000,000', async () => {
    render(<PledgeForm campaignId={1} />)

    fireEvent.change(screen.getByLabelText(/pledge amount/i), {
      target: { value: '10000001' },
    })

    fireEvent.submit(screen.getByRole('button', { name: /submit pledge/i }).closest('form'))

    expect(
      await screen.findByText('The maximum pledge amount is KSh 10,000,000.')
    ).toBeInTheDocument()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('submits a valid pledge and calls onSuccess', async () => {
    const onSuccess = vi.fn()
    const pledge = { id: 10, amount: 500, message: 'For education' }

    api.post.mockResolvedValue({ pledge })

    render(<PledgeForm campaignId={5} onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/pledge amount/i), {
      target: { value: '500' },
    })

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: '  For education  ' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit pledge/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/pledges/campaign/5', {
        amount: 500,
        message: 'For education',
      })
    })

    expect(onSuccess).toHaveBeenCalledWith(pledge)
    expect(screen.getByLabelText(/pledge amount/i).value).toBe('')
    expect(screen.getByLabelText(/message/i)).toHaveValue('')
  })

  it('handles API errors', async () => {
    api.post.mockRejectedValue(new Error('Server unavailable'))

    render(<PledgeForm campaignId={1} />)

    fireEvent.change(screen.getByLabelText(/pledge amount/i), {
      target: { value: '100' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit pledge/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Server unavailable'
    )
  })

  it('uses a fallback error when the API error has no message', async () => {
    api.post.mockRejectedValue({})

    render(<PledgeForm campaignId={1} />)

    fireEvent.change(screen.getByLabelText(/pledge amount/i), {
      target: { value: '100' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit pledge/i }))

    expect(
      await screen.findByText('Could not submit your pledge.')
    ).toBeInTheDocument()
  })

  it('disables submission when there is no campaign ID', () => {
    render(<PledgeForm />)

    expect(screen.getByRole('button', { name: /submit pledge/i })).toBeDisabled()
  })

  it('submits successfully without an onSuccess callback', async () => {
    api.post.mockResolvedValue({ pledge: { id: 11 } })

    render(<PledgeForm campaignId={2} />)

    fireEvent.change(screen.getByLabelText(/pledge amount/i), {
      target: { value: '250' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit pledge/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled()
    })
  })
})
