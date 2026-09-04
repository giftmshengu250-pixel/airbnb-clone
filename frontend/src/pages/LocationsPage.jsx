import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getMockListings } from "../api/mockListings";
import LocationCard from "../components/LocationCard";
import "./LocationsPage.css";

// Unwrap Tapline response — bare array or { data/listings/results/items: [] }
const extractListings = (raw) => {
  if (Array.isArray(raw))           return raw;
  if (Array.isArray(raw?.data))     return raw.data;
  if (Array.isArray(raw?.listings)) return raw.listings;
  if (Array.isArray(raw?.results))  return raw.results;
  if (Array.isArray(raw?.items))    return raw.items;
  return [];
};

// Normalise a Tapline item into our shape
const normalizeTapline = (t, fallbackLocation) => ({
  _id: t.id || t._id || `tap-${Math.random().toString(36).slice(2, 8)}`,
  title:     t.title     || t.name              || "Untitled listing",
  location:  t.location  || t.city              || fallbackLocation,
  type:      t.type      || t.roomType          || t.property_type || "Private room",
  amenities: t.amenities || t.facilities        || [],
  rating:    typeof t.rating === "number" ? t.rating : (t.starRating || 4.5),
  reviews:   t.reviews   || t.reviewCount       || t.review_count  || 0,
  price:     t.price     || t.pricePerNight      || t.nightly_price || 0,
  images: (
    t.images     ||
    t.photos     ||
    t.media      ||
    t.gallery    ||
    t.pictures   ||
    (t.image     ? [t.image]     : null) ||
    (t.picture   ? [t.picture]   : null) ||
    (t.thumbnail ? [t.thumbnail] : null) ||
    []
  ),
});

export default function LocationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLocation = searchParams.get("location") || "Cape Town";

  const [locationInput, setLocationInput] = useState(activeLocation);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [source, setSource]     = useState("");

  // Keep input in sync when URL changes (e.g. header search)
  useEffect(() => { setLocationInput(activeLocation); }, [activeLocation]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // ── 1. Try Tapline ──────────────────────────────────────────────────────
      try {
        const { data: raw } = await api.get("/tapline/listings", {
          params: { location: activeLocation },
        });
        const list = extractListings(raw);
        if (list.length > 0 && !cancelled) {
          setAccommodations(list.map((t) => normalizeTapline(t, activeLocation)));
          setSource("tapline");
          setLoading(false);
          return;
        }
      } catch (_) { /* fall through */ }

      // ── 2. Try local MongoDB ────────────────────────────────────────────────
      try {
        const { data } = await api.get("/accommodations", {
          params: { location: activeLocation },
        });
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0 && !cancelled) {
          setAccommodations(list);
          setSource("local");
          setLoading(false);
          return;
        }
      } catch (_) { /* fall through */ }

      // ── 3. Mock listings (always works) ────────────────────────────────────
      if (!cancelled) {
        setAccommodations(getMockListings(activeLocation));
        setSource("mock");
        setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [activeLocation]);

  const handleFilter = (e) => {
    e.preventDefault();
    if (locationInput.trim()) setSearchParams({ location: locationInput.trim() });
  };

  return (
    <main className="container section">
      {/* Search / filter bar */}
      <form className="location-filter" onSubmit={handleFilter}>
        <input
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Search a city e.g. Cape Town"
          aria-label="Location filter"
        />
        <button type="submit" className="btn">Search</button>
      </form>

      <h1 className="section-title">
        {loading
          ? "Finding stays…"
          : `${accommodations.length} stay${accommodations.length !== 1 ? "s" : ""} in ${activeLocation}`}
      </h1>

      {!loading && accommodations.length === 0 && (
        <p>No listings found for "{activeLocation}". Try another city.</p>
      )}

      <div className="location-grid">
        {accommodations.map((acc) => (
          <LocationCard key={acc._id} accommodation={acc} />
        ))}
      </div>
    </main>
  );
}
