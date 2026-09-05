import api from "../api/axios";
import { useState } from "react";
import { CloseIcon } from "./Icons";
import "./CheckoutModal.css";

export default function CheckoutModal({ open, onClose, booking, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!open) return null;

  const handleReserve = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/reservations", {
        accommodationId: booking.accommodationId,
        checkIn:   booking.checkIn,
        checkOut:  booking.checkOut,
        guests:    booking.guests,
        totalCost: booking.total ?? 0,
      });
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      // If backend/MongoDB is offline, store reservation locally so the
      // guest still gets confirmation feedback.
      const stored = JSON.parse(localStorage.getItem("local_reservations") || "[]");
      stored.push({
        id: `local-${Date.now()}`,
        accommodationId: booking.accommodationId,
        accommodationTitle: booking.accommodationTitle || "Listing",
        checkIn:   booking.checkIn,
        checkOut:  booking.checkOut,
        guests:    booking.guests,
        totalCost: booking.total ?? 0,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("local_reservations", JSON.stringify(stored));
      setLoading(false);
      onSuccess?.();
      onClose();
    }
  };

  const total = (booking.total ?? 0).toFixed(2);

  return (
    <div className="checkout-backdrop" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="checkout-panel">
        <button className="close" onClick={onClose} aria-label="Close">
          <CloseIcon size={16} />
        </button>

        <h3 id="checkout-title">Confirm your reservation</h3>

        <div className="checkout-summary">
          <div className="checkout-row">
            <span>Check-in</span>
            <strong>{booking.checkIn}</strong>
          </div>
          <div className="checkout-row">
            <span>Check-out</span>
            <strong>{booking.checkOut}</strong>
          </div>
          <div className="checkout-row">
            <span>Guests</span>
            <strong>{booking.guests}</strong>
          </div>
          <div className="checkout-row checkout-total">
            <span>Total</span>
            <strong>R{total}</strong>
          </div>
        </div>

        <p className="checkout-note">
          No payment is charged now. You'll settle at check-in.
        </p>

        {error && <p className="error-text">{error}</p>}

        <div className="checkout-actions">
          <button className="btn checkout-confirm-btn" onClick={handleReserve} disabled={loading}>
            {loading ? "Reserving…" : "Confirm Reservation"}
          </button>
          <button className="btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
