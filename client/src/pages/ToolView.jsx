import Notepad from "../tools/Notepad.jsx";
import Calculator from "../tools/Calculator.jsx";
import AIAssistant from "../tools/AIAssistant.jsx";
import Study from "../tools/Study.jsx";

const META = {
  notepad:   { title: "📝 Notepad" },
  calc:      { title: "🧮 Calculator" },
  assistant: { title: "🤖 AI Assistant" },
  study:     { title: "🎓 Study" }
};

export default function ToolView({ tool, onBack }) {
  const meta = META[tool] || { title: "Tool" };

  return (
    <div className="tool-view">
      <button className="back-btn" onClick={onBack}>
        <span aria-hidden>←</span> Back to Tools
      </button>

      <div className="tool-view-head">
        <h2>{meta.title}</h2>
      </div>

      <div className="tool-body">
        {tool === "notepad" && <Notepad />}
        {tool === "calc" && <Calculator />}
        {tool === "assistant" && <AIAssistant />}
        {tool === "study" && <Study />}
      </div>
    </div>
  );
}