const Accommodation = require("../models/Accommodation");

// @route   POST /api/accommodations
// @desc    Create a new accommodation listing (admin/host only)
const createAccommodation = async (req, res) => {
  try {
    // Allow admins to create listings for any host by supplying `host` in the body.
    const hostId = req.user.role === "admin" && req.body.host ? req.body.host : req.user._id;
    const accommodation = await Accommodation.create({
      ...req.body,
      host: hostId,
    });
    res.status(201).json(accommodation);
  } catch (error) {
    res.status(400).json({ message: "Could not create accommodation", error: error.message });
  }
};

// @route   GET /api/accommodations
// @desc    Get all accommodations, optionally filtered by location (?location=New York)
const getAccommodations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: "i" };
    }
    const accommodations = await Accommodation.find(filter).sort({ createdAt: -1 });
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch accommodations", error: error.message });
  }
};

// @route   GET /api/accommodations/:id
// @desc    Get a single accommodation by id
const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.json(accommodation);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch accommodation", error: error.message });
  }
};

// @route   PUT /api/accommodations/:id
// @desc    Update an accommodation listing (admin/host only)
const updateAccommodation = async (req, res) => {
  try {
    const existing = await Accommodation.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    // Allow the host who owns the listing, or an admin, to update it
    if (existing.host.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this listing" });
    }

    const accommodation = await Accommodation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(accommodation);
  } catch (error) {
    res.status(400).json({ message: "Could not update accommodation", error: error.message });
  }
};

// @route   DELETE /api/accommodations/:id
// @desc    Delete an accommodation listing (admin/host only)
const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    // Allow the host who owns it or an admin to delete
    if (accommodation.host.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await accommodation.deleteOne();
    res.json({ message: "Accommodation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete accommodation", error: error.message });
  }
};

module.exports = {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
};
