export default function EmptyState({ title = "Nothing here yet", message }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
    </div>
  );
}