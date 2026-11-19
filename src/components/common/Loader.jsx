export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}