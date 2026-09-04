import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { MOCK_LISTINGS } from "../api/mockListings";
import "./Dashboard.css";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&q=70&auto=format&fit=crop";

// Monthly revenue grouping
function groupByMonth(reservations) {
  const map = {};
  reservations.forEach((r) => {
    const d = new Date(r.createdAt || r.checkIn);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + (r.totalCost || 0);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6); // last 6 months
}

export default function AdminDashboard() {
  const [listings, setListings]         = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("overview");
  const [deleteMsg, setDeleteMsg]       = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [lRes, rRes] = await Promise.allSettled([
          api.get("/accommodations"),
          api.get("/reservations/all"),
        ]);
        setListings(lRes.status === "fulfilled" ? lRes.value.data : MOCK_LISTINGS);
        setReservations(rRes.status === "fulfilled" ? rRes.value.data : []);
      } catch (_) {
        setListings(MOCK_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue  = reservations.reduce((s, r) => s + (r.totalCost || 0), 0);
  const avgRating     = listings.length
    ? (listings.reduce((s, l) => s + (l.rating || 0), 0) / listings.length).toFixed(2)
    : "—";
  const monthlyData   = groupByMonth(reservations);
  const maxRevenue    = Math.max(...monthlyData.map(([, v]) => v), 1);

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/accommodations/${id}`);
      setListings((p) => p.filter((l) => l._id !== id));
      setDeleteMsg("Listing deleted.");
    } catch { setDeleteMsg("Could not delete."); }
  };

  const handleDeleteReservation = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((p) => p.filter((r) => r._id !== id));
    } catch { /* offline */ }
  };

  const TABS = ["overview", "listings", "reservations", "revenue"];

  return (
    <main className="dashboard container section">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Admin Dashboard</h1>
          <p className="dash-sub">Full platform control</p>
        </div>
        <Link to="/admin/new" className="btn">+ New Listing</Link>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-number">{listings.length}</span>
          <span className="stat-label">Total Listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{reservations.length}</span>
          <span className="stat-label">Total Reservations</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">R{totalRevenue.toLocaleString()}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">⭐ {avgRating}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {TABS.map((t) => (
          <button key={t} className={`dash-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {deleteMsg && <p className="dash-msg">{deleteMsg}</p>}

      {loading ? <p>Loading…</p> : (
        <>
          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="overview-grid">
              <div className="overview-section">
                <h3>Recent Reservations</h3>
                {reservations.length === 0 ? <p>No reservations yet.</p> : (
                  <table className="dash-table">
                    <thead><tr><th>Listing</th><th>Guest</th><th>Dates</th><th>Total</th></tr></thead>
                    <tbody>
                      {reservations.slice(0, 5).map((r) => (
                        <tr key={r._id}>
                          <td>{r.accommodation?.title || "—"}</td>
                          <td>{r.user?.username || "—"}</td>
                          <td>{r.checkIn?.slice(0,10)} → {r.checkOut?.slice(0,10)}</td>
                          <td>R{r.totalCost?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="overview-section">
                <h3>Top Listings</h3>
                {listings.slice(0, 4).map((l) => (
                  <div className="overview-listing" key={l._id}>
                    <img src={l.images?.[0] || FALLBACK_IMG} alt={l.title} onError={(e)=>{e.currentTarget.src=FALLBACK_IMG;}}/>
                    <div>
                      <p className="overview-listing-title">{l.title}</p>
                      <p className="overview-listing-meta">{l.location} · R{Number(l.price).toLocaleString()}/night</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── All Listings ── */}
          {activeTab === "listings" && (
            <div className="dash-grid">
              {listings.map((l) => (
                <div className="dash-card" key={l._id}>
                  <img className="dash-card-img" src={l.images?.[0] || FALLBACK_IMG} alt={l.title} onError={(e)=>{e.currentTarget.src=FALLBACK_IMG;}}/>
                  <div className="dash-card-body">
                    <p className="dash-card-type">{l.type}</p>
                    <h3 className="dash-card-title">{l.title}</h3>
                    <p className="dash-card-meta">{l.location}</p>
                    <p className="dash-card-price"><strong>R{Number(l.price).toLocaleString()}</strong> / night</p>
                    <p className="dash-card-rating">⭐ {l.rating?.toFixed(2) || "New"} ({l.reviews || 0})</p>
                    <div className="dash-card-actions">
                      <Link to={`/admin/edit/${l._id}`} className="btn-outline btn-sm">Edit</Link>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteListing(l._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── All Reservations ── */}
          {activeTab === "reservations" && (
            <div className="dash-table-wrap">
              {reservations.length === 0 ? <p>No reservations.</p> : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Listing</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th></th></tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r._id}>
                        <td>{r.accommodation?.title || "—"}</td>
                        <td>{r.user?.username || "—"}{r.user?.email ? ` (${r.user.email})` : ""}</td>
                        <td>{r.checkIn?.slice(0,10)}</td>
                        <td>{r.checkOut?.slice(0,10)}</td>
                        <td>{r.guests}</td>
                        <td>R{r.totalCost?.toLocaleString()}</td>
                        <td><button className="btn-danger btn-sm" onClick={() => handleDeleteReservation(r._id)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Monthly Revenue Chart ── */}
          {activeTab === "revenue" && (
            <div className="revenue-section">
              <h3>Monthly Revenue (last 6 months)</h3>
              {monthlyData.length === 0 ? (
                <p>No revenue data yet.</p>
              ) : (
                <div className="bar-chart">
                  {monthlyData.map(([month, val]) => (
                    <div className="bar-col" key={month}>
                      <span className="bar-val">R{val.toLocaleString()}</span>
                      <div className="bar" style={{ height: `${(val / maxRevenue) * 180}px` }} />
                      <span className="bar-label">{month}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="revenue-summary">
                <p>Total Revenue: <strong>R{totalRevenue.toLocaleString()}</strong></p>
                <p>Average Rating: <strong>⭐ {avgRating}</strong></p>
                <p>Total Listings: <strong>{listings.length}</strong></p>
                <p>Total Reservations: <strong>{reservations.length}</strong></p>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
