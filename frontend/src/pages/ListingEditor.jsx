// Shared create/edit listing page used by both host (/host/new, /host/edit/:id)
// and admin (/admin/new, /admin/edit/:id).
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./ListingEditor.css";

const TYPES = ["Entire apartment", "Entire house", "Entire villa", "Private room", "Shared room", "Entire cottage", "Entire guesthouse"];

const EMPTY = {
  title: "", location: "", type: "Entire apartment", price: "",
  bedrooms: 1, bathrooms: 1, guests: 2,
  description: "", amenities: "",
  cleaningFee: 0, serviceFee: 0, occupancyTaxes: 0, weeklyDiscount: 0,
};

export default function ListingEditor({ returnTo = "/" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/accommodations/${id}`)
      .then(({ data }) => setForm({
        ...data,
        amenities: Array.isArray(data.amenities) ? data.amenities.join(", ") : data.amenities || "",
      }))
      .catch(() => setError("Could not load listing."));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.title || !form.location || !form.price) {
      setError("Title, location and price are required.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price:         Number(form.price),
      bedrooms:      Number(form.bedrooms),
      bathrooms:     Number(form.bathrooms),
      guests:        Number(form.guests),
      cleaningFee:   Number(form.cleaningFee),
      serviceFee:    Number(form.serviceFee),
      occupancyTaxes:Number(form.occupancyTaxes),
      weeklyDiscount:Number(form.weeklyDiscount),
      amenities:     form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await api.put(`/accommodations/${id}`, payload);
      } else {
        await api.post("/accommodations", payload);
      }
      setSuccess(isEdit ? "Listing updated!" : "Listing created!");
      setTimeout(() => navigate(returnTo), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save listing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="editor-page container section">
      <h1 className="editor-title">{isEdit ? "Edit Listing" : "Create New Listing"}</h1>

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-row">
          <div className="editor-field">
            <label>Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="Beachfront villa with pool" />
          </div>
          <div className="editor-field">
            <label>Location *</label>
            <input value={form.location} onChange={set("location")} placeholder="Cape Town" />
          </div>
        </div>

        <div className="editor-row">
          <div className="editor-field">
            <label>Type</label>
            <select value={form.type} onChange={set("type")}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="editor-field">
            <label>Price per night (R) *</label>
            <input type="number" min="0" value={form.price} onChange={set("price")} />
          </div>
        </div>

        <div className="editor-row">
          <div className="editor-field">
            <label>Bedrooms</label>
            <input type="number" min="1" value={form.bedrooms} onChange={set("bedrooms")} />
          </div>
          <div className="editor-field">
            <label>Bathrooms</label>
            <input type="number" min="1" value={form.bathrooms} onChange={set("bathrooms")} />
          </div>
          <div className="editor-field">
            <label>Max Guests</label>
            <input type="number" min="1" value={form.guests} onChange={set("guests")} />
          </div>
        </div>

        <div className="editor-field editor-field--full">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={set("description")} placeholder="Describe the space…" />
        </div>

        <div className="editor-field editor-field--full">
          <label>Amenities (comma-separated)</label>
          <input value={form.amenities} onChange={set("amenities")} placeholder="Wifi, Pool, Kitchen, Parking" />
        </div>

        <div className="editor-row">
          <div className="editor-field">
            <label>Cleaning fee (R)</label>
            <input type="number" min="0" value={form.cleaningFee} onChange={set("cleaningFee")} />
          </div>
          <div className="editor-field">
            <label>Service fee (R)</label>
            <input type="number" min="0" value={form.serviceFee} onChange={set("serviceFee")} />
          </div>
          <div className="editor-field">
            <label>Occupancy taxes (R)</label>
            <input type="number" min="0" value={form.occupancyTaxes} onChange={set("occupancyTaxes")} />
          </div>
          <div className="editor-field">
            <label>Weekly discount (%)</label>
            <input type="number" min="0" max="100" value={form.weeklyDiscount} onChange={set("weeklyDiscount")} />
          </div>
        </div>

        {error   && <p className="editor-error">{error}</p>}
        {success && <p className="editor-success">{success}</p>}

        <div className="editor-actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Listing" : "Create Listing"}
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate(returnTo)}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
