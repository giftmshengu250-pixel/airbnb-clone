import { useState } from "react";
import { Link } from "react-router-dom";
import InspirationCard from "../components/InspirationCard";
import "./Home.css";

const inspirationPlaces = [
  { name: "New York", distance: "3h 45m flight", image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=600&q=80&auto=format&fit=crop" },
  { name: "Cape Town", distance: "2h 10m flight", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80&auto=format&fit=crop" },
  { name: "Paris", distance: "8h 30m flight", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80&auto=format&fit=crop" },
  { name: "Tokyo", distance: "11h 20m flight", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80&auto=format&fit=crop" },
];

const categories = [
  { label: "Beach", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M2 18c3-2 5-2 8 0s5 2 8 0'/><path d='M3 14c2.3-1.7 4.3-1.7 7 0s4.7 1.7 7 0'/><path d='M4 10c2.6-1 4.6-1 7 0s4.4 1 7 0'/><path d='M12 3v11'/></svg>" },
  { label: "City", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M4 20V8l8-4 8 4v12'/><path d='M9 20v-6h6v6M8 11h.01M16 11h.01'/></svg>" },
  { label: "Mountains", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M2 18l7-12 5 9 3-5 5 8H2z'/></svg>" },
  { label: "Countryside", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M3 20V8l9-5 9 5v12'/><path d='M7 12h10M7 16h10'/></svg>" },
  { label: "Lakefront", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M3 18c2.8-2.8 6-4.2 9-4.2s6.2 1.4 9 4.2'/><path d='M5 14l6-8 6 8'/><path d='M12 7v7'/></svg>" },
  { label: "Cabins", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M4 19V9l8-5 8 5v10'/><path d='M9 19v-5h6v5'/></svg>" },
  { label: "Amazing Views", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M3 19l7-7 4 4 7-9'/><path d='M15 7h6v6'/></svg>" },
  { label: "Tropical", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M12 3c3.5 0 6.5 3.1 6.5 7S15.5 18 12 18 5.5 14.9 5.5 10 8.5 3 12 3z'/><path d='M12 3v18'/></svg>" },
  { label: "Luxe", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M5 17h14l-1.2-6.8A2 2 0 0 0 15.9 9H8.1a2 2 0 0 0-2 1.2L5 17z'/><path d='M8 17v2M16 17v2M9 9V6h6v3'/></svg>" },
  { label: "Iconic Cities", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'><path d='M3 20V7l6-4 6 4v13M9 20V11h6v9'/><path d='M12 3v8'/></svg>" },
];

const getawayTabs = [
  { label: "This weekend", content: ["Cabins near you", "Beachfront stays", "Pet-friendly homes", "Unique stays"] },
  { label: "Next month", content: ["City breaks", "Mountain retreats", "Family-friendly homes"] },
  { label: "Later this year", content: ["Ski trips", "Tropical getaways", "Countryside escapes"] },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content-wrap">
          <div className="hero-content">
            <span className="hero-badge">Stay somewhere unforgettable</span>
            <h1>Find a place that feels like home, wherever you go.</h1>
            <p>Curated stays, city escapes, and weekend getaways designed for modern travellers.</p>
            <div className="hero-actions">
              <Link to="/locations" className="btn hero-btn">Start exploring</Link>
              <Link to="/saved" className="btn-outline ghost-btn">View saved homes</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="categories-bar" aria-label="Listing categories">
          {categories.map((category) => (
            <button
              key={category.label}
              type="button"
              className={`category-pill ${category.label === "Beach" ? "active" : ""}`}
            >
              <span className="category-icon" dangerouslySetInnerHTML={{ __html: category.icon }} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <h2 className="section-title">Inspiration for your next trip</h2>
        </div>
        <div className="grid grid-4">
          {inspirationPlaces.map((place) => (
            <InspirationCard key={place.name} {...place} />
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <h2 className="section-title">Explore your next escape</h2>
          <Link to="/locations" className="inline-link">Browse all stays</Link>
        </div>
        <div className="feature-grid">
          <div className="feature-card feature-card--large" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80&auto=format&fit=crop)" }}>
            <div className="feature-overlay" />
            <div className="feature-content">
              <span>Travel experiences</span>
              <h3>Things to do on your trip</h3>
              <Link to="/locations" className="btn">Explore experiences</Link>
            </div>
          </div>
          <div className="feature-card" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80&auto=format&fit=crop)" }}>
            <div className="feature-overlay" />
            <div className="feature-content">
              <span>Remote escapes</span>
              <h3>Stay somewhere peaceful</h3>
              <Link to="/locations" className="btn">Discover stays</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="promo-banner">
          <div className="promo-copy">
            <span className="pill">Airbnb-inspired travel</span>
            <h2>Give the gift of a memorable stay.</h2>
            <p>From coastal villas to mountain cabins — send inspiration that turns into unforgettable memories.</p>
            <button type="button" className="btn">Shop gift cards</button>
          </div>
          <img src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=700&q=80&auto=format&fit=crop" alt="Gift card" className="promo-image" />
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <h2 className="section-title">Inspiration for future getaways</h2>
        </div>
        <div className="tabs" role="tablist">
          {getawayTabs.map((tab, index) => (
            <button
              key={tab.label}
              role="tab"
              aria-selected={activeTab === index}
              className={`tab-btn ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ul className="tab-content-list" role="tabpanel">
          {getawayTabs[activeTab].content.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
