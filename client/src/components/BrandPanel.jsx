export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      {/* animated background layers */}
      <div className="brand-bg" aria-hidden>
        <div className="brand-orb orb-1" />
        <div className="brand-orb orb-2" />
        <div className="brand-orb orb-3" />
        <div className="brand-grid" />
        <div className="brand-floaters">
          <span className="floater f1">📚</span>
          <span className="floater f2">📝</span>
          <span className="floater f3">🎴</span>
          <span className="floater f4">🤖</span>
          <span className="floater f5">🧮</span>
        </div>
      </div>

      <div className="brand-panel-top">
        <div className="brand-panel-logo">📚</div>
        <span className="brand-panel-name">Student Collab</span>
      </div>

      <div className="brand-panel-body">
        <h2 className="brand-headline">
          Your class, <span className="brand-accent">in one place.</span>
        </h2>
        <p className="brand-sub">
          Ask questions, share notes, join study groups and revise smarter —
          together with your classmates.
        </p>
        <ul className="brand-panel-list">
          <li style={{ animationDelay: "0.35s" }}>
            <span className="bullet" /> 📖 Subject feeds &amp; discussions
          </li>
          <li style={{ animationDelay: "0.45s" }}>
            <span className="bullet" /> 📝 Notes, resources &amp; images
          </li>
          <li style={{ animationDelay: "0.55s" }}>
            <span className="bullet" /> 🤖 AI study assistant
          </li>
          <li style={{ animationDelay: "0.65s" }}>
            <span className="bullet" /> 🎴 Flashcards &amp; quizzes
          </li>
        </ul>
      </div>

      <div className="brand-panel-footer">
        <span className="pulse-dot" /> Built for students, by students.
      </div>
    </aside>
  );
}