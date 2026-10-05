import { initials, avatarColor } from "../lib/format.js";

export default function Avatar({ name = "", size = 36, seed }) {
  const label = initials(name);
  const color = avatarColor(seed || name || "?");
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: Math.round(size * 0.4)
      }}
      title={name}
    >
      {label}
    </div>
  );
}