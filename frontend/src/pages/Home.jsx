import { useState } from "react";
import { Link } from "react-router-dom";
import InspirationCard from "../components/InspirationCard";
import "./Home.css";

// Real Unsplash photos — 1600px wide, landscape, travel/accommodation themed
const inspirationPlaces = [
  {
    name: "New York",
    distance: "3h 45m flight",
    image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Cape Town",
    distance: "2h 10m flight",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Paris",
    distance: "8h 30m flight",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Tokyo",
    distance: "11h 20m flight",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80&auto=format&fit=crop",
  },
];

const getawayTabs = [
  {
    label: "This weekend",
    content: ["Cabins near you", "Beachfront stays", "Pet-friendly homes", "Unique stays"],
  },
  {
    label: "Next month",
    content: ["City breaks", "Mountain retreats", "Family-friendly homes"],
  },
  {
    label: "Later this year",
    content: ["Ski trips", "Tropical getaways", "Countryside escapes"],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main>
      {/* ── Hero Banner ── */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Not sure where to go? Perfect.</h1>
          <p>Discover unique stays and experiences all around the world.</p>
          <Link to="/locations" className="btn hero-btn">
            Start exploring
          </Link>
        </div>
      </section>

      {/* ── Inspiration for your next trip ── */}
      <section className="section container">
        <h2 className="section-title">Inspiration for your next trip</h2>
        <div className="grid grid-4">
          {inspirationPlaces.map((place) => (
            <InspirationCard key={place.name} {...place} />
          ))}
        </div>
      </section>

      {/* ── Discover Airbnb Experiences ── */}
      <section className="section container">
        <h2 className="section-title">Discover Airbnb Experiences</h2>
        <div className="grid grid-2">
          <div
            className="experience-card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80&auto=format&fit=crop)",
            }}
          >
            <div className="experience-overlay" />
            <div className="experience-content">
              <h3>Things to do on your trip</h3>
              <Link to="/locations" className="btn">Explore experiences</Link>
            </div>
          </div>
          <div
            className="experience-card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80&auto=format&fit=crop)",
            }}
          >
            <div className="experience-overlay" />
            <div className="experience-content">
              <h3>Things to do at home</h3>
              <Link to="/locations" className="btn">Explore online experiences</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ShopAirbnb Section ── */}
      <section className="section container shop-section">
        <div className="shop-text">
          <h2>Give the gift of Airbnb</h2>
          <p>Send an Airbnb gift card straight to their inbox — the perfect last-minute present.</p>
          <button className="btn">Shop gift cards</button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&q=80&auto=format&fit=crop"
          alt="Airbnb gift cards"
          className="shop-image"
        />
      </section>

      {/* ── Future Getaways with tabs ── */}
      <section className="section container">
        <h2 className="section-title">Inspiration for future getaways</h2>
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
