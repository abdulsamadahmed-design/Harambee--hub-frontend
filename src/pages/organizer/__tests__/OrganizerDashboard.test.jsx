import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrganizerDashboard from '../OrganizerDashboard'

vi.mock('../../../components/layout/DashboardLayout', () => ({
  default: ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

describe('OrganizerDashboard', () => {
  it('renders the organizer dashboard heading', () => {
    render(<OrganizerDashboard />)

    expect(
      screen.getByRole('heading', { name: 'Organizer Dashboard' })
    ).toBeInTheDocument()
  })

  it('displays the welcome message', () => {
    render(<OrganizerDashboard />)

    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    expect(
      screen.getByText("Here's an overview of your campaigns and contributions.")
    ).toBeInTheDocument()
  })

  it('displays all four dashboard statistics', () => {
    render(<OrganizerDashboard />)

    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Total Contributions')).toBeInTheDocument()
    expect(screen.getByText('Total Amount Raised')).toBeInTheDocument()
  })

  it('displays placeholder values for statistics', () => {
    render(<OrganizerDashboard />)

    expect(screen.getAllByText('—')).toHaveLength(4)
  })

  it('displays the empty activity message', () => {
    render(<OrganizerDashboard />)

    expect(
      screen.getByText('No recent activity to display.')
    ).toBeInTheDocument()
  })
})
