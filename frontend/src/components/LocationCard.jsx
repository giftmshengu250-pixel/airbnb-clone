import { Link } from "react-router-dom";
import "./LocationCard.css";

const FALLBACK = "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80&auto=format&fit=crop";

export default function LocationCard({ accommodation }) {
  const {
    _id, title, location, type,
    amenities, rating, reviews,
    price, images,
  } = accommodation;

  const img = images?.[0] || FALLBACK;

  return (
    <Link to={`/locations/${_id}`} className="location-card" aria-label={title}>
      <div className="location-card-img-wrap">
        <img
          className="location-card-img"
          src={img}
          alt={title}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
      </div>
      <div className="location-card-body">
        <p className="location-card-type">{type}</p>
        <h3 className="location-card-title">{title}</h3>
        <p className="location-card-meta">{location}</p>
        {amenities?.length > 0 && (
          <p className="location-card-amenities">
            {amenities.slice(0, 3).join(" · ")}
          </p>
        )}
        <div className="location-card-footer">
          <span className="location-card-rating">
            ⭐ {typeof rating === "number" ? rating.toFixed(2) : "New"}
            {reviews > 0 && <span className="location-card-reviews"> ({reviews})</span>}
          </span>
          <span className="location-card-price">
            <strong>R{Number(price).toLocaleString()}</strong>
            <span className="location-card-night"> / night</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
