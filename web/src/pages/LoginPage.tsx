import { api } from '@/lib/api';
import { setSession } from '@/lib/auth';
import { FormEvent, useState } from 'react';

function GglLogo() {
  return (
    <svg className="login-logo" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M22 2L38 11V33L22 42L6 33V11L22 2Z" fill="#7B1E1E" />
      <path d="M22 10L30 15V29L22 34L14 29V15L22 10Z" fill="white" fillOpacity="0.92" />
      <text
        x="22"
        y="26"
        textAnchor="middle"
        fill="#7B1E1E"
        fontSize="10"
        fontWeight="700"
        fontFamily="DM Sans, sans-serif"
      >
        GGL
      </text>
    </svg>
  );
}

export default function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('admin@ggl.com');
  const [password, setPassword] = useState('Ggl@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setSession(res.token, res.user);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__glow" aria-hidden />

      <a href="#" className="login-page__back" onClick={(e) => e.preventDefault()}>
        ← Back to Sustainability Hub Portal
      </a>

      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <GglLogo />
            <div className="login-titles">
              <span className="login-name">GGL DASHBOARD</span>
              <span className="login-sub">Downstream — Sustainability</span>
            </div>
          </div>
          <span className="login-tagline">Sustainable Supply. Responsible Refining.</span>

          <hr className="login-divider" />

          <h1 className="login-headline">Sign in</h1>
          <p className="login-hint">Use your authorized account to access the GGL Dashboard.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
