import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./ListingPages.css";

// View Listings Page: list of listings with key details + update/delete options
export default function ViewListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/accommodations");
      setListings(data);
    } catch (err) {
      setError("Could not load listings. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api.delete(`/accommodations/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete listing.");
    }
  };

  if (loading) return <p className="container section">Loading...</p>;

  return (
    <main className="container section">
      <div className="listings-header">
        <h1 className="section-title">Your listings</h1>
        <Link to="/listings/new" className="btn">
          + Create listing
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {!error && listings.length === 0 && <p>You haven't created any listings yet.</p>}

      <div className="listings-table-wrapper">
        {listings.length > 0 && (
          <table className="listings-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Location</th>
                <th>Price/night</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <img
                      className="listing-thumb"
                      src={listing.images?.[0] || "https://placehold.co/80x60?text=No+img"}
                      alt={listing.title}
                    />
                  </td>
                  <td>{listing.title}</td>
                  <td>{listing.location}</td>
                  <td>R{listing.price}</td>
                  <td className="listing-actions">
                    <Link to={`/listings/${listing._id}/edit`} className="btn-outline">
                      Update
                    </Link>
                    <button className="btn-danger" onClick={() => handleDelete(listing._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
