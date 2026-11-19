export default function StatusBadge({ status }) {
  const normalizedStatus = String(status ?? "active").toLowerCase();

  return (
    <span className={`status-badge status-badge-${normalizedStatus}`}>
      {normalizedStatus}
    </span>
  );
}