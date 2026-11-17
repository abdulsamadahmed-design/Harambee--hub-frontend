import "./common.css";

// Shown when a list has nothing in it; children lets a page add a button
export default function EmptyState({ title = "Nothing here yet", message = "", children }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
