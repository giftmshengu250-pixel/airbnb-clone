import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRoleDestination = (nextRole) => {
    if (nextRole === "admin") return "/admin";
    if (nextRole === "host") return "/host";
    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (mode === "register" && !username)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      let user;
      if (mode === "login") {
        user = await login(email, password);
      } else {
        user = await register(username, email, password, role);
      }

      navigate(getRoleDestination(user?.role || role));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-badge">A place to stay</span>
          <h1 className="login-title">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === "register" && (
            <div className="login-field">
              <label className="login-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "register" && (
            <div className="login-field">
              <label className="login-label" htmlFor="role">I am a…</label>
              <select
                id="role"
                className="login-input login-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Guest</option>
                <option value="host">Host</option>
              </select>
            </div>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="login-demo">
          Demo accounts:&nbsp;
          <strong>guest@example.com</strong> / password123 (guest)&nbsp;·&nbsp;
          <strong>host@example.com</strong> / hostpass123 (host)&nbsp;·&nbsp;
          <strong>admin@example.com</strong> / adminpass123 (admin)
        </div>

        <p className="login-switch">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button type="button" className="login-switch-btn" onClick={() => { setMode("register"); setError(""); }}>
                Sign up for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="login-switch-btn" onClick={() => { setMode("login"); setError(""); }}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
