import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPanel.css";

export default function AuthPanel({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(username, email, password, role);
      setLoading(false);
      onClose?.();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel-backdrop">
      <div className="auth-panel">
        <button className="close" onClick={onClose} aria-label="Close">✕</button>
        <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {mode === "register" && (
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Guest</option>
                <option value="host">Host</option>
              </select>
            </label>
          )}
          {error && <p className="error-text">{error}</p>}
          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}</button>
            <button type="button" className="btn-link" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create account" : "Have an account? Log in"}</button>
          </div>
        </form>
        <div className="demo-creds">
          <strong>Demo accounts</strong>
          <ul>
            <li>Guest: guest@example.com / password123</li>
            <li>Host: host@example.com / hostpass123</li>
            <li>Admin: admin@example.com / adminpass123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
