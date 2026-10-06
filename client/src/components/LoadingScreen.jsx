import Icon from "./Icon.jsx";

export default function LoadingScreen({ message = "Loading…" }) {
  return (
    <div className="loading-screen">
      <div className="loading-brand">
        <div className="loading-mark">
          <Icon name="book" />
        </div>
        <h1>Student Collab</h1>
        <p>Learn together. Grow together.</p>
      </div>
      <div className="loading-spinner" aria-label="loading" />
      <p className="loading-msg">{message}</p>
    </div>
  );
}