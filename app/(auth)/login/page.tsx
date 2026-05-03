"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@rupeevalcore.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };

    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Unable to log in.");
      return;
    }

    window.location.assign("/today");
  }

  return (
    <main className="auth-shell">
      <form onSubmit={onSubmit} className="card card-panel auth-card">
        <div>
          <div className="eyebrow">RupeeValcore</div>
          <h1 className="page-title">CRM Sign In</h1>
          <p className="page-subtitle">Sign in to open today's execution board.</p>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        <label className="field">
          <span className="field-label">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="input-field"
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="input-field"
            required
          />
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
