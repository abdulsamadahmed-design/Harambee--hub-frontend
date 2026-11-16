
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          Harambee Hub
        </a>

        <nav className="navbar-links" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/campaigns">Campaigns</a>
        </nav>

        <div className="navbar-actions">
          <a href="/login" className="navbar-login">
            Login
          </a>

          <a href="/register" className="navbar-register">
            Get Started
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar
