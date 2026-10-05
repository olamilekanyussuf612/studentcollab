import { useState, useEffect, useRef } from "react";
import api from "../lib/api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import useConfirm from "../hooks/useConfirm.js";

const SUGGESTIONS = [
  "Explain photosynthesis in simple terms",
  "Solve: 2x + 5 = 17",
  "What is the difference between speed and velocity?",
  "Give me 3 study tips for exams"
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm your study assistant. Ask me anything about your subjects — Math, English, Biology, Chemistry, Physics and more."
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const { confirmState, askConfirm, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    setError("");
    const userMsg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { reply } = await api.post("/api/ai/chat", { messages: next });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "⚠️ I couldn't reach the AI right now. Please try again in a moment."
        }
      ]);
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = async () => {
    const ok = await askConfirm({
      title: "Start a new chat?",
      message: "This conversation will be cleared.",
      confirmLabel: "Clear",
      danger: true
    });
    if (!ok) return;

    setMessages([INITIAL_MESSAGE]);
    setError("");
    setInput("");
  };

  return (
    <div className="ai-assistant">
      <div className="ai-chat">
        <div className="ai-chat-scroll" ref={scrollRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "ai-row user" : "ai-row ai"}
            >
              {m.role === "assistant" && (
                <div className="ai-avatar" aria-hidden>
                  🤖
                </div>
              )}
              <div className={`ai-bubble ${m.role}`}>{m.content}</div>
            </div>
          ))}

          {busy && (
            <div className="ai-row ai">
              <div className="ai-avatar" aria-hidden>
                🤖
              </div>
              <div className="ai-bubble ai typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && !busy && (
          <div className="ai-suggestions">
            <span className="ai-suggestions-label">Try asking:</span>
            <div className="ai-suggestion-chips">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="ai-chip"
                  onClick={() => send(s)}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="alert error-alert" style={{ margin: "0 12px 8px" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="ai-composer" onSubmit={onSubmit}>
          <textarea
            ref={textareaRef}
            placeholder="Ask a question… (Shift + Enter for a new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={busy}
          />
          <button
            type="submit"
            className="primary-btn ai-send"
            disabled={!input.trim() || busy}
          >
            {busy ? <span className="btn-spinner" /> : "Send"}
          </button>
        </form>
      </div>

      <div className="ai-foot">
        <span className="muted">
          AI can make mistakes. Double-check important answers.
        </span>
        <button className="ghost-btn" onClick={reset} disabled={busy}>
          New chat
        </button>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.payload?.title}
        message={confirmState.payload?.message}
        confirmLabel={confirmState.payload?.confirmLabel}
        danger={confirmState.payload?.danger}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}