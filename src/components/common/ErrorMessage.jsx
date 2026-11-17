import "./common.css";

// Shown when something goes wrong; onRetry is optional and adds a "Try again" button
export default function ErrorMessage({ message = "Something went wrong", onRetry }) {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}
