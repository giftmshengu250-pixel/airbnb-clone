import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import "./Header.css";
import AuthPanel from "./AuthPanel";
import { SunIcon, MoonIcon, SearchIcon, FilterIcon, MapIcon, ListIcon } from "./Icons";

const guestTabs = [
  { label: "All", href: "/" },
  { label: "Stays", href: "/locations" },
  { label: "Saved", href: "/saved" },
  { label: "Map", href: "/locations" },
];

const hostTabs = [
  { label: "Dashboard", href: "/host" },
  { label: "Listings", href: "/host" },
  { label: "Reservations", href: "/host" },
  { label: "Create", href: "/host/new" },
];

const adminTabs = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin" },
  { label: "Listings", href: "/admin" },
  { label: "Reservations", href: "/admin" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [cities, setCities] = useState({});
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const role = user?.role || "user";
  const roleTabs = role === "host" ? hostTabs : role === "admin" ? adminTabs : guestTabs;

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
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
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
        <Link to={role === "admin" ? "/admin" : role === "host" ? "/host" : "/"} className="logo" aria-label="Airbnb home">
          <svg viewBox="0 0 32 32" className="logo-icon" aria-hidden="true">
            <path
              fill="var(--pink)"
              d="M16 1C10.477 1 6 7.373 6 12.5c0 3.521 1.59 6.227 3.514 8.37C11.697 23.29 14.5 25.5 16 27c1.5-1.5 4.303-3.71 6.486-6.13C24.41 18.727 26 16.021 26 12.5 26 7.373 21.523 1 16 1zm0 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
            />
          </svg>
          <span>airbnb</span>
        </Link>

        <nav className="header-tabs" aria-label="Browse categories">
          {roleTabs.map((tab) => (
            <Link key={tab.label} to={tab.href} className="tab-btn">
              <span className="tab-icon" aria-hidden="true">
                {tab.label === "All" && <ListIcon size={18} />}
                {tab.label === "Stays" && <MapIcon size={18} />}
                {tab.label === "Saved" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.35-9.5-8.2C.9 10.3 2.34 5 7.4 5c2.08 0 3.26 1.12 4.6 2.53C13.34 6.12 14.52 5 16.6 5c5.06 0 6.5 5.3 4.9 7.8C19 16.65 12 21 12 21z"/></svg>}
                {tab.label === "Map" && <MapIcon size={18} />}
                {tab.label === "Dashboard" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-10h8V3h-8v8z"/></svg>}
                {tab.label === "Listings" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>}
                {tab.label === "Reservations" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>}
                {tab.label === "Create" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
                {tab.label === "Overview" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12h7V4H4v8zm9 8h7v-8h-7v8zM4 20h7v-6H4v6zm9-10h7V4h-7v6z"/></svg>}
                {tab.label === "Users" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="7" r="3.5"/><path d="M20 19v-1a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              </span>
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="header-auth">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          {user ? (
            <div className="profile-menu" ref={menuRef}>
              <button className="profile-btn" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
                <span className="profile-avatar" aria-hidden="true">{user.username?.[0]?.toUpperCase() ?? "U"}</span>
                {user.username}
              </button>
              {menuOpen && (
                <div className="dropdown" role="menu">
                  {role === "host" && <Link to="/host" onClick={() => setMenuOpen(false)}>Host dashboard</Link>}
                  {role === "admin" && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin dashboard</Link>}
                  <Link to="/reservations" role="menuitem" onClick={() => setMenuOpen(false)}>My reservations</Link>
                  <Link to="/saved" role="menuitem" onClick={() => setMenuOpen(false)}>Saved homes</Link>
                  <button type="button" role="menuitem" onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-outline" onClick={() => setAuthOpen(true)}>Log in</button>
          )}
          {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
        </div>
      </div>

      <div className="header-search-wrap">
        <form className="search-bar" onSubmit={handleSearch} role="search" aria-label="Search accommodations">
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

          <div className="search-field">
            <span className="search-label">When</span>
            <span className="search-sublabel">CHECK-IN</span>
            <input type="date" className="search-input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} aria-label="Check-in date" />
          </div>

          <div className="search-divider" aria-hidden="true" />

          <div className="search-field">
            <span className="search-label">&nbsp;</span>
            <span className="search-sublabel">CHECK-OUT</span>
            <input type="date" className="search-input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} aria-label="Check-out date" />
          </div>

          <div className="search-divider" aria-hidden="true" />

          <div className="search-field search-field--who">
            <span className="search-label">Who</span>
            <select className="search-input search-select" value={guests} onChange={(e) => setGuests(Number(e.target.value))} aria-label="Number of guests">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="search-btn" aria-label="Search">
            <SearchIcon size={18} stroke="#fff" strokeWidth={2.5} />
          </button>
        </form>

        <button className="filter-btn" aria-label="Filters" type="button">
          <FilterIcon size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
