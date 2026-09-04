import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";
import AuthPanel from "./AuthPanel";

// Top Header: logo, navigation, user greeting + dropdown (logged in) / "Become a host" (logged out)
export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="container admin-header-inner">
        <Link to="/" className="logo">
          airbnb <span>admin</span>
        </Link>

        {user && (
          <nav className="admin-nav">
            <Link to="/listings">Listings</Link>
            {(user.role === "host" || user.role === "admin") && <Link to="/listings/new">Create listing</Link>}
          </nav>
        )}

        <div className="profile-section">
          {user ? (
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
                Hi, {user.username} ▾
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <Link to="/reservations" onClick={() => setMenuOpen(false)}>
                    View reservations
                  </Link>
                  <button onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-outline" onClick={() => setAuthOpen(true)}>
                Become a host
              </button>
              {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
