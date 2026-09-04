const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    type: { type: String, required: [true, "Accommodation type is required"] },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    guests: { type: Number, required: true, min: 1 },
    price: { type: Number, required: [true, "Price per night is required"], min: 0 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    weeklyDiscount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    occupancyTaxes: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accommodation", accommodationSchema);
