import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MOCK_LISTINGS } from "../api/mockListings";
import "./Dashboard.css";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&q=70&auto=format&fit=crop";

export default function HostDashboard() {
  const { user } = useAuth();
  const [listings, setListings]       = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("listings");
  const [deleteMsg, setDeleteMsg]     = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [lRes, rRes] = await Promise.allSettled([
          api.get("/accommodations"),
          api.get("/reservations/host"),
        ]);
        setListings(lRes.status === "fulfilled" ? lRes.value.data : MOCK_LISTINGS.slice(0, 4));
        setReservations(rRes.status === "fulfilled" ? rRes.value.data : []);
      } catch (_) {
        setListings(MOCK_LISTINGS.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/accommodations/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      setDeleteMsg("Listing deleted.");
    } catch {
      setDeleteMsg("Could not delete listing.");
    }
  };

  return (
    <main className="dashboard container section">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Host Dashboard</h1>
          <p className="dash-sub">Welcome back, <strong>{user?.username}</strong></p>
        </div>
        <Link to="/host/new" className="btn">+ New Listing</Link>
      </div>

      {/* Stats bar */}
      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-number">{listings.length}</span>
          <span className="stat-label">Listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{reservations.length}</span>
          <span className="stat-label">Bookings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            R{reservations.reduce((s, r) => s + (r.totalCost || 0), 0).toLocaleString()}
          </span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {["listings", "bookings"].map((t) => (
          <button key={t} className={`dash-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "listings" ? "My Listings" : "Bookings"}
          </button>
        ))}
      </div>

      {deleteMsg && <p className="dash-msg">{deleteMsg}</p>}

      {loading ? <p>Loading…</p> : (
        <>
          {activeTab === "listings" && (
            <div className="dash-grid">
              {listings.length === 0 && <p>No listings yet. <Link to="/host/new">Create one →</Link></p>}
              {listings.map((l) => (
                <div className="dash-card" key={l._id}>
                  <img
                    className="dash-card-img"
                    src={l.images?.[0] || FALLBACK_IMG}
                    alt={l.title}
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                  <div className="dash-card-body">
                    <p className="dash-card-type">{l.type}</p>
                    <h3 className="dash-card-title">{l.title}</h3>
                    <p className="dash-card-meta">{l.location}</p>
                    <p className="dash-card-price"><strong>R{Number(l.price).toLocaleString()}</strong> / night</p>
                    <div className="dash-card-actions">
                      <Link to={`/host/edit/${l._id}`} className="btn-outline btn-sm">Edit</Link>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(l._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="dash-table-wrap">
              {reservations.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Listing</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r._id}>
                        <td>{r.accommodation?.title || "—"}</td>
                        <td>{r.user?.username || "—"}</td>
                        <td>{r.checkIn?.slice(0, 10)}</td>
                        <td>{r.checkOut?.slice(0, 10)}</td>
                        <td>{r.guests}</td>
                        <td>R{r.totalCost?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
