
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="hh-footer">
      <div className="container hh-footer-content">
        <div>
          <Link to="/" className="hh-footer-brand">
            Harambee Hub
          </Link>
          <p>Coming together to make meaningful change.</p>
        </div>

        <nav className="hh-footer-links" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>

      <div className="container hh-copyright">
        © {new Date().getFullYear()} Harambee Hub. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
