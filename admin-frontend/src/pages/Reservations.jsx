import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Reservations.css";

// Profile dropdown -> "View reservations": all reservations made on this host's listings
export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await api.get("/reservations/host");
        setReservations(data);
      } catch (err) {
        setError("Could not load reservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  if (loading) return <p className="container section">Loading...</p>;

  return (
    <main className="container section">
      <h1 className="section-title">Reservations on your listings</h1>
      {error && <p className="error-text">{error}</p>}
      {!error && reservations.length === 0 && <p>No reservations yet.</p>}

      {reservations.length > 0 && (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Guest</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id}>
                <td>{r.accommodation?.title || "Listing removed"}</td>
                <td>{r.user?.username} ({r.user?.email})</td>
                <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                <td>{r.guests}</td>
                <td>R{r.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
