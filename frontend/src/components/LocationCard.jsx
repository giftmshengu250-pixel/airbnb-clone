import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HeartFilledIcon, HeartIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import "./LocationCard.css";

const FALLBACK = "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80&auto=format&fit=crop";
const STORAGE_KEY = "airbnb_saved_listings";

function readSavedListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function LocationCard({ accommodation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = Array.isArray(accommodation.images) && accommodation.images.length > 0 ? accommodation.images : [FALLBACK];
  const itemId = accommodation._id || accommodation.id || accommodation.title;
  const saved = useMemo(() => readSavedListings().some((item) => (item._id || item.id || item.title) === itemId), [itemId]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const storage = readSavedListings();
    const existing = storage.filter((item) => (item._id || item.id || item.title) !== itemId);
    const next = saved ? existing : [...existing, accommodation];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("saved-listings-updated"));
  };

  const imageCount = images.length;

  return (
    <article className="location-card">
      <div className="location-card-visual">
        <button type="button" className={`favorite-btn ${saved ? "liked" : ""}`} onClick={toggleFavorite} aria-label={saved ? "Remove from saved" : "Save listing"}>
          {saved ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
        </button>

        <Link to={`/locations/${itemId}`} className="location-card-link" aria-label={accommodation.title}>
          <img
            className="location-card-img"
            src={images[currentIndex] || FALLBACK}
            alt={accommodation.title}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK; }}
          />
        </Link>

        {imageCount > 1 && (
          <>
            <div className="location-card-carousel">
              <button
                type="button"
                className="location-card-arrow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
                }}
                aria-label="Previous image"
              >
                <ChevronLeftIcon size={14} />
              </button>
              <button
                type="button"
                className="location-card-arrow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % imageCount);
                }}
                aria-label="Next image"
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>
            <div className="location-card-dots" aria-hidden="true">
              {images.map((_, index) => (
                <span key={`${itemId}-${index}`} className={`location-card-dot ${currentIndex === index ? "active" : ""}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <Link to={`/locations/${itemId}`} className="location-card-link" aria-label={accommodation.title}>
        <div className="location-card-body">
          <div className="location-card-head">
            <div>
              <p className="location-card-type">{accommodation.type}</p>
              <h3 className="location-card-title">{accommodation.title}</h3>
            </div>
          </div>
          <p className="location-card-meta">{accommodation.location}</p>
          {accommodation.amenities?.length > 0 && (
            <p className="location-card-amenities">{accommodation.amenities.slice(0, 3).join(" • ")}</p>
          )}
          <div className="location-card-footer">
            <span className="location-card-rating">
              <StarIcon size={12} className="star-icon" fill="currentColor" stroke="currentColor" />
              <span>{typeof accommodation.rating === "number" ? accommodation.rating.toFixed(2) : "New"}</span>
              {Number(accommodation.reviews || 0) > 0 && <span className="location-card-reviews">({accommodation.reviews})</span>}
            </span>
            <span className="location-card-price">
              <strong>R{Number(accommodation.price).toLocaleString()}</strong>
              <span className="location-card-night"> / night</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
