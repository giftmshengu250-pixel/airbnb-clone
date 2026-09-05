import api from "../api/axios";
import { useState } from "react";
import { CloseIcon } from "./Icons";
import "./CheckoutModal.css";

function isRealMongoObjectId(value) {
  return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value.trim());
}

export default function CheckoutModal({ open, onClose, booking, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!open) return null;

  const handleReserve = async () => {
    setError("");

    if (!isRealMongoObjectId(booking?.accommodationId)) {
      setError("This listing is currently unavailable for booking.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/reservations", {
        accommodationId: booking.accommodationId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalCost: booking.total ?? 0,
      });

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Reservation could not be created. Please try again.");
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
