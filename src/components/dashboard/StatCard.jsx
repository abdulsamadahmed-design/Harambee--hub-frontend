export default function StatCard({
  title,
  value,
  description,
}) {
  return (
    <article className="stat-card">
      <h3>{title}</h3>
      <p className="stat-card-value">{value ?? '—'}</p>
      {description && (
        <p className="stat-card-description">{description}</p>
      )}
    </article>
  )
}
