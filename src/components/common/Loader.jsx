import "./common.css";

// Shown while data is loading
export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader" role="status">
      <div className="loader-spinner"></div>
      <p>{text}</p>
    </div>
  );
}
