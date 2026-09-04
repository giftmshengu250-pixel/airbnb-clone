import { useState } from "react";
import api from "../api/axios";
import "./ListingForm.css";

const emptyForm = {
  title: "",
  location: "",
  description: "",
  type: "Entire apartment",
  bedrooms: 1,
  bathrooms: 1,
  guests: 1,
  price: "",
  amenities: "",
  weeklyDiscount: 0,
  cleaningFee: 0,
  serviceFee: 0,
  occupancyTaxes: 0,
};

// Shared form used by both the Create Listing and Update Listing pages,
// so the two pages stay simple and don't repeat this code (per brief).
export default function ListingForm({ initialData, images: initialImages = [], onSubmit, submitLabel }) {
  const [form, setForm] = useState({
    ...emptyForm,
    ...initialData,
    amenities: initialData?.amenities?.join(", ") || "",
  });
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // The backend returns a relative path like /uploads/xyz.jpg
      const backendOrigin = api.defaults.baseURL.replace(/\/api\/?$/, "");
      setImages((prev) => [...prev, `${backendOrigin}${data.imageUrl}`]);
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.location || !form.description || !form.price) {
      setError("Please fill in title, location, description and price.");
      return;
    }
    if (images.length === 0) {
      setError("Please add at least one image.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        guests: Number(form.guests),
        price: Number(form.price),
        weeklyDiscount: Number(form.weeklyDiscount),
        cleaningFee: Number(form.cleaningFee),
        serviceFee: Number(form.serviceFee),
        occupancyTaxes: Number(form.occupancyTaxes),
        amenities: form.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        images,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save listing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="listing-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. New York" />
        </label>
        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option>Entire apartment</option>
            <option>Private room</option>
            <option>Entire house</option>
            <option>Shared room</option>
          </select>
        </label>
        <label>
          Price per night ($)
          <input name="price" type="number" min="0" value={form.price} onChange={handleChange} />
        </label>
        <label>
          Bedrooms
          <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} />
        </label>
        <label>
          Bathrooms
          <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} />
        </label>
        <label>
          Max guests
          <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} />
        </label>
        <label>
          Amenities (comma separated)
          <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="wifi, kitchen, free parking" />
        </label>
        <label>
          Weekly discount (%)
          <input name="weeklyDiscount" type="number" min="0" value={form.weeklyDiscount} onChange={handleChange} />
        </label>
        <label>
          Cleaning fee ($)
          <input name="cleaningFee" type="number" min="0" value={form.cleaningFee} onChange={handleChange} />
        </label>
        <label>
          Service fee ($)
          <input name="serviceFee" type="number" min="0" value={form.serviceFee} onChange={handleChange} />
        </label>
        <label>
          Occupancy taxes ($)
          <input name="occupancyTaxes" type="number" min="0" value={form.occupancyTaxes} onChange={handleChange} />
        </label>
      </div>

      <label className="form-full">
        Description
        <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
      </label>

      <div className="image-upload-section">
        <label className="upload-label">
          {uploading ? "Uploading..." : "+ Add image"}
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} hidden />
        </label>

        <div className="image-preview-list">
          {images.map((url, i) => (
            <div className="image-preview" key={url + i}>
              <img src={url} alt={`Listing ${i + 1}`} />
              <button type="button" onClick={() => removeImage(i)}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn" disabled={saving || uploading}>
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
