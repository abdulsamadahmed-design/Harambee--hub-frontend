
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Harambee Hub
        </Link>

        <nav className="navbar-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/campaigns">Campaigns</Link>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="navbar-login">
            Login
          </Link>

          <Link to="/register" className="navbar-register">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar

