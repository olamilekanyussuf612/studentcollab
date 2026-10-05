import { useState, useEffect } from "react";
import api from "../lib/api.js";
import { timeAgo } from "../lib/format.js";
import Avatar from "../components/Avatar.jsx";

const TYPE_META = {
  message:  { label: "Message",  icon: "💬" },
  image:    { label: "Image",    icon: "🖼️" },
  poll:     { label: "Poll",     icon: "📊" },
  question: { label: "Question", icon: "❓" }
};

export default function Profile({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/posts")
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const mine = posts.filter((p) => p.authorId === user.uid);
  const totalUpvotes = mine.reduce((sum, p) => sum + (p.votes || 0), 0);
  const totalAnswers = mine.reduce(
    (sum, p) => sum + (p.answers?.length || 0),
    0
  );

  const name = user.displayName || "Unnamed";
  const email = user.email || "";
  const provider = user.providerData?.[0]?.providerId === "google.com"
    ? "Google"
    : "Email";

  return (
    <div className="profile">
      {/* HERO */}
      <div className="profile-hero">
        <Avatar name={name} seed={user.uid} size={88} />
        <div className="profile-hero-info">
          <h1>{name}</h1>
          <p className="muted">{email}</p>
          <div className="profile-badges">
            <span className="chip">🔐 Signed in with {provider}</span>
            {user.emailVerified && <span className="chip ok">✔ Verified</span>}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">
            {loading ? "…" : mine.length}
          </div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {loading ? "…" : totalUpvotes}
          </div>
          <div className="stat-label">Upvotes received</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {loading ? "…" : totalAnswers}
          </div>
          <div className="stat-label">Answers received</div>
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="profile-section">
        <h2>Recent activity</h2>

        {loading && <p className="muted">Loading…</p>}

        {!loading && mine.length === 0 && (
          <div className="profile-empty">
            <div className="empty-emoji">📭</div>
            <h3>No posts yet</h3>
            <p className="muted">
              Head over to Home and share your first post.
            </p>
          </div>
        )}

        {!loading && mine.length > 0 && (
          <ul className="activity-list">
            {mine.slice(0, 10).map((p) => {
              const meta = TYPE_META[p.type] || TYPE_META.message;
              const snippet =
                p.type === "question"
                  ? p.title
                  : p.type === "image"
                    ? p.text || "Image post"
                    : p.text;
              return (
                <li key={p.id} className="activity-item">
                  <span className="activity-icon" aria-hidden>
                    {meta.icon}
                  </span>
                  <div className="activity-meta">
                    <div className="activity-type">{meta.label}</div>
                    <div className="activity-snippet">
                      {snippet?.slice(0, 80) || "(no text)"}
                      {snippet?.length > 80 ? "…" : ""}
                    </div>
                  </div>
                  <div className="activity-time">{timeAgo(p.createdAt)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}