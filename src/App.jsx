import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "./pages/public/Home";
import Campaigns from "./pages/public/Campaigns";
import CampaignDetails from "./pages/public/CampaignDetails";
import NotFound from "./pages/public/NotFound";
import "./styles/variables.css";
import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <header className="m3-site-header">
        <nav className="container m3-nav" aria-label="Main navigation">
          <Link className="m3-brand" to="/">Harambee Hub</Link>
          <div className="m3-nav-links">
            <Link to="/campaigns">Campaigns</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route
            path="/login"
            element={<div className="container m3-page"><h1>Login</h1></div>}
          />
          <Route
            path="/register"
            element={<div className="container m3-page"><h1>Register</h1></div>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
