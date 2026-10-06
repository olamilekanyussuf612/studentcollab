import { useState } from "react";
import { auth, googleProvider } from "../lib/firebase.js";
import BrandPanel from "./BrandPanel.jsx";
import Icon from "./Icon.jsx";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name");
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name.trim() });
        await cred.user.reload();
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    setError("");
    setBusy(true);
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="auth-shell">
      <BrandPanel />

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-head">
            <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p>
              {isSignup
                ? "Join your classmates on Student Collab"
                : "Log in to continue to your feed"}
            </p>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={googleSignIn}
            disabled={busy}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              width="18"
              height="18"
            />
            Continue with Google
          </button>

          <div className="divider"><span>or {isSignup ? "sign up" : "log in"} with email</span></div>

          <form onSubmit={submit} className="auth-form">
            {isSignup && (
              <label className="field">
                <span className="field-label">Full name</span>
                <input
                  type="text"
                  placeholder="e.g. Olamilekan Yussuf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
            )}

            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                type="password"
                placeholder={isSignup ? "At least 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>

            {error && (
              <div className="alert error-alert">
                <Icon name="triangle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="primary-btn" disabled={busy}>
              {busy ? (
                <>
                  <span className="btn-spinner" /> Please wait…
                </>
              ) : (
                isSignup ? "Create account" : "Log in"
              )}
            </button>
          </form>

          <p className="switch-mode">
            {isSignup ? "Already have an account?" : "New to Student Collab?"}{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setError("");
                setMode(isSignup ? "login" : "signup");
              }}
            >
              {isSignup ? "Log in" : "Create one"}
            </a>
          </p>
        </div>

        <p className="auth-foot">
          By continuing you agree to our <a href="#">Terms</a> and{" "}
          <a href="#">Privacy Policy</a>.
        </p>
      </main>
    </div>
  );
}