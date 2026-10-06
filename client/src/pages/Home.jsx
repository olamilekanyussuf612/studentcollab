import { useState, useEffect } from "react";
import api from "../lib/api.js";
import { PostSkeleton } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Composer from "../components/Composer.jsx";
import PostCard from "../components/PostCard.jsx";
import Icon from "../components/Icon.jsx";

export default function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/api/posts")
      .then((data) => setPosts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // silent refresh — used after voting / answering so we don't flash skeletons
  const refresh = () => {
    api.get("/api/posts").then(setPosts).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="home">
      <div className="home-head">
        <h2>Class feed</h2>
        <p>Questions, notes, polls and updates from your classmates.</p>
      </div>

      <Composer user={user} onPosted={refresh} />

      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!loading && error && (
        <div className="alert error-alert">
          <Icon name="triangle-exclamation" />
          <span>Couldn't load the feed: {error}</span>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          emoji="hand-wave"
          title="Your feed is empty"
          message="Be the first to share something with your classmates."
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="posts">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} user={user} onChanged={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}