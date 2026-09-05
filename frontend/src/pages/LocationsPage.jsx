import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getMockListings } from "../api/mockListings";
import LocationCard from "../components/LocationCard";
import "./LocationsPage.css";

const mapDetails = {
  "Cape Town": { label: "Cape Town coast", pins: ["Clifton", "V&A", "Table Mountain"] },
  "Johannesburg": { label: "Johannesburg city core", pins: ["Sandton", "Melville", "Rosebank"] },
  "New York": { label: "Manhattan & Brooklyn", pins: ["Central Park", "SoHo", "Brooklyn Heights"] },
  "Paris": { label: "Paris central districts", pins: ["Le Marais", "Louvre", "Montmartre"] },
  "Tokyo": { label: "Tokyo nightlife & culture", pins: ["Shibuya", "Asakusa", "Shinjuku"] },
};

const mergeListings = (realListings, mockListings) => {
  const merged = [...realListings, ...mockListings];
  const unique = new Map();

  merged.forEach((item) => {
    if (!item) return;
    const key = item._id || item.id || item.title || JSON.stringify(item);
    if (!unique.has(String(key))) {
      unique.set(String(key), item);
    }
  });

  return [...unique.values()];
};

export default function LocationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLocation = searchParams.get("location") || "All";

  const [locationInput, setLocationInput] = useState(activeLocation);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: "Any", maxPrice: 9000, bedrooms: 0, bathrooms: 0, amenity: "" });

  useEffect(() => { setLocationInput(activeLocation); }, [activeLocation]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const hasLocationFilter = activeLocation && activeLocation.toLowerCase() !== "all";
        const requestConfig = hasLocationFilter ? { params: { location: activeLocation } } : {};

        const { data } = await api.get("/accommodations", requestConfig);
        const realListings = Array.isArray(data) ? data : [];
        const fallbackLocation = activeLocation && activeLocation.toLowerCase() === "all" ? "" : activeLocation;
        const mockListings = getMockListings(fallbackLocation);

        if (!cancelled) {
          setAccommodations(mergeListings(realListings, mockListings));
          setLoading(false);
        }
        return;
      } catch (_) {}

      if (!cancelled) {
        const fallbackLocation = activeLocation && activeLocation.toLowerCase() === "all" ? "" : activeLocation;
        setAccommodations(getMockListings(fallbackLocation));
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

  const amenityOptions = useMemo(() => {
    const values = new Set();
    accommodations.forEach((acc) => {
      (acc.amenities || []).forEach((amenity) => values.add(amenity.toLowerCase()));
    });
    return [...values].slice(0, 10);
  }, [accommodations]);

  const filteredListings = useMemo(() => {
    return accommodations.filter((acc) => {
      const typeMatch = filters.type === "Any" || acc.type === filters.type || acc.type?.toLowerCase() === filters.type?.toLowerCase();
      const priceMatch = Number(acc.price || 0) <= Number(filters.maxPrice || 99999);
      const bedMatch = !filters.bedrooms || Number(acc.bedrooms || 0) >= Number(filters.bedrooms);
      const bathMatch = !filters.bathrooms || Number(acc.bathrooms || 0) >= Number(filters.bathrooms);
      const amenityMatch = !filters.amenity || (acc.amenities || []).some((item) => item.toLowerCase().includes(filters.amenity.toLowerCase()));
      return typeMatch && priceMatch && bedMatch && bathMatch && amenityMatch;
    });
  }, [accommodations, filters]);

  const locationMap = mapDetails[activeLocation] || { label: activeLocation, pins: ["City centre", "Waterfront", "Hillside"] };

  return (
    <main className="container section locations-page">
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

      <div className="location-page-header">
        <div>
          <p className="eyebrow">Explore stays</p>
          <h1 className="section-title">
            {loading ? "Finding stays…" : `${filteredListings.length} stay${filteredListings.length !== 1 ? "s" : ""} in ${activeLocation}`}
          </h1>
        </div>
        <button type="button" className="btn-outline" onClick={() => setShowFilters((prev) => !prev)}>
          {showFilters ? "Hide filters" : "Show filters"}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <label>
              <span>Property type</span>
              <select value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
                <option value="Any">Any</option>
                {Array.from(new Set(accommodations.map((acc) => acc.type).filter(Boolean))).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Max price</span>
              <input type="number" min="500" step="250" value={filters.maxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || 0 }))} />
            </label>
            <label>
              <span>Bedrooms</span>
              <input type="number" min="0" value={filters.bedrooms} onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: Number(e.target.value) || 0 }))} />
            </label>
            <label>
              <span>Bathrooms</span>
              <input type="number" min="0" value={filters.bathrooms} onChange={(e) => setFilters((prev) => ({ ...prev, bathrooms: Number(e.target.value) || 0 }))} />
            </label>
            <label className="filter-wide">
              <span>Featured amenity</span>
              <select value={filters.amenity} onChange={(e) => setFilters((prev) => ({ ...prev, amenity: e.target.value }))}>
                <option value="">Any amenity</option>
                {amenityOptions.map((amenity) => (
                  <option key={amenity} value={amenity}>{amenity}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="map-preview" aria-label="Approximate map browsing area">
        <div className="map-inner">
          <div className="map-surface" />
          {locationMap.pins.map((pin, index) => (
            <div key={pin} className={`map-pin pin-${index + 1}`}>
              <span>{pin}</span>
            </div>
          ))}
        </div>
        <div className="map-copy">
          <p className="eyebrow">Map view</p>
          <h2>{locationMap.label}</h2>
          <p>Explore nearby hotspots, beaches, and city areas without changing the underlying listing data.</p>
        </div>
      </div>

      {!loading && accommodations.length === 0 && (
        <p className="empty-state">No listings found for "{activeLocation}". Try another city.</p>
      )}

      {filteredListings.length === 0 && !loading && accommodations.length > 0 && (
        <p className="empty-state">No stays match these filters. Clear a filter or widen your price range.</p>
      )}

      <div className="location-grid">
        {filteredListings.map((acc) => (
          <LocationCard key={acc._id} accommodation={acc} />
        ))}
      </div>
    </main>
  );
}
