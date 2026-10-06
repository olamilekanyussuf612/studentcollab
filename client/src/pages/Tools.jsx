import Icon from "../components/Icon.jsx";

const TOOLS = [
  {
    id: "notepad",
    icon: "pen-to-square",
    name: "Notepad",
    desc: "Quick notes that save on this device.",
    tone: "blue"
  },
  {
    id: "calc",
    icon: "calculator",
    name: "Calculator",
    desc: "Basic arithmetic, clean and fast.",
    tone: "green"
  },
  {
    id: "assistant",
    icon: "robot",
    name: "AI Assistant",
    desc: "Ask any study question and get help.",
    tone: "purple"
  },
  {
    id: "study",
    icon: "graduation-cap",
    name: "Study",
    desc: "Summarize notes → flashcards → quiz.",
    tone: "orange"
  }
];

export default function Tools({ onOpen }) {
  return (
    <div className="tools">
      <div className="tools-head">
        <h2>Study tools</h2>
        <p>Everything you need in one place — notes, AI help, and study practice.</p>
      </div>

      <div className="tools-grid">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`tool-card tone-${t.tone}`}
            onClick={() => onOpen(t.id)}
          >
            <span className="tool-icon"><Icon name={t.icon} /></span>
            <span className="tool-name">{t.name}</span>
            <span className="tool-desc">{t.desc}</span>
            <span className="tool-arrow"><Icon name="arrow-right" /></span>
          </button>
        ))}
      </div>
    </div>
  );
}