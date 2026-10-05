import { useState, useEffect } from "react";
import { auth } from "./lib/firebase.js";
import AuthScreen from "./components/AuthScreen.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import AppHeader from "./components/AppHeader.jsx";
import AppNav from "./components/AppNav.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Tools from "./pages/Tools.jsx";
import ToolView from "./pages/ToolView.jsx";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return { user, loading };
}

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("home");
  const [activeTool, setActiveTool] = useState(null);

  if (loading) return <LoadingScreen message="Signing you in…" />;
  if (!user) return <AuthScreen />;

  const openTool = (id) => {
    setActiveTool(id);
    setView("tool");
  };

  const goBackToTools = () => {
    setActiveTool(null);
    setView("tools");
  };

  const handleNav = (v) => {
    setActiveTool(null);
    setView(v);
  };

  const navView = view === "tool" ? "tools" : view;

  return (
    <div className="app-shell">
      <AppHeader user={user} />
      <AppNav view={navView} onNavigate={handleNav} />

      <main className="app-main">
        {view === "home" && <Home user={user} />}
        {view === "tools" && <Tools onOpen={openTool} />}
        {view === "tool" && activeTool && (
          <ToolView tool={activeTool} onBack={goBackToTools} />
        )}
        {view === "profile" && <Profile user={user} />}
      </main>
    </div>
  );
}