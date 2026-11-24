import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ResetPassword from './ResetPassword'
import api from '../../services/api'

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  )
}

function fillValidForm() {
  fireEvent.change(
    screen.getByPlaceholderText('Enter your registered email'),
    { target: { value: 'user@example.com' } }
  )

  fireEvent.change(
    screen.getByPlaceholderText('Enter the code from your email'),
    { target: { value: 'test-recovery-code' } }
  )

  fireEvent.change(
    screen.getByPlaceholderText('At least 8 characters'),
    { target: { value: 'NewPassword123!' } }
  )

  fireEvent.change(
    screen.getByPlaceholderText('Enter your new password again'),
    { target: { value: 'NewPassword123!' } }
  )
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all password recovery fields', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Reset Your Password' })
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Enter your registered email')
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Enter the code from your email')
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('At least 8 characters')
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Enter your new password again')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Reset Password' })
    ).toBeInTheDocument()
  })

  it('rejects passwords shorter than eight characters', () => {
    renderPage()
    fillValidForm()

    fireEvent.change(
      screen.getByPlaceholderText('At least 8 characters'),
      { target: { value: 'short' } }
    )

    fireEvent.change(
      screen.getByPlaceholderText('Enter your new password again'),
      { target: { value: 'short' } }
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Password' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must contain at least 8 characters.'
    )

    expect(api.post).not.toHaveBeenCalled()
  })

  it('rejects passwords that do not match', () => {
    renderPage()
    fillValidForm()

    fireEvent.change(
      screen.getByPlaceholderText('Enter your new password again'),
      { target: { value: 'DifferentPassword123!' } }
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Password' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Passwords do not match.'
    )

    expect(api.post).not.toHaveBeenCalled()
  })

  it('successfully resets the password', async () => {
    api.post.mockResolvedValue({
      message: 'Password reset successfully. You can now log in.',
    })

    renderPage()
    fillValidForm()

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Password' })
    )

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        {
          email: 'user@example.com',
          code: 'test-recovery-code',
          new_password: 'NewPassword123!',
        }
      )
    })

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Password reset successfully. You can now log in.'
    )
  })

  it('displays an error when the backend rejects the recovery code', async () => {
    api.post.mockRejectedValue(
      new Error('Invalid or expired recovery code')
    )

    renderPage()
    fillValidForm()

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset Password' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid or expired recovery code'
    )
  })

  it('displays the login link', () => {
    renderPage()

    expect(
      screen.getByRole('link', { name: 'Log in' })
    ).toHaveAttribute('href', '/login')
  })
})
