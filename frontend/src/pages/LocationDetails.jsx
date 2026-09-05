import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { MOCK_LISTINGS } from "../api/mockListings";
import { useAuth } from "../context/AuthContext";
import "./LocationDetails.css";
import CheckoutModal from "../components/CheckoutModal";
import { BedIcon, BathIcon, GuestsIcon, HeartFilledIcon, HeartIcon, StarIcon } from "../components/Icons";

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

const STORAGE_KEY = "airbnb_saved_listings";

function isRealMongoObjectId(value) {
  return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value.trim());
}

function readSavedListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
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
  const [reserveMessage, setReserveMessage] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchAccommodation = async () => {
      setLoading(true);

      try {
        const { data } = await api.get(`/accommodations/${id}`);
        setAccommodation(data);
        setLoading(false);
        return;
      } catch (_) {}

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
      } catch (_) {}

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

  useEffect(() => {
    if (!accommodation) return;
    const idKey = accommodation._id || accommodation.id || accommodation.title;
    setSaved(readSavedListings().some((item) => (item._id || item.id || item.title) === idKey));
  }, [accommodation]);

  if (loading) return <p className="container section">Loading...</p>;
  if (error || !accommodation) return <p className="container section error-text">{error || "Listing not found."}</p>;

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * accommodation.price;
  const discount = nights >= 7 ? (subtotal * (accommodation.weeklyDiscount || 0)) / 100 : 0;
  const total = subtotal - discount + accommodation.cleaningFee + accommodation.serviceFee + accommodation.occupancyTaxes;
  const images = accommodation.images?.length
    ? accommodation.images
    : Array(5).fill("https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=80&auto=format&fit=crop");

  const toggleSaved = () => {
    const list = readSavedListings();
    const key = accommodation._id || accommodation.id || accommodation.title;
    const filtered = list.filter((item) => (item._id || item.id || item.title) !== key);
    const next = saved ? filtered : [...filtered, accommodation];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved((prev) => !prev);
    window.dispatchEvent(new Event("saved-listings-updated"));
  };

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
    if (!isRealMongoObjectId(accommodation?._id)) {
      setCheckoutOpen(false);
      setReserveMessage("This listing is currently unavailable for booking.");
      return;
    }

    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setReserveMessage("Reservation confirmed! You can view it under My Reservations.");
  };

  return (
    <main className="container section details-page">
      <div className="details-header-row">
        <div>
          <p className="eyebrow">Stay details</p>
          <h1 className="details-heading">{accommodation.type} in {accommodation.location}</h1>
        </div>
        <button type="button" className={`favorite-toggle ${saved ? "active" : ""}`} onClick={toggleSaved}>
          {saved ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <p className="details-subheading">
        <StarIcon size={14} className="star-icon" fill="currentColor" stroke="currentColor" style={{ verticalAlign: "-1px", marginRight: "4px" }} />
        {accommodation.rating?.toFixed(1) || "New"} ({accommodation.reviews || 0} reviews) · {accommodation.location}
      </p>

      <div className="gallery">
        <img className="gallery-main" src={images[0]} alt={accommodation.title} />
        <div className="gallery-grid">
          {images.slice(1, 5).map((img, i) => (
            <img key={i} src={img} alt={`${accommodation.title} ${i + 2}`} />
          ))}
        </div>
      </div>

      <div className="details-columns">
        <div className="details-left">
          <section className="info-card">
            <div className="info-head">
              <div>
                <p className="eyebrow">Entire stay</p>
                <h2>{accommodation.title}</h2>
              </div>
            </div>
            <p className="details-description">{accommodation.description}</p>
            <div className="meta-row">
              <span><GuestsIcon size={16} /> {accommodation.guests} guests</span>
              <span><BedIcon size={16} /> {accommodation.bedrooms} bedrooms</span>
              <span><BathIcon size={16} /> {accommodation.bathrooms} bathrooms</span>
            </div>
          </section>

          <section className="info-card">
            <h3>Where you’ll sleep</h3>
            <p>{accommodation.bedrooms} bedroom(s) with comfortable bedding for up to {accommodation.guests} guests.</p>
          </section>

          <section className="info-card">
            <h3>What this place offers</h3>
            <ul className="amenities-list">
              {(accommodation.amenities?.length ? accommodation.amenities : ["Wifi", "Kitchen"]).map((a) => (
                <li key={a}>✓ {a}</li>
              ))}
            </ul>
          </section>

          <section className="info-card">
            <h3>Host details</h3>
            <p>Hosted by a verified local host with a strong guest reputation and fast response times.</p>
          </section>
        </div>

        <aside className="cost-calculator">
          <p className="cost-price">
            <strong>R{Number(accommodation.price).toLocaleString()}</strong> / night
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
              <input type="number" min="1" max={accommodation.guests} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </label>

            {nights > 0 && (
              <div className="cost-breakdown">
                <div className="cost-line">
                  <span>R{Number(accommodation.price).toLocaleString()} × {nights} nights</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="cost-line">
                    <span>Weekly discount</span>
                    <span>−R{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="cost-line">
                  <span>Cleaning fee</span>
                  <span>R{Number(accommodation.cleaningFee || 0).toFixed(2)}</span>
                </div>
                <div className="cost-line">
                  <span>Service fee</span>
                  <span>R{Number(accommodation.serviceFee || 0).toFixed(2)}</span>
                </div>
                <div className="cost-line">
                  <span>Occupancy taxes</span>
                  <span>R{Number(accommodation.occupancyTaxes || 0).toFixed(2)}</span>
                </div>
                <div className="cost-line cost-total">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn cost-reserve-btn">Reserve</button>
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
