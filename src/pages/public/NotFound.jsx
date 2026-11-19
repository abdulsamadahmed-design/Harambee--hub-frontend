import { Link } from "react-router-dom";
import "../../components/common/common.css";

// The 404 page: shown when the address does not match any page
export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Sorry, we could not find that page.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}
