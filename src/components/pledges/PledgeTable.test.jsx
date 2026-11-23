import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PledgeTable from './PledgeTable'

describe('PledgeTable', () => {
  it('displays a loading message', () => {
    render(<PledgeTable loading />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading contributions...'
    )
  })

  it('displays an empty state when there are no pledges', () => {
    render(<PledgeTable pledges={[]} />)

    expect(screen.getByText('No contributions found.')).toBeInTheDocument()
  })

  it('displays pledge details and contributor name', () => {
    render(
      <PledgeTable
        pledges={[
          {
            id: 1,
            amount: 500,
            message: 'For education',
            created_at: '2026-11-20T10:00:00Z',
            status: 'pending',
            contributor: { name: 'Amina Hassan' },
          },
        ]}
      />
    )

    expect(screen.getByText('Amina Hassan')).toBeInTheDocument()
    expect(screen.getByText('For education')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText(/Ksh/)).toBeInTheDocument()
  })

  it('uses the user name when contributor name is unavailable', () => {
    render(
      <PledgeTable
        pledges={[
          {
            id: 2,
            amount: 100,
            status: 'confirmed',
            user: { name: 'User Name' },
          },
        ]}
      />
    )

    expect(screen.getByText('User Name')).toBeInTheDocument()
  })

  it('uses user full_name as a fallback', () => {
    render(
      <PledgeTable
        pledges={[
          {
            id: 3,
            amount: 100,
            status: 'pending',
            user: { full_name: 'Full Name' },
          },
        ]}
      />
    )

    expect(screen.getByText('Full Name')).toBeInTheDocument()
  })

  it('uses contributor_name as a fallback', () => {
    render(
      <PledgeTable
        pledges={[
          {
            id: 4,
            amount: 100,
            status: 'pending',
            contributor_name: 'Contributor Name',
          },
        ]}
      />
    )

    expect(screen.getByText('Contributor Name')).toBeInTheDocument()
  })

  it('uses Name unavailable when no contributor name exists', () => {
    render(
      <PledgeTable
        pledges={[
          { id: 5, amount: 100, status: 'pending' },
        ]}
      />
    )

    expect(screen.getByText('Name unavailable')).toBeInTheDocument()
  })

  it('uses a dash when the message is missing', () => {
    render(
      <PledgeTable
        pledges={[
          { id: 6, amount: 100, status: 'pending' },
        ]}
      />
    )

    const row = screen.getByText('Name unavailable').closest('tr')
    expect(row).toHaveTextContent('—')
  })

  it('does not display actions when no callbacks are provided', () => {
    render(
      <PledgeTable
        pledges={[
          { id: 7, amount: 100, status: 'pending' },
        ]}
      />
    )

    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onConfirm when Confirm is clicked for a pending pledge', () => {
    const onConfirm = vi.fn()
    const pledge = { id: 8, amount: 200, status: 'pending' }

    render(
      <PledgeTable pledges={[pledge]} onConfirm={onConfirm} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onConfirm).toHaveBeenCalledWith(pledge)
  })

  it('calls onDelete when Delete is clicked for a pending pledge', () => {
    const onDelete = vi.fn()
    const pledge = { id: 9, amount: 300, status: 'pending' }

    render(
      <PledgeTable pledges={[pledge]} onDelete={onDelete} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledWith(pledge)
  })

  it('hides Confirm and Delete actions for non-pending pledges', () => {
    render(
      <PledgeTable
        pledges={[
          { id: 10, amount: 400, status: 'confirmed' },
        ]}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('disables Confirm and Delete while the pledge is busy', () => {
    render(
      <PledgeTable
        pledges={[
          { id: 11, amount: 500, status: 'pending' },
        ]}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        busyId={11}
      />
    )

    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('displays the Actions column when a callback is provided', () => {
    render(
      <PledgeTable
        pledges={[
          { id: 12, amount: 100, status: 'pending' },
        ]}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
  })
})
