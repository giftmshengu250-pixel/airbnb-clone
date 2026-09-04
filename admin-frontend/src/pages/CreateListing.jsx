import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ListingForm from "../components/ListingForm";
import "./ListingPages.css";

// Create Listing Page: form with all required fields + image upload (per brief)
export default function CreateListing() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await api.post("/accommodations", payload);
    navigate("/listings");
  };

  return (
    <main className="container section">
      <h1 className="section-title">Create a new listing</h1>
      <ListingForm onSubmit={handleCreate} submitLabel="Create listing" />
    </main>
  );
}
