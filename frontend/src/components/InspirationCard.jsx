import { Link } from "react-router-dom";
import "./InspirationCard.css";

// Home Page: Inspiration for your next trip section (static location cards)
export default function InspirationCard({ name, distance, image }) {
  return (
    <Link to={`/locations?location=${encodeURIComponent(name)}`} className="inspiration-card">
      <img src={image} alt={name} />
      <p className="inspiration-name">{name}</p>
      <p className="inspiration-distance">{distance}</p>
    </Link>
  );
}
