import { useState } from "react";
import api from "../lib/api.js";
import { timeAgo } from "../lib/format.js";
import Avatar from "./Avatar.jsx";

const TYPE_META = {
  message:  { label: "Message",  icon: "💬", tone: "neutral" },
  image:    { label: "Image",    icon: "🖼️", tone: "neutral" },
  poll:     { label: "Poll",     icon: "📊", tone: "info" },
  question: { label: "Question", icon: "❓", tone: "warning" }
};

export default function PostCard({ post, user, onChanged }) {
  const meta = TYPE_META[post.type] || TYPE_META.message;
  const authorName = post.author || "Anonymous";

  /* ---------- votes (message / question) ---------- */
  const voted = (post.votersUp || []).includes(user.uid);
  const vote = async () => {
    try {
      await api.post(`/api/posts/${post.id}/vote`, { uid: user.uid, delta: 1 });
      onChanged?.();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------- answers (question) ---------- */
  const [showAnswers, setShowAnswers] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [answerBusy, setAnswerBusy] = useState(false);

  const submitAnswer = async () => {
    if (!answerText.trim() || answerBusy) return;
    setAnswerBusy(true);
    try {
      await api.post(`/api/posts/${post.id}/answer`, {
        body: answerText.trim(),
        author: user.displayName || user.email,
        authorId: user.uid
      });
      setAnswerText("");
      onChanged?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setAnswerBusy(false);
    }
  };

  /* ---------- poll ---------- */
  const pollTotal = (post.options || []).reduce((s, o) => s + (o.votes || 0), 0);
  const hasVoted = (post.voters || []).includes(user.uid);
  const [pollBusy, setPollBusy] = useState(false);

  const votePoll = async (idx) => {
    if (hasVoted || pollBusy) return;
    setPollBusy(true);
    try {
      await api.post(`/api/posts/${post.id}/poll-vote`, {
        uid: user.uid,
        optionIndex: idx
      });
      onChanged?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setPollBusy(false);
    }
  };

  return (
    <article className={`post-card type-${post.type}`}>
      {/* HEAD */}
      <header className="post-head">
        <Avatar name={authorName} seed={post.authorId || authorName} size={40} />
        <div className="post-head-meta">
          <div className="post-author">
            <span className="post-author-name">{authorName}</span>
            <span className={`type-badge tone-${meta.tone}`}>
              <span aria-hidden>{meta.icon}</span> {meta.label}
            </span>
          </div>
          <div className="post-sub">
            <span>{timeAgo(post.createdAt)}</span>
            {post.type === "question" && post.subject && (
              <>
                <span className="dot">·</span>
                <span className="subject-tag">{post.subject}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="post-body">
        {post.type === "question" && post.title && (
          <h3 className="post-title">{post.title}</h3>
        )}

        {post.type === "image" && post.imageUrl && (
          <div className="post-image">
            <img
              src={post.imageUrl}
              alt=""
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        )}

        {post.text && <p className="post-text">{post.text}</p>}
      </div>

      {/* POLL */}
      {post.type === "poll" && (
        <div className="poll">
          {(post.options || []).map((o, i) => {
            const pct = pollTotal ? Math.round((o.votes / pollTotal) * 100) : 0;
            return (
              <button
                key={i}
                type="button"
                className={`poll-option${hasVoted ? " voted" : ""}`}
                disabled={hasVoted || pollBusy}
                onClick={() => votePoll(i)}
              >
                <span className="poll-fill" style={{ width: `${pct}%` }} />
                <span className="poll-label">
                  <span className="poll-text">{o.text}</span>
                  <span className="poll-pct">
                    {hasVoted ? `${pct}% · ${o.votes}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="poll-foot">
            {pollTotal} vote{pollTotal !== 1 ? "s" : ""}
            {hasVoted && <span> · You voted</span>}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      {(post.type === "message" || post.type === "question") && (
        <div className="post-actions">
          <button
            type="button"
            className={`action-btn${voted ? " voted" : ""}`}
            onClick={vote}
          >
            <span aria-hidden>▲</span>
            <span>{post.votes || 0}</span>
            <span className="action-label">{voted ? "Voted" : "Upvote"}</span>
          </button>

          {post.type === "question" && (
            <button
              type="button"
              className="action-btn"
              onClick={() => setShowAnswers((s) => !s)}
            >
              <span aria-hidden>💬</span>
              <span>{post.answers?.length || 0}</span>
              <span className="action-label">
                {showAnswers ? "Hide answers" : "Answers"}
              </span>
            </button>
          )}
        </div>
      )}

      {/* ANSWERS */}
      {post.type === "question" && showAnswers && (
        <div className="answers">
          {(post.answers || []).length === 0 && (
            <p className="muted">No answers yet. Be the first to help.</p>
          )}
          {(post.answers || []).map((a) => (
            <div className="answer" key={a.id}>
              <div className="answer-head">
                <Avatar name={a.author} seed={a.authorId || a.author} size={28} />
                <div>
                  <div className="answer-author">{a.author}</div>
                  <div className="answer-time">{timeAgo(a.createdAt)}</div>
                </div>
              </div>
              <p className="answer-body">{a.body}</p>
            </div>
          ))}

          <div className="answer-compose">
            <textarea
              placeholder="Write an answer…"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={2}
            />
            <button
              type="button"
              className="primary-btn answer-submit"
              onClick={submitAnswer}
              disabled={!answerText.trim() || answerBusy}
            >
              {answerBusy ? (
                <>
                  <span className="btn-spinner" /> Posting…
                </>
              ) : (
                "Post answer"
              )}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}