import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import { initOneSignal } from "./lib/onesignal.js";
import HomePage from "./pages/HomePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AddPage from "./pages/AddPage.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        setAuthLoading(false);
        return;
      }
      // No session yet — sign in anonymously so RLS still has an auth.uid()
      // without asking the user to enter an email or phone number.
      const { data: anonData, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Anonymous sign-in failed:", error.message);
      }
      setSession(anonData?.session ?? null);
      setAuthLoading(false);
    }
    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (authLoading) return null;
  if (!session) {
    return (
      <div style={{ paddingTop: 80, textAlign: "center", color: "var(--red-suits)" }}>
        Couldn't start a session. Check that Anonymous sign-ins are enabled in
        Supabase (Authentication → Providers).
      </div>
    );
  }

  const userId = session.user.id;

  const onesignalInitRef = useRef(false);
  if (!onesignalInitRef.current) {
    onesignalInitRef.current = true;
    initOneSignal(userId);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage userId={userId} />} />
        <Route path="/add" element={<AddPage userId={userId} />} />
        <Route path="/settings" element={<SettingsPage userId={userId} />} />
      </Routes>
    </BrowserRouter>
  );
}
