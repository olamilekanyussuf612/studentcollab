import Icon from "./Icon.jsx";

const TABS = [
  { id: "home", label: "Home", icon: "house" },
  { id: "tools", label: "Tools", icon: "toolbox" },
  { id: "profile", label: "Profile", icon: "user" }
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
          <Icon name={t.icon} className="nav-icon" />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}