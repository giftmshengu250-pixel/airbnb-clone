import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { MOCK_LISTINGS } from "../api/mockListings";
import { useAuth } from "../context/AuthContext";
import "./LocationDetails.css";
import CheckoutModal from "../components/CheckoutModal";

// Helper: number of nights between two date strings
function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

export default function LocationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveMessage, setReserveMessage] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchAccommodation = async () => {
      setLoading(true);

      // ── 1. Local MongoDB ────────────────────────────────────────────────────
      try {
        const { data } = await api.get(`/accommodations/${id}`);
        setAccommodation(data);
        setLoading(false);
        return;
      } catch (_) { /* fall through */ }

      // ── 2. Tapline proxy ────────────────────────────────────────────────────
      try {
        const { data: t } = await api.get(`/tapline/listings/${id}`);
        setAccommodation({
          _id: t.id || t._id,
          title: t.title || t.name,
          location: t.location,
          description: t.description || t.summary || "",
          type: t.type || "Private room",
          bedrooms: t.bedrooms || 1,
          bathrooms: t.bathrooms || 1,
          guests: t.guests || 1,
          price: t.price || 0,
          amenities: t.amenities || [],
          images: t.images || t.photos || [],
          cleaningFee: t.cleaningFee || 0,
          serviceFee: t.serviceFee || 0,
          occupancyTaxes: t.occupancyTaxes || 0,
          rating: t.rating || 4.5,
          reviews: t.reviews || 0,
          weeklyDiscount: t.weeklyDiscount || 0,
          host: t.host || null,
        });
        setLoading(false);
        return;
      } catch (_) { /* fall through */ }

      // ── 3. Mock data fallback ───────────────────────────────────────────────
      const mock = MOCK_LISTINGS.find((l) => l._id === id);
      if (mock) {
        setAccommodation(mock);
      } else {
        setError("Could not load this listing.");
      }
      setLoading(false);
    };
    fetchAccommodation();
  }, [id]);

  if (loading) return <p className="container section">Loading...</p>;
  if (error || !accommodation) return <p className="container section error-text">{error || "Listing not found."}</p>;

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * accommodation.price;
  const discount = nights >= 7 ? (subtotal * (accommodation.weeklyDiscount || 0)) / 100 : 0;
  const total = subtotal - discount + accommodation.cleaningFee + accommodation.serviceFee + accommodation.occupancyTaxes;

  const images = accommodation.images?.length
    ? accommodation.images
    : Array(5).fill("https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=80&auto=format&fit=crop");

  const handleReserve = (e) => {
    e && e.preventDefault();
    setReserveMessage("");

    if (!user) {
      navigate("/login");
      return;
    }
    if (nights <= 0) {
      setReserveMessage("Please choose valid check-in and check-out dates.");
      return;
    }

    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setReserveMessage("Reservation created! Check 'My reservations' to view it.");
  };

  return (
    <main className="container section">
      {/* Heading and Subheading */}
      <h1 className="details-heading">
        {accommodation.type} in {accommodation.location}
      </h1>
      <p className="details-subheading">
        ⭐ {accommodation.rating?.toFixed(1) || "New"} ({accommodation.reviews || 0} reviews) · {accommodation.location}
      </p>

      {/* Image Gallery */}
      <div className="gallery">
        <img className="gallery-main" src={images[0]} alt={accommodation.title} />
        <div className="gallery-grid">
          {images.slice(1, 5).map((img, i) => (
            <img key={i} src={img} alt={`${accommodation.title} ${i + 2}`} />
          ))}
        </div>
      </div>

      <div className="details-columns">
        {/* Left: static information sections */}
        <div className="details-left">
          <section>
            <h2>{accommodation.title}</h2>
            <p>{accommodation.description}</p>
            <p>
              {accommodation.guests} guests · {accommodation.bedrooms} bedrooms · {accommodation.bathrooms} bathrooms
            </p>
          </section>

          <section>
            <h3>Where you'll sleep</h3>
            <p>{accommodation.bedrooms} bedroom(s), comfortable beds for up to {accommodation.guests} guests.</p>
          </section>

          <section>
            <h3>What this place offers</h3>
            <ul className="amenities-list">
              {(accommodation.amenities?.length ? accommodation.amenities : ["Wifi", "Kitchen"]).map((a) => (
                <li key={a}>✓ {a}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Host details</h3>
            <p>Hosted by a verified Airbnb host.</p>
          </section>

          <section>
            <h3>House Rules, Health &amp; Safety, Cancellation Policy</h3>
            <p>Standard house rules apply. Free cancellation up to 48 hours before check-in.</p>
          </section>
        </div>

        {/* Right: cost calculator */}
        <aside className="cost-calculator">
          <p className="cost-price">
            <strong>R{accommodation.price}</strong> / night
          </p>

          <form onSubmit={handleReserve}>
            <div className="date-row">
              <label>
                Check-in
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
              </label>
              <label>
                Check-out
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
              </label>
            </div>
            <label className="guests-label">
              Guests
              <input
                type="number"
                min="1"
                max={accommodation.guests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </label>

            {nights > 0 && (
              <div className="cost-breakdown">
                <div className="cost-line">
                  <span>R{accommodation.price} x {nights} nights</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="cost-line">
                    <span>Weekly discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="cost-line">
                  <span>Cleaning fee</span>
                  <span>R{accommodation.cleaningFee}</span>
                </div>
                <div className="cost-line">
                  <span>Service fee</span>
                  <span>R{accommodation.serviceFee}</span>
                </div>
                <div className="cost-line">
                  <span>Occupancy taxes and fees</span>
                  <span>R{accommodation.occupancyTaxes}</span>
                </div>
                <div className="cost-line cost-total">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn cost-reserve-btn">
              Reserve
            </button>
            {reserveMessage && <p className="reserve-message">{reserveMessage}</p>}
          </form>
          <CheckoutModal
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            booking={{ accommodationId: accommodation._id, checkIn, checkOut, guests, total }}
            onSuccess={handleCheckoutSuccess}
          />
        </aside>
      </div>
    </main>
  );
}
