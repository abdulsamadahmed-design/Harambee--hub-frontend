import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container m3-page">
      <h1>Page not found</h1>
      <Link to="/campaigns" className="btn btn-primary">
        Browse campaigns
      </Link>
    </div>
  );
}