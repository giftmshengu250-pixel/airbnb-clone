import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Header.css";
import AuthPanel from "./AuthPanel";

const TABS = ["All", "Homes", "Experiences", "Services"];

export default function Header() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [location, setLocation]   = useState("");
  const [checkIn, setCheckIn]     = useState("");
  const [checkOut, setCheckOut]   = useState("");
  const [guests, setGuests]       = useState(2);
  const [cities, setCities]       = useState({});
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    api.get("/tapline/cities")
      .then(({ data }) => setCities(data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn)  params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests)   params.set("guests", String(guests));
    navigate(`/locations?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const allCities = Object.values(cities).flat();

  return (
    <header className="header">
      <div className="header-top container">
        {/* ── Logo ── */}
        <Link to="/" className="logo" aria-label="Airbnb home">
          {/* Pink looped knot SVG (simplified Airbnb bélo) */}
          <svg viewBox="0 0 32 32" className="logo-icon" aria-hidden="true">
            <path
              fill="var(--pink)"
              d="M16 1C10.477 1 6 7.373 6 12.5c0 3.521 1.59 6.227 3.514 8.37C11.697 23.29 14.5 25.5 16 27c1.5-1.5 4.303-3.71 6.486-6.13C24.41 18.727 26 16.021 26 12.5 26 7.373 21.523 1 16 1zm0 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
            />
          </svg>
          <span>airbnb</span>
        </Link>

        {/* ── Category tabs ── */}
        <nav className="header-tabs" aria-label="Browse categories">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? " tab-btn--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon" aria-hidden="true">
                {tab === "All"         && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/></svg>
                )}
                {tab === "Homes"       && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
                )}
                {tab === "Experiences" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
                )}
                {tab === "Services"    && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                )}
              </span>
              {tab}
            </button>
          ))}
        </nav>

        {/* ── Profile / auth ── */}
        <div className="header-auth">
          {user ? (
            <div className="profile-menu" ref={menuRef}>
              <button className="profile-btn" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
                <span className="profile-avatar" aria-hidden="true">
                  {user.username?.[0]?.toUpperCase() ?? "U"}
                </span>
                {user.username}
              </button>
              {menuOpen && (
                <div className="dropdown" role="menu">
                  <Link to="/reservations" role="menuitem" onClick={() => setMenuOpen(false)}>My reservations</Link>
                  <button role="menuitem" onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-outline" onClick={() => setAuthOpen(true)}>Log in</button>
          )}
          {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="header-search-wrap">
        <form className="search-bar" onSubmit={handleSearch} role="search" aria-label="Search accommodations">
          {/* Where */}
          <div className="search-field search-field--where">
            <span className="search-label">Where</span>
            <input
              list="cities-list"
              className="search-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Johannesburg"
              aria-label="Location"
            />
            <datalist id="cities-list">
              {allCities.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="search-divider" aria-hidden="true" />

          {/* Check-in */}
          <div className="search-field">
            <span className="search-label">When</span>
            <span className="search-sublabel">CHECK-IN</span>
            <input
              type="date"
              className="search-input"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              aria-label="Check-in date"
            />
          </div>

          <div className="search-divider" aria-hidden="true" />

          {/* Check-out */}
          <div className="search-field">
            <span className="search-label">&nbsp;</span>
            <span className="search-sublabel">CHECK-OUT</span>
            <input
              type="date"
              className="search-input"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              aria-label="Check-out date"
            />
          </div>

          <div className="search-divider" aria-hidden="true" />

          {/* Who */}
          <div className="search-field search-field--who">
            <span className="search-label">Who</span>
            <select
              className="search-input search-select"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <button type="submit" className="search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {/* Filter icon */}
        <button className="filter-btn" aria-label="Filters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8"  cy="6"  r="2" fill="#fff" />
            <circle cx="16" cy="12" r="2" fill="#fff" />
            <circle cx="8"  cy="18" r="2" fill="#fff" />
          </svg>
        </button>
      </div>
    </header>
  );
}
