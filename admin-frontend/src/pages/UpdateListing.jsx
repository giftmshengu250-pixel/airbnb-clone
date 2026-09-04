import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ListingForm from "../components/ListingForm";
import "./ListingPages.css";

// Update Listing Page: pre-filled form with existing listing data
export default function UpdateListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/accommodations/${id}`);
        setListing(data);
      } catch (err) {
        setError("Could not load this listing.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleUpdate = async (payload) => {
    await api.put(`/accommodations/${id}`, payload);
    navigate("/listings");
  };

  if (loading) return <p className="container section">Loading...</p>;
  if (error || !listing) return <p className="container section error-text">{error || "Listing not found."}</p>;

  return (
    <main className="container section">
      <h1 className="section-title">Update listing</h1>
      <ListingForm
        initialData={listing}
        images={listing.images}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
      />
    </main>
  );
}
