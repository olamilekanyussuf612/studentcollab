import { auth } from "../lib/firebase.js";
import Avatar from "./Avatar.jsx";
import Icon from "./Icon.jsx";

export default function AppHeader({ user }) {
  const name = user.displayName || user.email || "Student";

  return (
    <header className="app-header">
      <div className="app-header-left">
        <div className="app-logo">
          <Icon name="book" />
        </div>
        <span className="app-name">Student Collab</span>
      </div>

      <div className="app-header-right">
        <div className="user-chip">
          <Avatar name={name} seed={user.uid} size={32} />
          <span className="user-name">{name}</span>
        </div>
        <button
          className="logout-btn"
          onClick={() => auth.signOut()}
          title="Log out"
        >
          Logout
        </button>
      </div>
    </header>
  );
}