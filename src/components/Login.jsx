import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email first");
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithOtp({ email });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ paddingTop: 80, textAlign: "center" }}>
        <div className="greeting" style={{ justifyContent: "center" }}>
          Check your email
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          We sent a login link to {email}. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ paddingTop: 80 }}>
      <div className="greeting" style={{ justifyContent: "center" }}>
        Pocket Home
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", marginBottom: 20 }}>
        Enter your email to sign in
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "0.5px solid var(--surface)",
          background: "var(--surface)",
          color: "var(--text)",
          marginBottom: 12,
          fontSize: 14,
        }}
      />
      {error && (
        <p style={{ color: "var(--red-suits)", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}
      <button className="primary" type="submit">
        Send login link
      </button>
    </form>
  );
}
