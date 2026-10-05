import { useState, useEffect, useRef } from "react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import useConfirm from "../hooks/useConfirm.js";

const STORAGE_KEY = "sc_notepad";

export default function Notepad() {
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [saved, setSaved] = useState(true);
  const [cleared, setCleared] = useState(false);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  const { confirmState, askConfirm, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text);
      setSaved(true);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [text]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const clearAll = async () => {
    if (!text) return;
    const ok = await askConfirm({
      title: "Clear the notepad?",
      message: "This can't be undone.",
      confirmLabel: "Clear",
      danger: true
    });
    if (!ok) return;

    setText("");
    localStorage.removeItem(STORAGE_KEY);
    setCleared(true);
    setTimeout(() => setCleared(false), 1500);
    textareaRef.current?.focus();
  };

  const downloadPdf = () => {
    if (!text.trim()) return;

    const title = "Notepad";
    const date = new Date().toLocaleString();

    const escapeHtml = (s) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} — ${date}</title>
  <style>
    @page { margin: 20mm; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #111;
      line-height: 1.6;
      font-size: 12pt;
    }
    header {
      border-bottom: 1px solid #ccc;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    h1 { margin: 0 0 4px; font-size: 18pt; }
    .meta { color: #555; font-size: 10pt; }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: 12pt;
      margin: 0;
    }
    footer {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 9pt;
      color: #888;
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <div class="meta">Saved ${escapeHtml(date)}</div>
  </header>
  <pre>${escapeHtml(text)}</pre>
  <footer>From Student Collab · Notepad</footer>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 200);
    };
  <\/script>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 60000);
  };

  return (
    <div className="notepad">
      <div className="notepad-toolbar">
        <div className="notepad-status">
          {saved ? (
            <span className="save-indicator ok">
              <span className="dot" /> Saved
            </span>
          ) : (
            <span className="save-indicator pending">
              <span className="dot" /> Saving…
            </span>
          )}
          {cleared && <span className="save-indicator ok">Cleared</span>}
        </div>

        <div className="notepad-actions">
          <span className="counter">
            {wordCount} word{wordCount !== 1 ? "s" : ""} · {charCount} char
            {charCount !== 1 ? "s" : ""}
          </span>
          <button
            className="ghost-btn"
            onClick={downloadPdf}
            disabled={!text.trim()}
            title="Save as PDF"
          >
            ⬇ Download PDF
          </button>
          <button className="ghost-btn" onClick={clearAll} disabled={!text}>
            Clear
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="notepad-area"
        placeholder="Jot down anything you don't want to forget — formulas, homework, ideas…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={true}
      />

      <p className="notepad-foot muted">
        Saved only on this device. Clearing your browser data will erase it.
        Use <b>Download PDF</b> to keep a permanent copy.
      </p>

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