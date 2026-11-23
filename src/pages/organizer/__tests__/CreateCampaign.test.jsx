import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CreateCampaign from '../CreateCampaign'
import api from '../../../services/api'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('../../../components/common/Input', () => ({
  default: ({ label, error, ...props }) => (
    <div>
      <label htmlFor={props.name}>{label}</label>
      <input id={props.name} {...props} />
      {error && <p>{error}</p>}
    </div>
  ),
}))

vi.mock('../../../components/common/Button', () => ({
  default: ({ children, loading, ...props }) => (
    <button {...props} disabled={props.disabled || loading}>
      {loading ? 'Loading...' : children}
    </button>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <CreateCampaign />
    </MemoryRouter>
  )
}

describe('CreateCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all campaign form fields', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Create a Campaign' })).toBeInTheDocument()
    expect(screen.getByLabelText('Campaign Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Fundraising Goal (KSh)')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date (optional)')).toBeInTheDocument()
  })

  it('rejects a title shorter than 3 characters', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Campaign Title'), {
      target: { value: 'Hi' },
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a valid description.' },
    })

    fireEvent.change(screen.getByLabelText('Fundraising Goal (KSh)'), {
      target: { value: '5000' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Campaign' }))

    expect(
      await screen.findByText('Title must contain at least 3 characters.')
    ).toBeInTheDocument()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('rejects a description shorter than 10 characters', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Campaign Title'), {
      target: { value: 'Valid Campaign' },
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Too short' },
    })

    fireEvent.change(screen.getByLabelText('Fundraising Goal (KSh)'), {
      target: { value: '5000' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Campaign' }))

    expect(
      await screen.findByText('Description must contain at least 10 characters.')
    ).toBeInTheDocument()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('rejects a fundraising goal below KSh 0.01', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Campaign Title'), {
      target: { value: 'Valid Campaign' },
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a valid description.' },
    })

    fireEvent.change(screen.getByLabelText('Fundraising Goal (KSh)'), {
      target: { value: '0' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Campaign' }))

    expect(
      await screen.findByText('Enter a goal amount of at least KSh 0.01.')
    ).toBeInTheDocument()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('submits valid campaign details and navigates to campaigns', async () => {
    api.post.mockResolvedValue({ data: { message: 'Created' } })

    renderPage()

    fireEvent.change(screen.getByLabelText('Campaign Title'), {
      target: { value: '  School Fees Campaign  ' },
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: '  Help students pay their school fees.  ' },
    })

    fireEvent.change(screen.getByLabelText('Fundraising Goal (KSh)'), {
      target: { value: '5000' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Campaign' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/campaigns/', {
        title: 'School Fees Campaign',
        description: 'Help students pay their school fees.',
        goal_amount: '5000.00',
        end_date: null,
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith('/organizer/campaigns')
  })

  it('displays an error when campaign creation fails', async () => {
    api.post.mockRejectedValue(new Error('Server error'))

    renderPage()

    fireEvent.change(screen.getByLabelText('Campaign Title'), {
      target: { value: 'Valid Campaign' },
    })

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'This is a valid description.' },
    })

    fireEvent.change(screen.getByLabelText('Fundraising Goal (KSh)'), {
      target: { value: '5000' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Campaign' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates back to campaigns when Cancel is clicked', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockNavigate).toHaveBeenCalledWith('/organizer/campaigns')
  })
})
