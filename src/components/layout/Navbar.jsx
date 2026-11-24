
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Navbar() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardRoutes = {
    organizer: "/organizer",
    contributor: "/contributor",
    admin: "/admin",
  };

  const dashboardPath = user ? dashboardRoutes[user.role] : null;

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

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
          {!loading && isAuthenticated ? (
            <>
              {dashboardPath && (
                <Link to={dashboardPath} className="navbar-login">
                  Dashboard
                </Link>
              )}

              <button
                type="button"
                className="navbar-register"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : !loading ? (
            <>
              <Link to="/login" className="navbar-login">
                Login
              </Link>

              <Link to="/register" className="navbar-register">
                Get Started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;