import { useEffect, useState } from "react";
import LocationCard from "../components/LocationCard";
import "./SavedPage.css";

const STORAGE_KEY = "airbnb_saved_listings";

function readSavedListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function SavedPage() {
  const [savedListings, setSavedListings] = useState([]);

  const refreshSavedListings = () => {
    setSavedListings(readSavedListings());
  };

  useEffect(() => {
    refreshSavedListings();
    window.addEventListener("saved-listings-updated", refreshSavedListings);
    return () => {
      window.removeEventListener("saved-listings-updated", refreshSavedListings);
    };
  }, []);

  return (
    <main className="container section saved-page">
      <div className="saved-header">
        <div>
          <p className="eyebrow">Your collection</p>
          <h1 className="section-title">Saved homes</h1>
        </div>
      </div>

      {savedListings.length === 0 ? (
        <div className="saved-empty">
          <h2>No saved homes yet</h2>
          <p>Start exploring stays and tap the heart icon to save places you love.</p>
        </div>
      ) : (
        <div className="saved-grid">
          {savedListings.map((listing) => {
            const key = listing._id || listing.id || listing.title;
            return <LocationCard key={key} accommodation={listing} />;
          })}
        </div>
      )}
    </main>
  );
}
