import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

// Login Page: form with email/password, validation, error messages,
// redirects to dashboard (listings) on success.
export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "register" && !username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>{mode === "login" ? "Admin log in" : "Become a host"}</h1>

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

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <p className="switch-mode">
          {mode === "login" ? (
            <>
              Not a host yet?{" "}
              <button type="button" onClick={() => setMode("register")}>
                Become a host
              </button>
            </>
          ) : (
            <>
              Already a host?{" "}
              <button type="button" onClick={() => setMode("login")}>
                Log in
              </button>
            </>
          )}
        </p>
      </form>
      <aside className="marker-credentials">
        <h3>Demo accounts (use for your marker)</h3>
        <ul>
          <li>Guest: guest@example.com / password123</li>
          <li>Host: host@example.com / hostpass123</li>
          <li>Admin: admin@example.com / adminpass123</li>
        </ul>
      </aside>
    </main>
  );
}
