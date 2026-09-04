import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Reservations.css";

// Profile dropdown -> "My reservations": shown in a table format (per brief)
export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchReservations = async () => {
      try {
        const { data } = await api.get("/reservations/user");
        setReservations(data);
      } catch (err) {
        setError("Could not load your reservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [user, navigate]);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert("Could not cancel reservation.");
    }
  };

  if (loading) return <p className="container section">Loading...</p>;

  return (
    <main className="container section">
      <h1 className="section-title">My reservations</h1>
      {error && <p className="error-text">{error}</p>}

      {!error && reservations.length === 0 && <p>You have no reservations yet.</p>}

      {reservations.length > 0 && (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Location</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id}>
                <td>{r.accommodation?.title || "Listing removed"}</td>
                <td>{r.accommodation?.location || "-"}</td>
                <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                <td>{r.guests}</td>
                <td>R{r.totalCost.toFixed(2)}</td>
                <td>
                  <button className="btn-outline" onClick={() => handleCancel(r._id)}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
