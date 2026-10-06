import { useState } from "react";
import api from "../lib/api.js";
import Icon from "./Icon.jsx";

const TABS = [
  { id: "message", label: "Message", icon: "comment" },
  { id: "image", label: "Image", icon: "image" },
  { id: "poll", label: "Poll", icon: "chart-simple" },
  { id: "question", label: "Question", icon: "circle-question" }
];

export default function Composer({ user, onPosted }) {
  const [type, setType] = useState("message");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewOk, setPreviewOk] = useState(null);
  const [options, setOptions] = useState(["", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setText(""); setTitle(""); setSubject("");
    setImageUrl(""); setPreviewOk(null);
    setOptions(["", ""]); setError("");
  };

  const switchType = (id) => {
    setType(id);
    setError("");
  };

  const canSubmit = () => {
    if (type === "message") return text.trim().length > 0;
    if (type === "image") return imageUrl.trim().length > 0;
    if (type === "poll") return text.trim().length > 0 && options.filter(o => o.trim()).length >= 2;
    if (type === "question") return title.trim().length > 0;
    return false;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit() || busy) return;
    setError("");
    setBusy(true);
    try {
      const author = user.displayName || user.email;
      const authorId = user.uid;

      if (type === "message") {
        await api.post("/api/posts", {
          type: "message", author, authorId, text: text.trim()
        });
      } else if (type === "image") {
        await api.post("/api/posts", {
          type: "image", author, authorId,
          imageUrl: imageUrl.trim(), text: text.trim()
        });
      } else if (type === "poll") {
        const clean = options.map(o => o.trim()).filter(Boolean);
        await api.post("/api/posts", {
          type: "poll", author, authorId,
          text: text.trim(), options: clean
        });
      } else if (type === "question") {
        await api.post("/api/posts", {
          type: "question", author, authorId,
          title: title.trim(), text: text.trim(), subject: subject.trim()
        });
      }

      reset();
      onPosted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const updateOption = (i, v) => {
    const copy = [...options];
    copy[i] = v;
    setOptions(copy);
  };

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={type === t.id ? "composer-tab active" : "composer-tab"}
            onClick={() => switchType(t.id)}
          >
            <Icon name={t.icon} className="tab-icon" />
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {type === "question" && (
        <div className="composer-row">
          <input
            className="composer-input"
            placeholder="Question title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
          />
          <input
            className="composer-input"
            placeholder="Subject (e.g. Mathematics)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      )}

      {type === "image" && (
        <div className="composer-row">
          <input
            className="composer-input"
            placeholder="Image URL (https://...)"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); setPreviewOk(null); }}
          />
          {imageUrl && (
            <div className="img-preview-wrap">
              <img
                src={imageUrl}
                alt="preview"
                className="img-preview"
                onLoad={() => setPreviewOk(true)}
                onError={() => setPreviewOk(false)}
              />
              {previewOk === false && (
                <p className="warn"><Icon name="triangle-exclamation" /> That URL didn't load as an image. You can still post it.</p>
              )}
            </div>
          )}
        </div>
      )}

      <textarea
        className="composer-textarea"
        placeholder={
          type === "message" ? "Share something with your classmates…" :
          type === "image" ? "Add a caption (optional)…" :
          type === "poll" ? "Ask your poll question…" :
          "Add more details (optional)…"
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />

      {type === "poll" && (
        <div className="poll-editor">
          {options.map((o, i) => (
            <div className="poll-editor-row" key={i}>
              <input
                className="composer-input"
                placeholder={`Option ${i + 1}`}
                value={o}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeOption(i)}
                  title="Remove"
                >
                  <Icon name="xmark" />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" className="ghost-btn" onClick={addOption}>
              + Add option
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="alert error-alert">
          <Icon name="triangle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      <div className="composer-footer">
        <span className="composer-hint">
          Posting as <b>{user.displayName || user.email}</b>
        </span>
        <button
          type="submit"
          className="primary-btn composer-submit"
          disabled={!canSubmit() || busy}
        >
          {busy ? (
            <>
              <span className="btn-spinner" /> Posting…
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </form>
  );
}