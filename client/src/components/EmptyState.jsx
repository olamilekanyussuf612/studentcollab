import Icon from "./Icon.jsx";

export default function EmptyState({
  emoji = "sparkles",
  title = "Nothing here yet",
  message = "",
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-emoji"><Icon name={emoji} /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionLabel && onAction && (
        <button className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}