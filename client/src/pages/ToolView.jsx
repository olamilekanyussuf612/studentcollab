import Notepad from "../tools/Notepad.jsx";
import Calculator from "../tools/Calculator.jsx";
import AIAssistant from "../tools/AIAssistant.jsx";
import Study from "../tools/Study.jsx";
import Icon from "../components/Icon.jsx";

const META = {
  notepad: { title: "Notepad", icon: "pen-to-square" },
  calc: { title: "Calculator", icon: "calculator" },
  assistant: { title: "AI Assistant", icon: "robot" },
  study: { title: "Study", icon: "graduation-cap" }
};

export default function ToolView({ tool, onBack }) {
  const meta = META[tool] || { title: "Tool", icon: "toolbox" };

  return (
    <div className="tool-view">
      <button className="back-btn" onClick={onBack}>
        <Icon name="arrow-left" /> Back to Tools
      </button>

      <div className="tool-view-head">
        <h2>
          <Icon name={meta.icon} /> {meta.title}
        </h2>
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