const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "tools", label: "Tools", icon: "🧰" },
  { id: "profile", label: "Profile", icon: "👤" }
];

export default function AppNav({ view, onNavigate }) {
  return (
    <nav className="app-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={view === t.id ? "nav-pill active" : "nav-pill"}
          onClick={() => onNavigate(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}